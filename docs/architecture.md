# Arquitetura

Cópia de trabalho do plano aprovado para este projeto (fonte original: `C:\Users\Leandro\.claude\plans\wondrous-honking-neumann.md`). Mantenha este arquivo atualizado conforme decisões mudarem.

## Stack

- **Frontend**: React Native + Expo Router. Uma base de código para web (`react-native-web`, deploy no Vercel) e Android (APK via EAS Build).
- **Backend**: Java 21 + Spring Boot 4 + Spring Data JPA/Hibernate + Spring Security (JWT) + Flyway. REST API.
- **WhatsApp**: serviço Node/TypeScript separado (`apps/whatsapp-service`) usando Baileys (não-oficial), chamado internamente pelo backend.
- **Banco**: PostgreSQL (Neon, free tier, endpoint pooled).
- **Hospedagem**: frontend no Vercel; backend e whatsapp-service no Render (free tier, com cold-start).

## Decisões de negócio confirmadas

- Admin também lança vendas próprias e recebe comissão como uma vendedora.
- Clientes são privados por vendedor (`customer.owner_vendedor_id`); admin vê todos.
- Preço e taxa de comissão são sempre travados no momento da venda (nunca retroativos).
- Erro de preço numa venda → cancelar e relançar, nunca editar o item.
- Pagamento parcial: schema pronto desde o início (tabela `payment` 1-N), mas MVP só tem "marcar como recebido" (pagamento total).
- Comissão é calculada quando a venda atinge `PAID` (recebimento total), usando a taxa vigente na data da venda.

## Modelo de dados (visão geral)

`app_user`, `product`, `product_price_history`, `customer`, `sale`, `sale_item`, `payment`, `commission_rate_history`, `whatsapp_broadcast` / `whatsapp_broadcast_recipient`.

Detalhes de campos e relacionamentos: ver seção 2 do plano original.

## Ordem de construção

0. Scaffolding (este commit) → 1. Auth+usuários → 2. Produtos+preços → 3. Clientes → 4. Vendas → 5. Pagamentos+comissão → 6. Deploy → 7. WhatsApp → 8. Polimento.

## Decisões arquiteturais detalhadas

Ver `docs/decisions/`.
