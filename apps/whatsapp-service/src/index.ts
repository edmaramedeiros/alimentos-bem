import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// TODO (Marco 7): rotas internas /internal/session/qr, /internal/session/status,
// /internal/broadcasts/:id/dispatch, protegidas por header X-Internal-Api-Key,
// e integração Baileys com auth-state persistido no Postgres (ver docs/decisions).

app.listen(PORT, () => {
  console.log(`whatsapp-service ouvindo na porta ${PORT}`);
});
