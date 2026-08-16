CREATE TABLE product (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(150) NOT NULL,
    sku           VARCHAR(60),
    description   TEXT,
    unit          VARCHAR(30) NOT NULL,
    active        BOOLEAN     NOT NULL DEFAULT TRUE,
    current_price NUMERIC(10, 2),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_product_sku UNIQUE (sku)
);

CREATE TABLE product_price_history (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id     UUID        NOT NULL REFERENCES product (id),
    price          NUMERIC(10, 2) NOT NULL,
    effective_from TIMESTAMPTZ NOT NULL,
    effective_to   TIMESTAMPTZ,
    created_by     UUID        NOT NULL REFERENCES app_user (id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_price_history_product ON product_price_history (product_id);

-- Garante no máximo uma linha "vigente" (effective_to IS NULL) por produto.
CREATE UNIQUE INDEX uq_price_history_current ON product_price_history (product_id) WHERE effective_to IS NULL;
