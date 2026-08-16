// Browser-Smoke-Suite (e2e/): prüft im echten Chromium, was die node-Suite
// nicht sehen kann — Renderfehler, Console-Errors, Mobil-Overflow. Läuft
// gegen `vite preview` (gebautes dist/), in der CI nach dem Build-Schritt.
// Specs heissen *.e2e.ts, damit Vitest sie nicht aufsammelt.
import { defineConfig } from '@playwright/test'
import { createHash } from 'node:crypto'

// ── Port-Wahl (§17-Wurzelfix, Vorfall 4.8.2026) ──────────────────────────────
// Bisher: fester Default 4317 + `reuseExistingServer: !CI`. In Parallel-Sessions
// (§12, mehrere Worktrees) griff der zweite Lauf still auf den preview-Server des
// ERSTEN zu — also auf dessen `dist/`. Die e2e-Suite testete dann fremden Code,
// ohne dass irgendetwas rot wurde; das kostete am 4.8.2026 einen vollen
// Fehldiagnose-Zyklus. Der Workaround («E2E_PORT von Hand setzen») bestand seit
// je und hat genau deshalb nicht getragen: er verlangt, an die Falle zu denken.
// Wurzelfix: LOKAL ist der Default deterministisch aus dem Arbeitsverzeichnis
// abgeleitet — verschiedene Worktrees ⇒ verschiedene Ports ⇒ `reuseExistingServer`
// kann nur noch den EIGENEN Server wiederverwenden. Derselbe Pfad ergibt immer
// denselben Port (§2), ein laufender Server wird also weiterhin wiederverwendet.
// Vorrang-Ordnung: explizites `E2E_PORT` > CI-Standard > Pfad-Ableitung.
// CI UNVERÄNDERT: dort läuft je Job ein eigener Container, `process.cwd()` ist
// pfad-gleich, aber die Ableitung wird gar nicht erst betreten — `CI` ⇒ 4317
// (die CI-Workflows setzen `E2E_PORT` nicht, siehe .github/workflows/ci.yml).
// Fenster 4400–4799: hält Abstand zu 4317 (CI/Haupt-Checkout) und zu 4319
// (scripts/messung-cwv.ts). `--strictPort` (unten) macht eine trotzdem belegte
// Portnummer laut statt still.
const CI_PORT = '4317'
const PORT_BASIS = 4400
const PORT_SPANNE = 400

function portAusPfad(pfad: string): string {
  const summe = createHash('sha256').update(pfad).digest().readUInt32BE(0)
  return String(PORT_BASIS + (summe % PORT_SPANNE))
}

const E2E_PORT = process.env.E2E_PORT ?? (process.env.CI ? CI_PORT : portAusPfad(process.cwd()))

// Bekannt schwere Specs (Forensik 17.7.): erhalten via Projekt-Override ein
// 60-s-Timeout statt der globalen 30 s (Begründung unten bei `projects`).
const SCHWERE_SPECS = ['**/a11y.e2e.ts']

