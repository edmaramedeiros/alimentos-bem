import express, { type NextFunction, type Request, type Response } from "express";
import { disconnectWhatsApp, ensureConnection, getQrDataUrl, getStatus, reconnectExistingSessions } from "./whatsapp.js";
import { startBroadcastWorker } from "./broadcast-worker.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? "";

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

function requireInternalApiKey(req: Request, res: Response, next: NextFunction) {
  const provided = req.header("X-Internal-Api-Key");
  if (!INTERNAL_API_KEY || provided !== INTERNAL_API_KEY) {
    res.status(401).json({ error: "Chave de API interna inválida" });
    return;
  }
  next();
}

app.get("/internal/session/:vendedorId/status", requireInternalApiKey, async (req, res) => {
  await ensureConnection(req.params.vendedorId);
  res.json(getStatus(req.params.vendedorId));
});

app.get("/internal/session/:vendedorId/qr", requireInternalApiKey, async (req, res) => {
  await ensureConnection(req.params.vendedorId);
  const qr = await getQrDataUrl(req.params.vendedorId);
  res.json({ qr });
});

app.post("/internal/session/:vendedorId/logout", requireInternalApiKey, async (req, res) => {
  try {
    await disconnectWhatsApp(req.params.vendedorId);
    res.json({ ok: true });
  } catch (err) {
    console.error("Falha ao desconectar WhatsApp", err);
    res.status(500).json({ error: "Falha ao desconectar" });
  }
});

app.listen(PORT, () => {
  console.log(`whatsapp-service ouvindo na porta ${PORT}`);
});

reconnectExistingSessions().catch((err) => console.error("Falha ao reconectar sessões existentes", err));
startBroadcastWorker();
