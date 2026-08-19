import makeWASocket, { DisconnectReason, type WASocket } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import QRCode from "qrcode";
import { pool } from "./db.js";
import { usePostgresAuthState } from "./auth-state.js";

const logger = pino({ level: process.env.LOG_LEVEL ?? "warn" });

let socket: WASocket | null = null;
let latestQr: string | null = null;
let connected = false;
let connectedPhoneNumber: string | null = null;

export async function connectToWhatsApp(): Promise<void> {
  const { state, saveCreds } = await usePostgresAuthState(pool);

  socket = makeWASocket({
    auth: state,
    logger,
    browser: ["Edmara Medeiros", "Chrome", "1.0.0"],
  });

  socket.ev.on("creds.update", saveCreds);

  socket.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      latestQr = qr;
    }

    if (connection === "open") {
      connected = true;
      latestQr = null;
      connectedPhoneNumber = socket?.user?.id?.split(":")[0] ?? null;
      logger.info("WhatsApp conectado");
    }

    if (connection === "close") {
      connected = false;
      connectedPhoneNumber = null;
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      logger.warn({ statusCode }, "WhatsApp desconectado");
      if (shouldReconnect) {
        connectToWhatsApp().catch((err) => logger.error(err, "Falha ao reconectar"));
      } else {
        latestQr = null;
      }
    }
  });
}

export function getStatus(): { connected: boolean; phoneNumber: string | null; waitingForQr: boolean } {
  return { connected, phoneNumber: connectedPhoneNumber, waitingForQr: !connected && latestQr !== null };
}

export async function getQrDataUrl(): Promise<string | null> {
  if (!latestQr) return null;
  return QRCode.toDataURL(latestQr);
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
  phone: string,
  message: string,
  attachment?: { data: Buffer; fileName: string; mimeType: string }
): Promise<void> {
  if (!socket || !connected) {
    throw new Error("WhatsApp não está conectado");
  }

  const jid = await resolveJid(socket, phone);

  if (!attachment) {
    await socket.sendMessage(jid, { text: message });
    return;
  }

  if (attachment.mimeType.startsWith("image/")) {
    await socket.sendMessage(jid, { image: attachment.data, caption: message });
    return;
  }

  await socket.sendMessage(jid, {
    document: attachment.data,
    fileName: attachment.fileName,
    mimetype: attachment.mimeType,
    caption: message,
  });
}
