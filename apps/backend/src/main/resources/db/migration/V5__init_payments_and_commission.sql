CREATE TABLE commission_rate_history (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendedor_id    UUID        NOT NULL REFERENCES app_user (id),
    rate           NUMERIC(5, 2) NOT NULL,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to   TIMESTAMPTZ,
    created_by     UUID        NOT NULL REFERENCES app_user (id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_commission_rate_vendedor ON commission_rate_history (vendedor_id);

-- Garante no maximo uma taxa "vigente" (effective_to IS NULL) por vendedor.
CREATE UNIQUE INDEX uq_commission_rate_current ON commission_rate_history (vendedor_id) WHERE effective_to IS NULL;

-- Taxa travada no momento da venda (ADR 0001/0002) e status/valor da comissao,
-- calculados apenas quando a venda e totalmente recebida (ver payment abaixo).
ALTER TABLE sale ADD COLUMN commission_rate_applied NUMERIC(5, 2);
ALTER TABLE sale ADD COLUMN commission_amount NUMERIC(10, 2);
ALTER TABLE sale ADD COLUMN commission_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (commission_status IN ('PENDING', 'EARNED'));

CREATE TABLE payment (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id        UUID        NOT NULL REFERENCES sale (id),
    amount         NUMERIC(10, 2) NOT NULL,
    payment_date   TIMESTAMPTZ NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('DINHEIRO', 'PIX', 'CARTAO', 'TRANSFERENCIA', 'OUTRO')),
    registered_by  UUID        NOT NULL REFERENCES app_user (id),
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_sale ON payment (sale_id);
