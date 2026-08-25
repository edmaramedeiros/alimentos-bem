ALTER TABLE customer ADD COLUMN grupo VARCHAR(150);

CREATE TABLE expense (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creditor_name       VARCHAR(150) NOT NULL,
    category            VARCHAR(20) NOT NULL CHECK (category IN ('MATERIA_PRIMA', 'SUPRIMENTOS', 'LOGISTICA', 'TAXAS')),
    expense_date        DATE NOT NULL,
    paying_company_name VARCHAR(150) NOT NULL,
    created_by          UUID NOT NULL REFERENCES app_user (id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expense_date ON expense (expense_date);
