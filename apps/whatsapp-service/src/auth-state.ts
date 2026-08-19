import { BufferJSON, initAuthCreds, type AuthenticationCreds, type AuthenticationState, type SignalDataTypeMap } from "@whiskeysockets/baileys";
import type { Pool } from "pg";

// Estado de autenticacao do Baileys persistido no Postgres (tabela whatsapp_session),
// em vez de arquivo local, porque o disco do Render (free tier) e efemero e perderiamos
// a sessao pareada a cada deploy/restart.

async function readValue(pool: Pool, key: string): Promise<unknown> {
  const result = await pool.query("SELECT value FROM whatsapp_session WHERE key = $1", [key]);
  if (result.rowCount === 0) return null;
  return JSON.parse(result.rows[0].value, BufferJSON.reviver);
}

async function writeValue(pool: Pool, key: string, value: unknown): Promise<void> {
  const serialized = JSON.stringify(value, BufferJSON.replacer);
  await pool.query(
    `INSERT INTO whatsapp_session (key, value, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, serialized]
  );
}

async function deleteValue(pool: Pool, key: string): Promise<void> {
  await pool.query("DELETE FROM whatsapp_session WHERE key = $1", [key]);
}

export async function usePostgresAuthState(pool: Pool): Promise<{
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
}> {
  const storedCreds = await readValue(pool, "creds");
  const creds: AuthenticationCreds = (storedCreds as AuthenticationCreds) ?? initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [id: string]: SignalDataTypeMap[typeof type] } = {};
          await Promise.all(
            ids.map(async (id) => {
              const value = await readValue(pool, `${type}-${id}`);
              if (value !== null) {
                data[id] = value as SignalDataTypeMap[typeof type];
              }
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks: Promise<void>[] = [];
          for (const type of Object.keys(data) as (keyof SignalDataTypeMap)[]) {
            for (const id of Object.keys(data[type] ?? {})) {
              const value = data[type]?.[id];
              tasks.push(value ? writeValue(pool, `${type}-${id}`, value) : deleteValue(pool, `${type}-${id}`));
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: () => writeValue(pool, "creds", creds),
  };
}
