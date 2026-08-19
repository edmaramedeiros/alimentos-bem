import express, { type NextFunction, type Request, type Response } from "express";
import { connectToWhatsApp, getQrDataUrl, getStatus } from "./whatsapp.js";
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

app.get("/internal/session/status", requireInternalApiKey, (_req, res) => {
  res.json(getStatus());
});

app.get("/internal/session/qr", requireInternalApiKey, async (_req, res) => {
  const qr = await getQrDataUrl();
  res.json({ qr });
});

app.listen(PORT, () => {
  console.log(`whatsapp-service ouvindo na porta ${PORT}`);
});

connectToWhatsApp().catch((err) => console.error("Falha ao iniciar conexão com o WhatsApp", err));
startBroadcastWorker();
