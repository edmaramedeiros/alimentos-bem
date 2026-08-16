# 0001 — Lock de preço e taxa de comissão no momento da venda

## Contexto

O preço de um produto e a taxa de comissão de um vendedor mudam ao longo do tempo. Uma venda lançada hoje precisa continuar mostrando o valor correto mesmo que o preço do produto ou a taxa de comissão mudem depois.

## Decisão

- `product_price_history` e `commission_rate_history` guardam o histórico completo (`effective_from`/`effective_to`), nunca sobrescrevem.
- Ao criar uma venda, `sale_item.product_price_history_id` e `sale.commission_rate_applied` travam, respectivamente, o preço e a taxa vigentes naquele momento.
- Mudanças futuras de preço/comissão nunca alteram vendas já criadas.
- Corrigir um erro de preço numa venda lançada = cancelar a venda (`status = CANCELLED`) e lançar uma nova. Não existe edição manual de preço num item já lançado.

## Consequência

Relatórios de faturamento e comissão são sempre auditáveis e reprodutíveis a partir do histórico, mesmo depois de dezenas de mudanças de preço.
