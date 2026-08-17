// @shard-gruppe: 3
import { test, expect, type Page } from '@playwright/test';

// E5-Welle (David 16.7.2026, §10.10) — A35 · A40 · A41.
//
//  · A35: In-Gesetz-Suchfeld sitzt (David 19.7.2026) OBEN im Inhalts-Kopf selbst
//         — in der Zeile mit Brotkrümel · Artikel-Chip · «Ansicht ▾» · Stand · ✕
//         (data-such-slot im data-inhalt-kopf), NICHT mehr in der früheren full-
//         width Such-Leiste darunter und NICHT in der Gliederungsspalte (aside).
//         Suchtreffer werden im Text markiert (CSS Custom Highlight API
//         «lc-such-treffer»). Der Auftrag verlegte den ORT; das Feld-Verhalten
//         (Highlight, Enter-Navigation, A40-BGer-Fallback) bleibt unverändert.
//  · A40: «beim Bundesgericht …»-Link eines Ausser-Bestand-BGE ist ein EHRLICHER
//         Such-Link (type=simple_query), KEIN konstruierter highlight_docid-Permalink
//         (der landete beim falschen Entscheid).
//  · A41: die Header-Suche (Topbar-Combobox) öffnet ihr Dropdown ÜBER der sticky
//         Gesetzes-Kopfzeile (Stacking/z-index) — nicht mehr dahinter.

// CI-Härtung 19.7.2026 (BEFUND 3b): der OR-Reader + In-Gesetz-Suche kettet mehrere
// 15–20-s-Latches (Artikel-Index-/Struktur-Load, Highlight). Auf dem 2-vCPU-Runner
// unter Starvation riss der A35-Highlight-Walk reihum das 30-s-Test-Budget. Budget
// explizit auf 60 s (Muster gesetze-pdf-download). INFRASTRUKTUR (Zeitbudget), KEIN
// Assertion-Change (§6.3): Highlight-/Stacking-Assertions unberührt.
//
// RUNNER-ROBUSTHEIT 3.8.2026 — 60 s → 120 s. Belegt: der Cleanup-Poll in Zeile ~71
// riss am 3.8. in ZWEI unabhängigen Läufen (30832252309 Shard 6/8, 30836806866
// Shard 6/8) je mit «Test timeout of 60000ms exceeded», auf PR-Ständen, die kein
// src/ berührten; die Reruns liefen grün. Der Runner-Pool ist an diesem Tag messbar
// langsamer geworden (Perf-Kalibrierlauf 30830332128: OR-TBT-Mittel 4489 → 5290 ms
// gegenüber Juli, +17.8 %) — der Test hat also nicht seine Funktion verloren,
// sondern seine Zeitannahme.
// DEKLARIERTE TEST-INFRASTRUKTUR-ÄNDERUNG, kein Refactoring i. S. v. §6.3: Diese
// Tests prüfen FUNKTIONALITÄT, nicht Tempo. Tempo prüft das §15-Perf-Budget
// (check:perf-lighthouse) — ein Timeout, der langsame Runner bestraft, misst den
// Runner, nicht die Software. Keine Assertion, kein Prüfschritt berührt; das
// Budget greift nur bei Überschreitung und verlangsamt grüne Läufe nicht.
test.describe.configure({ timeout: 120_000 });

const inGesetzSuche = (page: Page) => page.getByRole('searchbox', { name: 'Im Gesetz suchen' });
const headerFeld = (page: Page) => page.getByRole('combobox', { name: /LexMetrik durchsuchen/ });

