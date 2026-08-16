# Edmara Alimentos — Sistema de Vendas e Recebimentos

Sistema interno para a Edmara Medeiros (alimentos do bem) controlar vendas, recebimentos e comissão de vendedores, com um app único (web + Android) e integração de campanhas via WhatsApp.

Arquitetura completa e decisões de projeto em [`docs/architecture.md`](docs/architecture.md) e no plano original salvo em `C:\Users\Leandro\.claude\plans\wondrous-honking-neumann.md`.

## Estrutura

```
apps/
  mobile/            Expo (React Native + react-native-web) - web e APK Android
  backend/            Spring Boot (Java 21) - API REST
  whatsapp-service/   Node/TypeScript + Baileys - worker de campanhas WhatsApp
docs/
  decisions/           ADRs curtas (lock de preço, comissão, sessão WhatsApp)
infra/
  render.yaml           Blueprint dos serviços Render (backend + whatsapp-service)
```

## Pré-requisitos (Windows)

- **Java 21** (Eclipse Temurin) — instalado via `winget install EclipseAdoptium.Temurin.21.JDK`.
- **Maven** — já disponível no PATH do ambiente de desenvolvimento.
- **Node.js 20 LTS** — instalado via `winget install OpenJS.NodeJS.20`.
- **PostgreSQL local** (ou uma branch de desenvolvimento no [Neon](https://neon.tech)) para rodar o backend localmente.

> Se acabou de instalar Java/Node via winget, abra um novo terminal (PowerShell ou Git Bash) para que o `PATH` atualizado seja carregado.

## Rodando localmente

### Backend

```powershell
cd apps\backend
mvn spring-boot:run
```

A API sobe em `http://localhost:8080`. Configure `apps\backend\.env` a partir de `.env.example` (usado a partir do Marco 1).

### Mobile (web)

```powershell
cd apps\mobile
npm install
npm run web
```

### Mobile (Android, via Expo Go ou build local)

```powershell
cd apps\mobile
npm run android
```

### WhatsApp service

```powershell
cd apps\whatsapp-service
npm install
npm run dev
```

Sobe em `http://localhost:3001` (endpoint `/health` disponível desde já; rotas de sessão/broadcast chegam no Marco 7).

## Ordem de construção

Ver seção "Ordem de construção (marcos)" do plano. Resumo: scaffolding → auth → produtos/preços → clientes → vendas → pagamentos/comissão → deploy → WhatsApp → polimento.

## Branding

Cores, tipografia (Bailleul Roman + Poppins) e diretrizes de uso da marca Edmara Medeiros devem seguir o manual de marca da Agência Transcender (2024), já registrado na memória do assistente para reaproveitamento entre sessões.
