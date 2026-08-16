# 0003 — Sessão do Baileys persistida em Postgres, não em disco

## Contexto

Baileys (biblioteca WhatsApp não-oficial) por padrão salva a sessão autenticada (`useMultiFileAuthState`) em arquivos locais. O Render free tier tem disco efêmero: qualquer reinício, deploy ou "acordar" do serviço após inatividade apagaria a sessão, forçando reescanear o QR code toda vez — inviável para um serviço que passa a maior parte do tempo dormindo no free tier.

## Decisão

Implementar um adaptador customizado do `AuthenticationState` do Baileys que lê/escreve `creds` e `keys` numa tabela Postgres (`whatsapp_session`) em vez de arquivos, usando o mesmo banco já provisionado para o backend (Neon). Alternativa descartada: armazenamento de objeto externo (S3-compatible) — desnecessário já que o Postgres já está disponível e o volume de dados da sessão é pequeno.

## Consequência

O serviço `whatsapp-service` pode dormir e acordar no Render livremente sem perder o pareamento com o WhatsApp, desde que o restante da lógica de leitura/escrita do adaptador esteja correta (peça de maior risco técnico do projeto — ver Marco 7).