test.describe('A35 — In-Gesetz-Suche in der Kopfzeile + Treffer-Highlight', () => {
  test('Suchfeld sitzt OBEN im Inhalts-Kopf, NICHT in einer eigenen Leiste oder der Gliederungsspalte', async ({ page }) => {
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20000 });
    const suche = inGesetzSuche(page);
    await expect(suche).toBeVisible({ timeout: 20000 });
    // Genau EIN Suchfeld (kein Doppel aus mehreren Positionen).
    await expect(suche).toHaveCount(1);
    // Das Feld liegt im Inhalts-Kopf …
    // H4-UMHÄNGUNG (Flip 18.8.2026): die Kopf-Zone heisst in der Ist-Hülle
    // `data-such-slot`/`data-inhalt-kopf`, in V3 `data-v3-kopf` (A-2 hat die
    // beiden Leisten zu EINER verschmolzen, die Slots gibt es dort nicht mehr).
    // Der geprüfte Sachverhalt ist unverändert und bleibt eine harte Zusage: das
    // Feld hängt in der klebenden Kopf-Zone, nicht irgendwo im Fluss. Geprüft
    // wird «in EINER der beiden Kopf-Zonen» statt in beiden zugleich — sonst
    // wäre der Fall in genau einer Hülle konstruktiv rot, ohne dass sich etwas
    // verschlechtert hätte (§6.7).
    const kopfZonen = await suche.evaluate((el) => ({
      istHuelle: !!el.closest('[data-such-slot]') && !!el.closest('[data-inhalt-kopf]'),
      v3: !!el.closest('[data-v3-kopf]'),
    }));
    expect(kopfZonen.istHuelle || kopfZonen.v3,
      `Suchfeld sitzt in keiner Kopf-Zone (Ist-Hülle: ${kopfZonen.istHuelle}, V3: ${kopfZonen.v3})`).toBe(true);
    // … die frühere full-width Such-Leiste (data-such-bar) existiert in der
    // Einzelansicht NICHT mehr (rückstandsfrei entfernt, David 19.7.2026) …
    await expect(page.locator('[data-such-bar]')).toHaveCount(0);
    // … und das Feld liegt NICHT innerhalb der Gliederungsspalte (aside/[data-toc]).
    await expect(suche.locator('xpath=ancestor::aside')).toHaveCount(0);
  });

  test('«Vertrag» im OR wird im Treffertext gehighlighted (CSS Custom Highlight API)', async ({ page }) => {
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20000 });
    const suche = inGesetzSuche(page);
    await expect(suche).toBeVisible({ timeout: 20000 });
    await suche.fill('Vertrag');
    // ── §6.3-DEKLARATION (9.8.2026, W2·19-GLIEDERUNG/S8) ────────────────────
    // Freigabe David 8.8.2026 («e2e-Anpassungen in deklarierten Commits
    // erlaubt», Bau-Spec §10 Entscheid (a)) und Entscheid (c) desselben Tages:
    // die Trefferliste ist in die Seitenleiste gezogen, die Lesespalte bleibt
    // vollständig. Der A35-Auftrag vom 16.7.2026 («Suchtreffer im Text
    // markieren») ist UNBERÜHRT — genau er wird unten weiter geprüft. Auch die
    // FELD-Assertions des Falls darüber (Kopf-Sitz, `ancestor::aside == 0`)
    // bleiben wörtlich stehen.
    // GEÄNDERT ist nur der Anker auf die Trefferliste: sie hiess «N Treffer für
    // «x»» und heisst jetzt «N Artikel · M Fundstellen» (der Zähler ist
    // datenseitig geworden, §4.4). Statt an einem Wortlaut hängt der Test
    // seither am stabilen `[data-treffer-leiste]` — dieselbe Sache, robuster
    // adressiert.
    await expect(page.locator('[data-treffer-leiste]')).toBeVisible({ timeout: 15000 });

    // Die Markierung entsteht seit S8 ARTIKELWEISE für das Sichtband (§4.5) —
    // ein Voll-Lauf über 1686 OR-Artikel je Such-Ruhephase wäre mit der jetzt
    // vollständigen Lesespalte nicht mehr vertretbar. Der Test scrollt darum
    // zuerst an einen Treffer und prüft dann, was A35 zusagt: dort leuchtet es.
    const ersterTreffer = page.locator('[data-treffer-artikel]').first();
    await expect(ersterTreffer).toBeVisible({ timeout: 15000 });
    const token = await ersterTreffer.getAttribute('data-treffer-artikel');
    await page.locator(`#art-${token}`).scrollIntoViewIfNeeded();
    // Highlight-Menge ist gesetzt (Paint-Schicht, keine DOM-Mutation).
    await expect.poll(async () => page.evaluate(() => {
      const reg = (globalThis as unknown as { CSS?: { highlights?: Map<string, { size: number }> } }).CSS?.highlights;
      const hl = reg?.get('lc-such-treffer');
      return hl ? hl.size : 0;
    }), { timeout: 15000 }).toBeGreaterThan(0);
    // Suche leeren ⇒ Highlight verschwindet wieder (Cleanup).
    // Timeout-Kalibrierung 25.7.2026 (deklarierte Infra-Anpassung, §6.3): der
    // Clear-Pfad läuft über den Idle-/Debounce-Zyklus des grossen OR-Korpus und
    // braucht LOKAL bereits ~16–17 s — das alte 15-s-Prädikat war strukturell zu
    // knapp und riss in CI wiederholt (PR #353, 2× identisch; Contention addiert).
    // Die ASSERTION (Highlight wird schliesslich entfernt) bleibt unverändert
    // scharf; nur das Warte-Budget deckt jetzt die reale Dauer + CI-Marge.
    // 3.8.2026: 45 s → 90 s (Test-Budget 120 s, oben). Genau hier riss der Test am
    // 3.8. zweimal — der Poll ist die Stelle, an der die Runner-Verlangsamung
    // ankommt. Assertion (`toBe(false)`) unverändert.
    await suche.fill('');
    await expect.poll(async () => page.evaluate(() => {
      const reg = (globalThis as unknown as { CSS?: { highlights?: Map<string, unknown> } }).CSS?.highlights;
      return reg?.has('lc-such-treffer') ?? false;
    }), { timeout: 90000 }).toBe(false);
  });
});

