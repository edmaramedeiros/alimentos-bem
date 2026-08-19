CREATE TABLE whatsapp_broadcast (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message               TEXT         NOT NULL,
    attachment_data       BYTEA,
    attachment_file_name  VARCHAR(255),
    attachment_mime_type  VARCHAR(100),
    city_filter           VARCHAR(120),
    name_filter           VARCHAR(120),
    delay_seconds         INTEGER      NOT NULL DEFAULT 5,
    status                VARCHAR(20)  NOT NULL DEFAULT 'QUEUED'
                              CHECK (status IN ('QUEUED', 'SENDING', 'DONE', 'FAILED')),
    created_by            UUID         NOT NULL REFERENCES app_user (id),
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE whatsapp_broadcast_recipient (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broadcast_id   UUID         NOT NULL REFERENCES whatsapp_broadcast (id) ON DELETE CASCADE,
    customer_id    UUID         NOT NULL REFERENCES customer (id),
    customer_name  VARCHAR(255) NOT NULL,
    phone          VARCHAR(30)  NOT NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'QUEUED'
                       CHECK (status IN ('QUEUED', 'SENT', 'FAILED')),
    error_message  TEXT,
    sent_at        TIMESTAMPTZ,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_broadcast_recipient_broadcast ON whatsapp_broadcast_recipient (broadcast_id);
CREATE INDEX idx_broadcast_recipient_status ON whatsapp_broadcast_recipient (status);
CREATE INDEX idx_whatsapp_broadcast_status ON whatsapp_broadcast (status);

-- Estado de autenticacao do Baileys (creds + chaves de sessao), persistido aqui
-- em vez de arquivo local porque o disco do Render (free tier) e efemero.
CREATE TABLE whatsapp_session (
    key         VARCHAR(255) PRIMARY KEY,
    value       TEXT         NOT NULL,
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
