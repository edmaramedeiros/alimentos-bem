-- Adiciona o estagio "aguardando entrega" antes de "aguardando pagamento" no ciclo da venda.
-- Vendas existentes com status PENDING (antigo "aguardando pagamento") sao migradas para
-- AWAITING_PAYMENT, preservando o significado: ja estao alem da etapa de entrega.

ALTER TABLE sale DROP CONSTRAINT IF EXISTS sale_status_check;

UPDATE sale SET status = 'AWAITING_PAYMENT' WHERE status = 'PENDING';

ALTER TABLE sale ALTER COLUMN status SET DEFAULT 'AWAITING_DELIVERY';

ALTER TABLE sale ADD CONSTRAINT sale_status_check
    CHECK (status IN ('AWAITING_DELIVERY', 'AWAITING_PAYMENT', 'PAID', 'CANCELLED'));
