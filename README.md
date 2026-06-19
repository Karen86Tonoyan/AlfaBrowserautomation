# AlfaBrowserautomation

Security-aware content gateway for browser agents with local privacy, intent gating and MCP-ready integration.

![AlfaBrowserautomation preview](https://github.com/user-attachments/assets/351d1d82-297c-4154-ad27-c4552219ed28)

## What it is

**AlfaBrowserautomation** to lokalna, bezpieczna brama zawartości dla autonomicznych agentów przeglądarkowych. Zamiast wpuszczać model bezpośrednio na stronę, system:

1. przyjmuje deklarowaną intencję agenta,
2. pobiera i analizuje treść strony,
3. skanuje prompt injection i techniczne sygnały ryzyka,
4. porównuje intencję z tym, co strona próbuje wymusić,
5. zwraca werdykt `ALLOW / SANITIZE / HOLD / BLOCK`.

To jest warstwa pośrednia między agentem a stroną.

## Core flow

1. **Intent Intake**
   Agent deklaruje `goal`, `allowedOutputs`, `forbiddenShifts`.

2. **Fetch DOM**
   System pobiera HTML i wyciąga tekst oraz sygnały DOM.

3. **Security Analysis**
   - Prompt Injection Scanner
   - OWASP / DOM Signal Scanner
   - Intent Drift Detection
   - Policy Engine

4. **Decision**
   - `ALLOW` – treść bezpieczna
   - `SANITIZE` – treść oczyszczona
   - `HOLD` – wymaga decyzji operatora
   - `BLOCK` – zbyt duże ryzyko

## Repository structure

```text
AlfaBrowserautomation/
  apps/
    api/          Express API for scanning and verdicts
    web/          Next.js operator dashboard
    mcp-server/   MCP server scaffold over local API
  packages/
    shared/       Shared schemas and types
  data/
    rules/        Detection patterns and rules
  docs/
    mcp-server.md
```

## Local run

```bash
pnpm install

pnpm --filter api dev
pnpm --filter web dev
pnpm --filter mcp-server dev
```

## MCP

Repo zawiera scaffold dla `apps/mcp-server`, który wystawia lokalne API skanera jako narzędzia MCP.

Plan v1:
- `health`
- `scan_url`

Opis kierunku:
- [docs/mcp-server.md](./docs/mcp-server.md)

## Goal

Nie budować kolejnej “AI przeglądarki”, tylko:

**security-aware content gateway for agents**

czyli system, który chroni prywatność, filtruje treść, wykrywa drift i przygotowuje stronę zanim model podejmie akcję.
