import pino from "pino";
import { pool } from "./db.js";
import { getStatus, sendCampaignMessage } from "./whatsapp.js";

const logger = pino({ level: process.env.LOG_LEVEL ?? "warn" });

const POLL_INTERVAL_MS = 15_000;
let dispatching = false;

type BroadcastRow = {
  id: string;
  created_by: string;
  message: string;
  attachment_data: Buffer | null;
  attachment_file_name: string | null;
  attachment_mime_type: string | null;
  delay_seconds: number;
};

type RecipientRow = {
  id: string;
  phone: string;
  customer_name: string;
};

// Igual a mala direta do Word: {{nome}} na mensagem vira o primeiro nome do
// cliente na hora do envio (tolera espaços e maiúsculas/minúsculas: {{ Nome }}).
const NAME_PLACEHOLDER = /\{\{\s*nome\s*\}\}/gi;

function personalizeMessage(message: string, customerName: string): string {
  const firstName = customerName.trim().split(/\s+/)[0] ?? customerName;
  return message.replace(NAME_PLACEHOLDER, firstName);
}

// Campanhas só podem ser enviadas em horário comercial (segunda a sexta, 07h-17h,
// fuso de Cuiabá) para não incomodar clientes fora de hora. Fora da janela, o
// worker simplesmente não processa nada nesse ciclo - a campanha continua QUEUED
// e retoma sozinha assim que a janela reabrir.
const SEND_TIMEZONE = "America/Cuiaba";
const SEND_WINDOW_START_HOUR = 7;
const SEND_WINDOW_END_HOUR = 17;

function isWithinSendingWindow(date: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SEND_TIMEZONE,
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);

  const weekday = parts.find((p) => p.type === "weekday")?.value;
  const hour = Number(parts.find((p) => p.type === "hour")?.value);

  const isWeekday = weekday !== undefined && weekday !== "Sat" && weekday !== "Sun";
  const isWithinHours = hour >= SEND_WINDOW_START_HOUR && hour < SEND_WINDOW_END_HOUR;

  return isWeekday && isWithinHours;
}

async function dispatchNextBroadcast(): Promise<void> {
  if (dispatching) return;
  if (!isWithinSendingWindow()) return;

  const { rows: queued } = await pool.query<BroadcastRow>(
    `SELECT id, created_by, message, attachment_data, attachment_file_name, attachment_mime_type, delay_seconds
     FROM whatsapp_broadcast WHERE status = 'QUEUED' ORDER BY created_at ASC LIMIT 1`
  );
  if (queued.length === 0) return;

  const broadcast = queued[0];
  const vendedorId = broadcast.created_by;
  // Ainda nao conectada: espera o proximo ciclo em vez de falhar a campanha inteira.
  if (!getStatus(vendedorId).connected) return;

  dispatching = true;

  try {
    await pool.query("UPDATE whatsapp_broadcast SET status = 'SENDING', updated_at = now() WHERE id = $1", [broadcast.id]);

    const { rows: recipients } = await pool.query<RecipientRow>(
      `SELECT id, phone, customer_name FROM whatsapp_broadcast_recipient WHERE broadcast_id = $1 AND status = 'QUEUED' ORDER BY created_at ASC`,
      [broadcast.id]
    );

    const attachment =
      broadcast.attachment_data && broadcast.attachment_file_name && broadcast.attachment_mime_type
        ? {
            data: broadcast.attachment_data,
            fileName: broadcast.attachment_file_name,
            mimeType: broadcast.attachment_mime_type,
          }
        : undefined;

    for (const recipient of recipients) {
      // Se a conexao cair, ou a janela de horario comercial fechar, no meio do
      // envio, para por aqui; o restante continua QUEUED e sera retomado no
      // proximo ciclo de polling.
      if (!getStatus(vendedorId).connected) break;
      if (!isWithinSendingWindow()) break;

      try {
        const message = personalizeMessage(broadcast.message, recipient.customer_name);
        await sendCampaignMessage(vendedorId, recipient.phone, message, attachment);
        await pool.query(
          "UPDATE whatsapp_broadcast_recipient SET status = 'SENT', sent_at = now(), updated_at = now() WHERE id = $1",
          [recipient.id]
        );
      } catch (err) {
        logger.error(err, `Falha ao enviar para ${recipient.phone}`);
        await pool.query(
          "UPDATE whatsapp_broadcast_recipient SET status = 'FAILED', error_message = $2, updated_at = now() WHERE id = $1",
          [recipient.id, err instanceof Error ? err.message : String(err)]
        );
      }

      // Atraso configurado pela campanha + variacao aleatoria (0-2s) para reduzir
      // o risco de deteccao de spam/banimento do numero.
      const jitterMs = Math.random() * 2000;
      await new Promise((resolve) => setTimeout(resolve, broadcast.delay_seconds * 1000 + jitterMs));
    }

    const { rows: remaining } = await pool.query(
      "SELECT count(*)::int AS count FROM whatsapp_broadcast_recipient WHERE broadcast_id = $1 AND status = 'QUEUED'",
      [broadcast.id]
    );
    const finalStatus = remaining[0].count > 0 ? "QUEUED" : "DONE";
    await pool.query("UPDATE whatsapp_broadcast SET status = $2, updated_at = now() WHERE id = $1", [
      broadcast.id,
      finalStatus,
    ]);
  } catch (err) {
    logger.error(err, `Falha ao processar campanha ${broadcast.id}`);
    await pool.query("UPDATE whatsapp_broadcast SET status = 'FAILED', updated_at = now() WHERE id = $1", [broadcast.id]);
  } finally {
    dispatching = false;
  }
}

export function startBroadcastWorker(): void {
  setInterval(() => {
    dispatchNextBroadcast().catch((err) => logger.error(err, "Erro no ciclo do worker de campanhas"));
  }, POLL_INTERVAL_MS);
}
