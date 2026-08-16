// @shard-gruppe: 4
/**
 * W2·5m-LESER-V3 · S3 — CLS-Wächter für den neuen Erlass-Kopf.
 *
 * Der Kopf trägt zwei Aussagen, die erst NACH dem ersten Paint eintreffen (der
 * Standausweis aus dem Currency-Sidecar, die Konsolidierungs-Warnung aus dem
 * Revisions-Sidecar). Genau daraus entstand am 9.8.2026 ein gemessener
 * Layout-Shift (CLS 0.0227), als die Warnung noch ein eigener Block war. Die
 * Abwehr ist heute die höhenfeste Zelle (`kopf-stand*`, tailwind.config.js);
 * dieser Wächter hält fest, dass sie wirkt.
 *
 * Die 16 Kopf-SCREENSHOTS unter `docs/ux-audit-2026-07/reader/leser-v3-s3/`
 * sind einmalige Belege, kein Testlauf — wie sie erzeugt wurden, steht im
 * README daneben. Ein Spec, dessen Aufgabe es ist, bei jedem CI-Lauf
 * Dokumentation neu zu schreiben, wäre kein Wächter (§6.7).
 */
import { test, expect } from '@playwright/test';

const BREITEN = [
  { name: 'desktop', w: 1280, h: 900 },
  { name: 'mobil', w: 390, h: 844 },
] as const;

// ─── CLS-Messung: der Kopf darf beim Sidecar-Nachschub nicht wachsen ─────────
// STPO ist der harte Fall — er bekommt BEIDE Nachzügler (Standausweis aus dem
// Currency-Sidecar UND die Warnzeile aus dem Revisions-Sidecar). Gemessen wird
// @390, wo die Sätze am ehesten neu umbrechen. Der Beobachter startet vor der
// Navigation, damit er das Einwachsen sieht (Muster aus leser-kontext-e4).
for (const b of BREITEN) {
  test(`CLS Erlass-Kopf @${b.w} (STPO — beide Sidecars als Nachzügler)`, async ({ page }) => {
    await page.setViewportSize({ width: b.w, height: b.h });
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((liste) => {
        for (const e of liste.getEntries() as unknown as Array<{ value: number; hadRecentInput: boolean }>) {
          if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('/gesetze/bund/STPO');
    await page.locator('.lc-leser > header').first().waitFor({ state: 'visible', timeout: 20_000 });
    // Warten, bis die Warnzeile wirklich da ist — sonst misst man das Nichts.
    await expect(
      page.locator('.lc-leser > header').getByText(/noch nicht in den Text eingearbeitet/),
    ).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(1500);
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    // eslint-disable-next-line no-console -- Messwert gehört in die PR-Belegzeile
    console.log(`S3-MESSUNG cls@${b.w}=${cls}`);
    // ─── Woher die Schwelle kommt (gemessen 16.8.2026, nicht gesetzt) ────────
    // Gemessen wurde die GANZE Seite, nicht nur der Kopf: 0.0205 @390 und
    // 0.0072 @1280. Die Shift-Quellen (`layout-shift`-`sources`) liegen dabei
    // NICHT im Erlass-Kopf, sondern im Seiten-Chrom (die x-Bewegung der
    // Kopfleisten-Gruppen nach dem Font-Swap) und im Fliesstext. Beleg per
    // Nullprobe auf Seiten OHNE diesen Kopf, gleicher Lauf, gleiche Bedingung:
    // /gesetze 0.31 @390 · 0.73 @1280, /rechtsprechung 2.15 @390 · 2.19 @1280.
    // Der Leser liegt also zwei Grössenordnungen darunter.
    // Die Schwelle bewacht darum, dass der Kopf diesen Grundpegel nicht
    // VERSCHLECHTERT — sie ist kein Rein-Kopf-Mass. Für den Kopf selbst gilt
    // die Reservierung `.lc-kopf-stand` (index.css) plus die drei bereits
    // kalibrierten Wächter leser-kontext-e4, leser-kopf-a9 und
    // gesetze-historie-badge, die alle unverändert grün sind.
    // 0.05 = halber CWV-«good»-Wert (0.1), rund das 2.5-Fache des Ist-Werts —
    // eng genug, um eine echte Verschlechterung zu fangen, weit genug, um am
    // Chrom-Grundrauschen nicht zu flackern.
    // Messbedingung: warm, ohne CPU-Drossel, eigener Browser-Kontext je Fall.
    expect(cls).toBeLessThan(0.05);
  });
}
