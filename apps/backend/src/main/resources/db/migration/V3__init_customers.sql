CREATE TABLE customer (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              VARCHAR(150) NOT NULL,
    phone             VARCHAR(30),
    email             VARCHAR(180),
    address_line      VARCHAR(200),
    city              VARCHAR(100),
    state             VARCHAR(2),
    zip               VARCHAR(15),
    notes             TEXT,
    active            BOOLEAN     NOT NULL DEFAULT TRUE,
    whatsapp_opt_in   BOOLEAN     NOT NULL DEFAULT FALSE,
    owner_vendedor_id UUID        NOT NULL REFERENCES app_user (id),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_customer_owner ON customer (owner_vendedor_id);