test.describe('A41 — Header-Dropdown liegt über der Gesetzes-Kopfzeile', () => {
  test('Trefferdropdown der Topbar-Suche verdeckt die sticky Gesetzes-Kopfzeile (nicht umgekehrt)', async ({ page }) => {
    await page.goto('/gesetze/bund/OR');
    await expect(page.locator('#art-1')).toBeVisible({ timeout: 20000 });
    // Auf der Gesetzesseite ist der sticky Inhalts-Kopf (Breadcrumb + Ansicht) präsent.
    const feld = headerFeld(page);
    await feld.click();
    await feld.fill('OR');
    const listbox = page.getByRole('listbox', { name: 'Suchtreffer' });
    await expect(listbox).toBeVisible({ timeout: 15000 });
    // Ein Punkt im Überlappungsband (unter der 64px-Topbar, im 36px-Band des sticky
    // Inhalts-Kopfs) am horizontalen Zentrum des Dropdowns: das ZUOBERST getroffene
    // Element MUSS zum Dropdown/zur Listbox gehören, nicht zum Inhalts-Kopf.
    const obenAufDropdown = await page.evaluate(() => {
      const lb = document.querySelector('[role="listbox"][aria-label="Suchtreffer"]');
      if (!lb) return false;
      const r = lb.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = 88; // 64px Topbar + ~24px in den 36px-Kopf → Überlappungsband
      const stapel = document.elementsFromPoint(x, y);
      // Das oberste Element ist Teil des Dropdowns (Listbox oder deren Container).
      return stapel.length > 0 && !!stapel[0].closest('[role="search"]');
    });
    expect(obenAufDropdown).toBe(true);
  });
});

test.describe('A40 — ehrlicher amtlicher Such-Link statt falschem Permalink', () => {
  test('Ausser-Bestand-BGE «BGE 150 III 38» → simple_query-Suchlink, KEIN highlight_docid', async ({ page }) => {
    await page.goto('/gesetze');
    const feld = headerFeld(page);
    await feld.click();
    await feld.fill('BGE 150 III 38');
    // §8-ehrliche Zeile «nicht im Bestand» + amtlicher SUCH-Link.
    const link = page.getByRole('link', { name: /beim Bundesgericht suchen/ });
    await expect(link).toBeVisible({ timeout: 15000 });
    const href = await link.getAttribute('href');
    expect(href).toContain('type=simple_query');
    expect(href).not.toContain('highlight_docid');
  });
});
