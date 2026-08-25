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
};

async function dispatchNextBroadcast(): Promise<void> {
  if (dispatching) return;

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
      `SELECT id, phone FROM whatsapp_broadcast_recipient WHERE broadcast_id = $1 AND status = 'QUEUED' ORDER BY created_at ASC`,
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
      // Se a conexao cair no meio do envio, para por aqui; o restante continua
      // QUEUED e sera retomado no proximo ciclo de polling assim que reconectar.
      if (!getStatus(vendedorId).connected) break;

      try {
        await sendCampaignMessage(vendedorId, recipient.phone, broadcast.message, attachment);
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
