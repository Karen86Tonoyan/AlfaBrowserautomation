# MCP Server Plan

## Cel

`apps/mcp-server` ma być lekką warstwą MCP nad lokalnym API `AlfaBrowserautomation`.

Nie robi własnej analizy DOM. Ma wystawiać bezpieczne narzędzia agentom:

- `health`
- `scan_url`

## Zakres v1

1. `health`
   Zwraca status lokalnego API skanera.

2. `scan_url`
   Przyjmuje:
   - `url`
   - `goal`
   - `allowedOutputs[]`
   - `forbiddenShifts[]`

   Następnie woła:
   - `POST http://127.0.0.1:8080/api/scan`

   i zwraca wynik w formie bezpiecznej dla klienta MCP.

## Kolejne kroki

1. Dodać resources:
   - ostatnie sesje skanów
   - aktywne polityki

2. Dodać prompts:
   - `safe_browse_review`
   - `intent_gate_check`

3. Dodać auth i konfigurację środowisk:
   - local
   - hosted
   - team policy

## Dlaczego osobna aplikacja

Oddzielenie `apps/mcp-server` od `apps/api` daje:

- prostsze integracje z klientami MCP,
- osobny lifecycle procesu,
- łatwiejsze wystawienie później jako osobnej płatnej warstwy.
