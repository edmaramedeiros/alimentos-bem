-- A sessão do WhatsApp deixa de ser compartilhada por todo o negócio e passa a ser
-- uma sessão por vendedor(a) (cada usuário pode vincular seu próprio número).
-- A tabela está vazia neste momento (sessão anterior já havia sido desconectada),
-- por isso o TRUNCATE é seguro e não perde nenhum pareamento válido.
TRUNCATE whatsapp_session;

ALTER TABLE whatsapp_session DROP CONSTRAINT whatsapp_session_pkey;
ALTER TABLE whatsapp_session ADD COLUMN vendedor_id UUID NOT NULL REFERENCES app_user (id);
ALTER TABLE whatsapp_session ADD PRIMARY KEY (vendedor_id, key);
