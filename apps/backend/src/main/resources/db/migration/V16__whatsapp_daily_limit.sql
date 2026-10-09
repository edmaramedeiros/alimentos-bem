-- Configuracao global do limite diario de contatos NOVOS por vendedor que podem
-- receber mensagem de campanha no mesmo dia (linha unica, igual cashback_config).
-- Um contato que ja recebeu mensagem no dia nao conta de novo contra esse limite.
CREATE TABLE whatsapp_daily_limit_config (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_contact_limit  INTEGER     NOT NULL,
    updated_by           UUID        NOT NULL REFERENCES app_user (id),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
