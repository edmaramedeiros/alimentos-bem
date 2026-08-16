# 0002 — Comissão calculada no recebimento total, não no lançamento da venda

## Contexto

Pagar comissão no momento em que a venda é lançada criaria incentivo para o vendedor registrar vendas que nunca são efetivamente recebidas, e exigiria lógica de estorno em caso de cancelamento.

## Decisão

- Comissão só é calculada quando `sale.status` chega a `PAID` (recebimento total, ver ADR 0001 para o pagamento parcial ficar fora do MVP).
- Cálculo: `sale.commission_amount = sale.total_amount * sale.commission_rate_applied`, feito na mesma transação do registro do pagamento em `PaymentService`.
- A taxa usada é a travada na data da venda (`commission_rate_applied`), não a taxa atual do vendedor no momento do pagamento.

## Consequência

Um vendedor só ganha comissão sobre dinheiro que realmente entrou, e a taxa aplicada é sempre a que foi combinada no momento da venda, evitando disputas.
