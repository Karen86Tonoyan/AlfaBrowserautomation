# 🛡️ AlfaBrowserautomation — Security-Aware Content Gateway for Agents

**AlfaBrowserautomation** to lokalna, bezpieczna brama zawartości (security gateway) dla autonomicznych agentów przeglądarkowych. W odróżnieniu od klasycznych systemów opartych na analizie wizualnej (vision) lub przesyłaniu pełnych zrzutów ekranu do zewnętrznych modeli chmurowych, AlfaBrowserautomation działa w 100% lokalnie, zabezpiecza dane użytkownika (ciasteczka, sesje, dane formularzy) i weryfikuje pobieraną treść przed jej przekazaniem do agenta.

---

## 🧭 Jak to Działa?

1. **Intake Intencji**: Agent deklaruje swój cel (`goal`), dane wyjściowe które chce pobrać (`allowed_outputs`) oraz niedozwolone przesunięcia celu (`forbidden_shifts`).
2. **Fetch DOM**: Brama pobiera zawartość strony (statycznie lub renderując dynamiczny JS przez Playwright).
3. **Analiza Bezpieczeństwa**:
   - **Skaner Prompt Injection**: Szuka w tekście strony ukrytych instrukcji wrogiego przejęcia kontekstu (np. `"ignore previous instructions"`).
   - **Skaner Sygnałów OWASP**: Wykrywa anomalie struktury DOM (np. offscreen content, niewidoczne formularze, iframy, podejrzane redirecty).
   - **Klasyfikator DOM**: Taguje bloki tekstu jako `important`, `noise`, `prompt_like`, `suspicious` lub `discard`.
4. **Intent Diff**: Porównuje intencję agenta z zawartością strony, aby wykryć, czy strona próbuje zmanipulować zachowanie agenta (Drift).
5. **Policy Engine**: Podejmuje ostateczną decyzję decyzyjną:
   - `ALLOW` — przekazuje czysty, bezpieczny DOM do agenta.
   - `SANITIZE` — usuwa podejrzane i wrogie bloki tekstu, a bezpieczną resztę przekazuje agentowi.
   - `HOLD` — wstrzymuje operację i przekazuje sprawę do weryfikacji operatorowi (Human-in-the-loop).
   - `BLOCK` — całkowicie blokuje dostęp do witryny z powodu wysokiego ryzyka.

---

## 📂 Struktura Repozytorium

```text
AlfaBrowserautomation/
  package.json             # Główny package.json (pnpm monorepo)
  pnpm-workspace.yaml      # Definicja workspace dla aplikacji i pakietów
  apps/
    api/                   # Express API (analiza i skanowanie)
    web/                   # Panel Dashboard operatora (Next.js/React)
  packages/
    shared/                # Współdzielone typy i schematy Zod
  data/
    rules/                 # JSON z regułami i sygnaturami zagrożeń
```

---

## 🛠️ Uruchomienie lokalne

```bash
# Instalacja zależności
pnpm install

# Uruchomienie API (apps/api)
pnpm --filter api dev

# Uruchomienie Dashboardu (apps/web)
pnpm --filter web dev

# Uruchomienie MCP Server (apps/mcp-server)
pnpm --filter mcp-server dev
```

---

## MCP Server

Repo zawiera scaffold dla `apps/mcp-server`, który ma wystawiać narzędzia MCP nad lokalnym API skanera. To jest warstwa pod:

- integracje z agentami przez MCP,
- wywołania `scan_url` bez wpinania modeli bezpośrednio do frontendu,
- późniejszą płatną warstwę orkiestracji i polityk.

Szczegóły planu są w [docs/mcp-server.md](./docs/mcp-server.md).
