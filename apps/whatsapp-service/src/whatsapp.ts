import makeWASocket, { DisconnectReason, type WASocket } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import QRCode from "qrcode";
import { pool } from "./db.js";
import { listVendedorIdsWithSession, usePostgresAuthState } from "./auth-state.js";

const logger = pino({ level: process.env.LOG_LEVEL ?? "warn" });

type ConnectionState = {
  socket: WASocket | null;
  latestQr: string | null;
  connected: boolean;
  connectedPhoneNumber: string | null;
};

// Uma conexão Baileys por vendedor_id: cada usuário vincula seu próprio número.
const connections = new Map<string, ConnectionState>();

function getOrCreateState(vendedorId: string): ConnectionState {
  let state = connections.get(vendedorId);
  if (!state) {
    state = { socket: null, latestQr: null, connected: false, connectedPhoneNumber: null };
    connections.set(vendedorId, state);
  }
  return state;
}

export async function connectToWhatsApp(vendedorId: string): Promise<void> {
  const connectionState = getOrCreateState(vendedorId);
  const { state, saveCreds } = await usePostgresAuthState(pool, vendedorId);

  const socket = makeWASocket({
    auth: state,
    logger,
    browser: ["Edmara Medeiros", "Chrome", "1.0.0"],
  });
  connectionState.socket = socket;

  socket.ev.on("creds.update", saveCreds);

  socket.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      connectionState.latestQr = qr;
    }

    if (connection === "open") {
      connectionState.connected = true;
      connectionState.latestQr = null;
      connectionState.connectedPhoneNumber = socket?.user?.id?.split(":")[0] ?? null;
      logger.info({ vendedorId }, "WhatsApp conectado");
    }

    if (connection === "close") {
      connectionState.connected = false;
      connectionState.connectedPhoneNumber = null;
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      logger.warn({ vendedorId, statusCode }, "WhatsApp desconectado");
      if (shouldReconnect) {
        connectToWhatsApp(vendedorId).catch((err) => logger.error(err, "Falha ao reconectar"));
      } else {
        connectionState.latestQr = null;
      }
    }
  });
}

/** Garante que existe (ao menos) uma tentativa de conexão em andamento para essa vendedora. */
export async function ensureConnection(vendedorId: string): Promise<void> {
  if (!connections.has(vendedorId)) {
    await connectToWhatsApp(vendedorId);
  }
}

/** Reconecta, no boot do serviço, todas as vendedoras que já têm uma sessão pareada salva. */
export async function reconnectExistingSessions(): Promise<void> {
  const vendedorIds = await listVendedorIdsWithSession(pool);
  for (const vendedorId of vendedorIds) {
    connectToWhatsApp(vendedorId).catch((err) => logger.error({ vendedorId, err }, "Falha ao reconectar sessão existente"));
  }
}

export function getStatus(vendedorId: string): { connected: boolean; phoneNumber: string | null; waitingForQr: boolean } {
  const state = connections.get(vendedorId);
  if (!state) {
    return { connected: false, phoneNumber: null, waitingForQr: false };
  }
  return {
    connected: state.connected,
    phoneNumber: state.connectedPhoneNumber,
    waitingForQr: !state.connected && state.latestQr !== null,
  };
}

export async function getQrDataUrl(vendedorId: string): Promise<string | null> {
  const state = connections.get(vendedorId);
  if (!state?.latestQr) return null;
  return QRCode.toDataURL(state.latestQr);
}

export async function disconnectWhatsApp(vendedorId: string): Promise<void> {
  const state = connections.get(vendedorId);
  if (state?.socket) {
    try {
      await state.socket.logout();
    } catch (err) {
      logger.warn(err, "Falha ao fazer logout no WhatsApp (prosseguindo com limpeza local)");
    }
    // Sem isso, os listeners do socket antigo continuam ativos e um evento atrasado
    // (ex.: o "close" do logout chegando depois de já termos aberto o socket novo)
    // pode sobrescrever o estado da nova conexão com dados obsoletos.
    state.socket.ev.removeAllListeners("connection.update");
    state.socket.ev.removeAllListeners("creds.update");
  }
  connections.delete(vendedorId);
  await pool.query("DELETE FROM whatsapp_session WHERE vendedor_id = $1", [vendedorId]);
  await connectToWhatsApp(vendedorId);
}

function toPhoneNumber(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (!digits.startsWith("55") && (digits.length === 10 || digits.length === 11)) {
    digits = `55${digits}`;
  }
  return `+${digits}`;
}

async function resolveJid(socketRef: WASocket, phone: string): Promise<string> {
  const phoneNumber = toPhoneNumber(phone);
  // Manda direto pro JID construido a partir do numero costumava bastar, mas o WhatsApp
  // migrou boa parte do endereçamento para LIDs: sem confirmar via onWhatsApp, o envio
  // "funciona" (sendMessage nao lanca erro) mas a mensagem nunca chega no destinatario.
  const results = await socketRef.onWhatsApp(phoneNumber);
  const match = results?.find((r) => r.exists);
  if (!match) {
    throw new Error(`Número ${phone} não está registrado no WhatsApp`);
  }
  return match.jid;
}

export async function sendCampaignMessage(
  vendedorId: string,
  phone: string,
  message: string,
  attachment?: { data: Buffer; fileName: string; mimeType: string }
): Promise<void> {
  const state = connections.get(vendedorId);
  if (!state?.socket || !state.connected) {
    throw new Error("WhatsApp não está conectado");
  }

  const jid = await resolveJid(state.socket, phone);

  if (!attachment) {
    await state.socket.sendMessage(jid, { text: message });
    return;
  }

  if (attachment.mimeType.startsWith("image/")) {
    await state.socket.sendMessage(jid, { image: attachment.data, caption: message });
    return;
  }

  await state.socket.sendMessage(jid, {
    document: attachment.data,
    fileName: attachment.fileName,
    mimetype: attachment.mimeType,
    caption: message,
  });
}
