CREATE TABLE sale (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendedor_id  UUID        NOT NULL REFERENCES app_user (id),
    customer_id  UUID        NOT NULL REFERENCES customer (id),
    sale_date    TIMESTAMPTZ NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'CANCELLED')),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sale_vendedor ON sale (vendedor_id);
CREATE INDEX idx_sale_customer ON sale (customer_id);

CREATE TABLE sale_item (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id                  UUID        NOT NULL REFERENCES sale (id),
    product_id               UUID        NOT NULL REFERENCES product (id),
    product_price_history_id UUID        NOT NULL REFERENCES product_price_history (id),
    quantity                 NUMERIC(10, 3) NOT NULL,
    unit_price               NUMERIC(10, 2) NOT NULL,
    subtotal                 NUMERIC(10, 2) NOT NULL,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sale_item_sale ON sale_item (sale_id);
