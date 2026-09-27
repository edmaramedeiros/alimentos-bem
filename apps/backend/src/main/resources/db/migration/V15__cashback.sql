-- Configuracao global de cashback (percentual e validade). Linha unica: quem le
-- pega a mais recente; a UI de admin so precisa saber ler/gravar essa uma linha.
CREATE TABLE cashback_config (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    percentage     NUMERIC(5, 2) NOT NULL,
    validity_days  INTEGER       NOT NULL,
    updated_by     UUID          NOT NULL REFERENCES app_user (id),
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Percentual/validade travados no momento da venda (mesmo padrao do lock de preco
-- e da taxa de comissao), e valor/validade calculados apenas quando a venda e paga.
ALTER TABLE sale ADD COLUMN generates_cashback BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE sale ADD COLUMN cashback_percentage_applied NUMERIC(5, 2);
ALTER TABLE sale ADD COLUMN cashback_validity_days_applied INTEGER;
ALTER TABLE sale ADD COLUMN cashback_amount NUMERIC(10, 2);
ALTER TABLE sale ADD COLUMN cashback_expires_at DATE;

CREATE INDEX idx_sale_customer_cashback ON sale (customer_id) WHERE generates_cashback = TRUE;