// ── N-Specs: Normtext-Treue (FAHRPLAN-LESER-V3 Kap. 10) ─────────────────────
// Diese Specs prüfen, dass am NORMTEXT nichts verrutscht — Optionen-Schalter,
// Fundstellen/Quickjump, Rücksprung, Such-Vertrag, Marginalien, PDF-Download,
// die neun UX-Punkte, Kopf-Label, Anhang-Behandlung und den Linien-Rückbau.
// Sie laufen im Fenster DOPPELT: im Projekt `chromium` ohne Flag gegen den
// Ist-Stand und im Projekt `leser-v3` mit gesetztem Flag gegen die neue Hülle.
// Diese Doppelung IST der Paritätsbeweis — eine Hülle, die den Normtext
// verändert, wird auf genau einer Seite rot.
//
// Der Fahrplan schreibt in derselben Zeile «8 bleiben unverändert grün» und
// zählt dann ZEHN Namen auf. Hier stehen alle zehn: die Liste ist die
// verbindliche Aufzählung, die Zahl «8» ist ein Zählfehler aus einer früheren
// Fassung (gemeldet in docs/ux-audit-2026-07/reader/leser-v3-vorprobe.md).
// Mehr Deckung ist hier die sichere Richtung — nie weniger als der Fahrplan.
const N_SPECS = [
  '**/leser-optionen.e2e.ts',
  '**/leser-r1-r2.e2e.ts',
  '**/leser-ruecksprung-r5-r7.e2e.ts',
  '**/leser-suche-vertrag-b8.e2e.ts',
  '**/leser-ohne-gliederungslinie.e2e.ts',
  '**/gesetze-marginalie.e2e.ts',
  '**/gesetze-pdf-download.e2e.ts',
  '**/gesetze-ux-9punkte.e2e.ts',
  '**/gesetze-ux-g3a.e2e.ts',
  '**/gesetze-ux-g3b-anhang.e2e.ts',
]

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Auf dem 2-Kern-CI-Runner konkurrierten mehrere parallele Worker um EINEN
  // vite-preview-Server samt schwerer Reader-Seite → CPU-Aushungerung, einzelne
  // Klicks blockierten bis zum 30-s-Test-Timeout (lokal selbst bei 8× CPU-Drossel
  // < 1 s, 0 Konsolenfehler — also Contention, kein Code-Defekt). Auf CI darum
  // 1 Worker (sequenziell, stabil); lokal volle Parallelität.
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 2 : 0,
  // CI zusätzlich als JSON: der `github`-Reporter druckt KEINE Per-Test-Dauern
  // (das tut nur das lokale `list`-Format), und `reportSlowTests` flaggt erst ab
  // 5 Minuten GESAMT-Dauer je Datei. Ergebnis war, dass sich die Shard-Gruppen
  // nur gegen LOKAL gemessene Dauern packen liessen — und die skalieren nicht
  // uniform: `leser-gliederung-a33.e2e.ts` braucht lokal 92 s, auf dem CI-Runner
  // aber ~360 s (Faktor 3.9), während andere Specs weit darunter bleiben. Genau
  // daher die Schieflage der Shard-Wandzeiten (Median 729 / 570 / 780 s statt
  // je ~693 s). Der JSON-Report (als Artefakt hochgeladen) liefert die echten
  // Per-Spec-CI-Dauern, damit die nächste Packung GEMESSEN statt geschätzt ist.
  // Reine Berichterstattung — kein Test, keine Assertion, kein Timeout berührt (§6.3).
  reporter: process.env.CI
    ? [['github'], ['json', { outputFile: 'playwright-report.json' }]]
    : 'list',
  // Auf langsamen CI-Runnern überschreiten einzelne Web-First-Assertions den
  // Playwright-Default (5000 ms) — z. B. wenn ein content-visibility-Artikelbody
  // nach Wieder-Aufklappen neu rendert. Lokal < 5 s; auf CI sporadisch rot. Das
  // Assertion-Zeitbudget grosszügig auf 10 s heben (greift nur bei Überschreitung,
  // verlangsamt grüne Tests nicht) — Assertions inhaltlich unverändert (§6.3).
  expect: { timeout: 10_000 },
  // ── Fail-fast gegen den SYSTEMISCHEN Hänger (QS-E2E-STABIL, Beleg 7.8.2026) ──
  // Am 7.8.2026 brannte Shard 2/8 1 h 2 min, weil VIER Tests derselben Datei je
  // dreimal (retries:2) voll ins 270-s-Budget liefen — 12 Attempts à ~272 s. Die
  // Wurzel war EIN Defekt (unklickbarer TOC-Knopf, s. SektionBaumTOC.tsx); die
  // elf Wiederholungen haben nichts Neues erzählt und die Merge-Kette blockiert.
  // `maxFailures` beendet den Shard, sobald so viele Tests ENDGÜLTIG (also nach
  // ihren Retries) gescheitert sind — bei 3 deckelt das denselben Vorfall auf
  // ~41 min statt unbegrenzt; den Rest fängt der Job-Deckel in ci.yml
  // (`timeout-minutes`) ab.
  // ROT BLEIBT ROT: `maxFailures` unterdrückt keinen Fehlschlag, es beendet den
  // Lauf früher — der Exit-Code bleibt 1, die gemeldeten Fehler stehen vollständig
  // im Report. Kein Test wird übersprungen, kein `expect`, kein Timeout berührt
  // (§6.3). LOKAL aus: dort sind Retries 0 und die Läufe kurz — ein vorzeitiger
  // Abbruch verstellt nur die Diagnose.
  maxFailures: process.env.CI ? 3 : 0,
  use: {
    baseURL: `http://localhost:${E2E_PORT}`,
    // Traces: LOKAL `retain-on-failure` — lokal ist `retries` 0, `on-first-retry`
    // zeichnete hier also NIE etwas auf und verschlechterte die lokale Diagnose.
    // AUF CI `on-first-retry`: der erste Versuch läuft ohne Aufzeichnungs-Overhead
    // (2-vCPU-Runner, §15), der zweite liefert den Trace. Für die Hänger-Klasse
    // kostet das nichts — die drei Attempts vom 7.8.2026 waren im Call-Log
    // zeichengleich, der Retry dokumentiert denselben Stall.
    // Der eigentliche Mangel war nicht die Aufzeichnung, sondern die ABLAGE: die
    // Traces entstanden auf dem Runner und wurden mit ihm weggeworfen (ci.yml lud
    // nur `playwright-report.json` hoch). Genau deshalb musste der Hänger vom
    // 7.8. lokal nachgestellt werden, statt ihn aus dem Artefakt zu lesen. Der
    // Upload-Schritt in ci.yml schliesst das.
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
  },
  // ── Test-Timeout-Politik (O-3.3, CPU-Drossel-Forensik 17.7.; Runner-Budgets 19.7.) ─
  // LOKAL bleibt der Test-Timeout bei Playwrights Default (30 s), schwere Specs
  // bei 60 s — dort ist keine Contention. Auf dem 2-vCPU-Free-Runner riss aber
  // reihum genau dieses 30-s-Budget bei wandernden Einzeltests (gesetze-randtitel-6b,
  // verweis-u, leser-kopf-a9, gesetze.e2e, norm-sprung): lokal < 5 s in ~1–2 s,
  // auf langsamen Runner-Instanzen 30–40 s — also Contention/Instanz-Streuung,
  // kein Code-Defekt. Jeder solche Timeout kostet die Merge-Kette einen Rerun-
  // Zyklus. Darum hebe ich den CI-Zweig des Default-Timeouts auf 90 s (schwere
  // Specs analog auf 90 s, damit die 60-s-Override sie nicht UNTER den neuen
  // Default drückt). LOKAL unverändert (30 s / 60 s) — CI und lokal sind getrennt
  // konfigurierbar. Das ist INFRASTRUKTUR (Zeitbudget), KEIN Assertion-Change
  // (§6.3): kein `expect` und kein Prüf-Schritt wird berührt, der Timeout greift
  // nur bei Überschreitung und verlangsamt grüne Läufe nicht. Sharding (`--shard`)
  // verteilt über beide Projekte hinweg, bleibt unberührt.
  projects: [
    {
      name: 'schwer',
      testMatch: SCHWERE_SPECS,
      timeout: process.env.CI ? 90_000 : 60_000,
    },
    {
      name: 'chromium',
      testIgnore: SCHWERE_SPECS,
      timeout: process.env.CI ? 90_000 : 30_000,
    },
    // ── Flag-Projekt: dieselben N-Specs gegen die V3-Hülle ──────────────────
    // Aktivierung über `storageState` statt über einen Query-Parameter: die
    // Specs navigieren selbst (`page.goto('/gesetze/…')`) und wüssten von
    // einem `?leser=v3`-Suffix nichts — es müsste in jede einzelne Spec
    // hinein, und das wäre eine inhaltliche Änderung bestehender Specs (§6.3
    // verbietet genau das bei einem Struktur-Schritt). `storageState` legt
    // `lm.leser.v3` VOR dem ersten Laden in den Speicher des Origins; die
    // Fassade (`src/pages/GesetzLeser.tsx`) liest ihn beim ersten Render.
    // Die Specs bleiben Zeichen für Zeichen unangetastet.
    // Das Origin muss den dynamischen Port tragen (Port-Wahl oben), sonst
    // greift der Speicher-Eintrag ins Leere und das Projekt testete still V1
    // — also genau das Tor, das nicht scheitern kann. Der Rot-Beweis der
    // Vorprobe (V-2) schliesst diesen Fall aus.
    {
      name: 'leser-v3',
      testMatch: N_SPECS,
      timeout: process.env.CI ? 90_000 : 30_000,
      use: {
        storageState: {
          cookies: [],
          origins: [
            {
              origin: `http://localhost:${E2E_PORT}`,
              localStorage: [{ name: 'lm.leser.v3', value: '1' }],
            },
          ],
        },
      },
    },
  ],
  webServer: {
    command: `npm run preview -- --port ${E2E_PORT} --strictPort`,
    url: `http://localhost:${E2E_PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
