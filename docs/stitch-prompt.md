# 🎨 Stitch UI Prompt: AlfaBrowserautomation Operator Dashboard

Skopiuj poniższy prompt i wklej go do swojego narzędzia Stitch (lub innego generatora UI), aby stworzyć wysoce estetyczny, interaktywny i nowoczesny panel operatora w ciemnym stylu.

---

### 📝 Prompt do skopiowania:

```text
Stwórz nowoczesny, interaktywny pulpit operatora (Operator Dashboard) dla bramy bezpieczeństwa agentów AI o nazwie "AlfaBrowserautomation". 

Interfejs ma wyglądać niezwykle premium, w stylu cyber-security/AI command center. Użyj zaawansowanej estetyki:
- Głęboki, ciemny motyw (tło: #09090b, karty: półprzezroczysty grafit z efektem szkła/glassmorphismu i rozmyciem tła).
- Akcenty kolorystyczne: Szmaragdowy (neonowy Emerald #10b981) dla bezpiecznych akcji, Bursztynowy/Żółty dla wstrzymania/ostrzeżeń, Czerwony dla blokad i krytycznych podatności.
- Delikatne poświaty neonowe (neon glow box-shadow) dla kart o podwyższonym ryzyku.
- Krój pisma: Nowoczesny sans-serif (Inter lub Outfit).
- Ikony z biblioteki Lucide React (Shield, AlertTriangle, Eye, Search, Trash2, Plus, Play, Activity).

UKŁAD STRONY (Layout):
1. Nagłówek (Header):
   - Logo "AlfaBrowserautomation" z ikoną tarczy i statusem usługi (zielona pulsująca kropka: "API Connected").
   - Licznik przeskanowanych stron oraz statystyki (np. "Decision Ratio: 94% Auto, 6% Hold").

2. Dwukolumnowy Grid główny (1/3 szerokości po lewej, 2/3 po prawej):

   A. Lewa Kolumna (Formularz Skanowania - ScanForm):
      - Karta z formularzem dodawania URL (z polem tekstowym).
      - Pole "Agent Goal" (textarea) do zdefiniowania intencji agenta.
      - Sekcje z dodawaniem tagów (Allowed Outputs i Forbidden Shifts) w postaci dynamicznych tagów/badge'y z możliwością usuwania (ikona X).
      - Duży, neonowy przycisk "Uruchom Skaner Bezpieczeństwa" (z loaderem podczas ładowania).

   B. Prawa Kolumna (Wyniki Skanowania - Result Area):
      - Stan pusty (Idle): Estetyczna karta z wyszarzoną ikoną tarczy i tekstem zachęcającym do wpisania adresu URL.
      - Stan ładowania (Loading): Pulsacyjny szkielet karty (Skeleton Loader) i animacja skanowania drzewa DOM.
      - Stan wyniku (Result):
        1. Karta decyzji (Decision Card): Pasek na całą szerokość kolumny informujący o werdykcie silnika (ALLOW - zielony, SANITIZE - żółty, HOLD - pomarańczowy, BLOCK - czerwony) z dużym, wyraźnym napisem i odznaką poziomu ryzyka (RiskBadge).
        2. Karta Intencji (IntentDiffCard): Panel pokazujący czy cel agenta został zachowany. Zawiera wskaźnik "Prompt Injection Score" w formie procentowej (np. 78% na czerwono/żółto).
        3. Tabela anomalii (FindingsTable): Tabela z kolumnami Typ, Ryzyko, Opis i Selektor CSS, pokazująca wykryte podatności DOM. Elementy o krytycznym ryzyku powinny mieć czerwone obramowanie i boks z fragmentem złośliwego tekstu (excerpt).
        4. Podgląd DOM (DomPreview): Karta z zakładkami (Tabs) przełączającymi widok między "Bezpieczna Treść" (ramki w kolorze szmaragdowym) a "Kwarantanna Bloków" (tekst w czerwonej ramce, pokazujący wycięte złośliwe instrukcje).

Dodaj płynne mikro-animacje przy hoverze na karty oraz efekt przejścia (fade-in) dla pojawiających się wyników skanowania.
```
