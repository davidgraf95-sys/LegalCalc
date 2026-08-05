// scripts/plan/check.ts
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { parseRoadmap, bindeCheckbox, bulletEinzug, BULLET_RE, CHECKBOX_RE, CHECKBOX_STATUS, type Einheit } from './parse';
import { resolve } from './aufloesen';
import { parseEtikett, type Status } from './etikett';
import { INVENTAR } from './inventar';
import { pruefeSpecBindung } from './specBindung';
import { obersterMarkerId } from './marker';

// (5c) Status, die den 26×-Slot halten, ohne ihn je zurückzugeben. next.ts sperrt
// über `t.asset26x && inhaber26x && e.id !== inhaber26x` JEDEN anderen 26×-Schritt,
// solange irgendein Schritt `slot: inhaber` trägt — unabhängig von dessen Status.
// Steht der Inhaber auf `done`, arbeitet niemand mehr am Slot und niemand gibt ihn
// frei: stiller Dauer-Stillstand aller 26×-Assets. `parked` und `blocked` stellen
// dieselbe Falle — auch sie bauen nicht und geben nichts zurück. Zulässig bleiben
// nur `ready` (Inhaber wartet auf seinen Bau) und `wip` (Inhaber baut).
// Befund 20.7.2026 (Slot-Übergabe W2·6-DATA → W3·12): W2·6-DATA hielt den Slot
// über den eigenen Abschluss hinaus; weder next.ts noch check.ts sah es.
const SLOT_STILLSTAND: readonly Status[] = ['done', 'parked', 'blocked'];

// (8.3) Status, die einen Schritt als Queue-Eintrag wertlos machen: er wird nicht
// gebaut, hält aber einen Platz in der EINEN Prioritäts-Quelle. `blocked` gehört
// dazu — ein blockierter Kopf ist ebenso wenig baubar wie ein erledigter.
const QUEUE_STALE: readonly Status[] = ['done', 'parked', 'blocked'];

export interface Problem { id: string | null; meldung: string }

// `obersterMarkerId` liegt seit 5.8.2026 (§17-Wurzel-Fix) in marker.ts — check.ts
// und set.ts brauchen dieselbe Extraktion, und zwei Kopien wären zwei Wahrheiten
// (§5). Begründung für die eigene Datei statt eines direkten Imports aus check.ts:
// Kommentarkopf von marker.ts.

// Archiv-Backlog: FAHRPLAN-*.md, die (noch) nicht aus ROADMAP.md verlinkt sind. Grandfathered,
// damit der Link-Check NEU hinzugefügte/referenzierte unverlinkte FAHRPLAN rot meldet, ohne einen
// Übergangsfall jedesmal rotzumachen. Beim Archivieren/Verlinken einer Datei hier streichen.
// Altlast (11 verwaiste Fahrpläne, Stand 1.7.2026) abgetragen 31.7.2026 — QS-TOK-Aufräumwelle;
// Liste bleibt als Mechanismus für künftige Übergangsfälle.
const ARCHIV_BACKLOG = new Set<string>([]);

// CHECKBOX_STATUS liegt seit 31.7.2026 in scripts/plan/parse.ts — set.ts braucht
// dieselbe Tabelle, und zwei Kopien wären zwei Wahrheiten (§5, Fund R2-9/R2-15).

// Ordner der aktiven Fahrpläne. Bis 31.7.2026 lag jede `FAHRPLAN-*.md` im Repo-Wurzel;
// AP-8 (QS-TOK) hat sie nach `fahrplaene/` gezogen, das Archiv bleibt in `archiv/`.
export const FAHRPLAN_ORDNER = 'fahrplaene';

/**
 * Listet die zu prüfenden FAHRPLAN-Dateien eines Ordners (Basenamen, sortiert).
 *
 * Fehlt der Ordner, ist das Ergebnis eine LEERE LISTE statt eines Absturzes — der
 * Rest von check:plan (Etikett-, dep-, Queue-Regeln) muss auch in einem Baum ohne
 * `fahrplaene/` prüfbar bleiben. Das ist bewusst KEIN stilles Grün-Machen des
 * Link-Tors: existiert der Ordner, wird jede Datei darin geprüft (s. Regel 7 und
 * den Negativ-Test in src/tests/plan-check.test.ts).
 */
export function fahrplanScan(
  dir: string = FAHRPLAN_ORDNER,
  leser: (d: string) => string[] = (d) => readdirSync(d),
  dirExists: (d: string) => boolean = (d) => existsSync(d),
): string[] {
  if (!dirExists(dir)) return [];
  return leser(dir)
    .filter((f) => /^FAHRPLAN-.*\.md$/.test(f))
    .sort();
}

function zyklus(einheiten: Einheit[]): string | null {
  const dep = new Map(einheiten.map((e) => [e.id, e.etikett.dep]));
  const farbe = new Map<string, number>(); // 0=weiss 1=grau 2=schwarz
  let fund: string | null = null;
  const dfs = (id: string) => {
    if (fund) return;
    farbe.set(id, 1);
    for (const d of dep.get(id) ?? []) {
      const f = farbe.get(d) ?? 0;
      if (f === 1) { fund = d; return; }
      if (f === 0 && dep.has(d)) dfs(d);
    }
    farbe.set(id, 2);
  };
  for (const e of einheiten) if ((farbe.get(e.id) ?? 0) === 0) dfs(e.id);
  return fund;
}

/** Datei-Leser für Regel 11 (Spec-Bindung): Inhalt oder `null`, wenn nicht lesbar. */
export const dateiLeser = (p: string): string | null => (existsSync(p) ? readFileSync(p, 'utf8') : null);

export function pruefe(
  md: string,
  fahrplanDateien: string[],
  fileExists: (p: string) => boolean,
  inventar: readonly string[] = INVENTAR,
  leseDatei: (p: string) => string | null = dateiLeser,
): Problem[] {
  const probleme: Problem[] = [];
  const { einheiten, blockers, queue } = parseRoadmap(md);
  const vorhanden = new Set(einheiten.map((e) => e.id));

  // (1) Inventar-Abdeckung + keine Doppel
  for (const id of inventar) if (!vorhanden.has(id)) probleme.push({ id, meldung: `Inventar-ID "${id}" hat kein @meta` });
  const zaehl = new Map<string, number>();
  for (const e of einheiten) zaehl.set(e.id, (zaehl.get(e.id) ?? 0) + 1);
  for (const [id, n] of zaehl) if (n > 1) probleme.push({ id, meldung: `id "${id}" mehrfach etikettiert` });
  const invSet = new Set(inventar);
  for (const e of einheiten) if (!invSet.has(e.id)) probleme.push({ id: e.id, meldung: `@meta "${e.id}" ist nicht im Inventar (verwaist)` });

  for (const e of einheiten) {
    const t = e.etikett;
    // (2) Checkbox-Kopplung nur bei vorhandener Checkbox
    if (e.checkbox && !CHECKBOX_STATUS[e.checkbox].includes(t.status)) {
      probleme.push({ id: e.id, meldung: `Checkbox ${e.checkbox} passt nicht zu status ${t.status}` });
    }
    // (3) blocker-Konsistenz
    if ((t.status === 'blocked' || t.status === 'parked')) {
      if (!t.blocker) probleme.push({ id: e.id, meldung: `status ${t.status} ohne blocker` });
      else if (!Object.prototype.hasOwnProperty.call(blockers, t.blocker)) probleme.push({ id: e.id, meldung: `blocker "${t.blocker}" nicht im @blockers-Register` });
    }
    if (t.status === 'ready' && t.blocker) probleme.push({ id: e.id, meldung: `status ready aber blocker gesetzt` });
    // (4) dep-IDs existieren
    for (const d of t.dep) if (!vorhanden.has(d)) probleme.push({ id: e.id, meldung: `dep "${d}" existiert nicht` });
    // (4c) done ⇒ alle dep sind done. Ein erledigter Schritt, der auf einem
    // offenen hängt, ist entweder falsch abgehakt oder trägt eine überholte
    // dep — beides macht den Plan unwahr. (Befund 20.7.2026: W2·6a-MAT done
    // mit dep auf W2·7-VZUI ready — die Regel fehlte, also fiel es nie auf.)
    if (t.status === 'done') {
      const offeneDeps = t.dep.filter((d) => {
        const ziel = einheiten.find((x) => x.id === d);
        return ziel && ziel.etikett.status !== 'done';
      });
      for (const d of offeneDeps) {
        const ziel = einheiten.find((x) => x.id === d)!;
        probleme.push({ id: e.id, meldung: `status done, aber dep "${d}" ist ${ziel.etikett.status}` });
      }
    }
    // (6) kollision-Pfade existieren (Globs: nur einfache Existenz des Pfads bzw. Verzeichnis-Präfix)
    for (const k of t.kollision) {
      const basis = k.replace(/[*?{[].*$/, '');
      if (!fileExists(basis)) probleme.push({ id: e.id, meldung: `kollision-Pfad "${k}" existiert nicht` });
    }
    // (9) fahrplan:-Pfad existiert. Bis AP-8 (31.7.2026) war das Feld ein blosser
    // Basename im Repo-Wurzel; seither trägt jeder Wert ein Verzeichnis-Präfix
    // (`fahrplaene/` bzw. `archiv/`). Damit ist eine Fehlerklasse entstanden —
    // falsches/fehlendes Präfix —, die keine Regel sehen konnte: Regel 7 prüft nur
    // die Gegenrichtung (Datei→ROADMAP, per Basename), Regel 6 nur `kollision`.
    // Ein toter `fahrplan:`-Zeiger schickt die Bau-Session in ein ENOENT des
    // Slicers, ohne dass ein Tor rot wird (Endprüfungs-Funde 11/21, 31.7.2026).
    if (t.fahrplan && !fileExists(t.fahrplan)) {
      probleme.push({ id: e.id, meldung: `fahrplan "${t.fahrplan}" existiert nicht` });
    }
  }
  // (10) Checkbox-Bullet ohne gebundenes @meta — der Nullfall von Regel 2.
  //
  // Regel 2 prüft `if (e.checkbox && …)`. Wo parse.ts die Checkbox NICHT binden
  // kann, ist das Tor deshalb blind, und genau dort entsteht die Drift: `plan:set
  // <id> status=done` schreibt das @meta, die sichtbare Liste bleibt auf «offen»,
  // check:plan bleibt grün. Ein Tor, das an dieser Stelle nicht scheitern kann,
  // ist gefährlicher als keines (§6.7) — belegt an `W2·17-UI-BEFUNDE-B20`, wo ein
  // eingezogener Prosa-Block die Kopplung kappte, ohne dass es je auffiel
  // (Fund R2-1/R2-10 der Endprüfung Runde 2, 31.7.2026).
  //
  // Blickrichtung darum umgekehrt: von der Checkbox-Bullet nach UNTEN. Trifft der
  // Blick ein @meta, bevor eine neue Bindungs-Einheit beginnt (eine gleich- oder
  // höherrangige Bullet, eine Überschrift oder eine doppelte Leerzeile), MUSS
  // dieses @meta an genau diese Zeile gebunden sein.
  //
  // Fund R3-1/R3-9 (Endprüfung Runde 3, 31.7.2026, KRITISCH): Bis dahin beendete
  // JEDE Checkbox-Bullet die Bindungs-Einheit — auch eine TIEFER eingezogene. Eine
  // Dach-Bullet, deren eigenes @meta hinter dem @meta ihres Unterschritts steht,
  // fiel damit durch beide Netze: der Vorwärts-Blick brach an der Unter-Bullet ab,
  // die Rückwärts-Bindung am @meta des Unterschritts. Im Bestand LIVE an
  // `W2·7-BEZUG` — `plan:set … status=wip` schrieb das @meta, `- [x]` blieb
  // stehen, `check:plan` meldete null Probleme. Also: nur `bulletEinzug(z) <=
  // einzug` beendet die Einheit; ein tiefer eingezogener Unterschritt gehört noch
  // zum Block der Dach-Bullet, und sein bereits gebundenes @meta wird dabei
  // ÜBERSPRUNGEN statt zum Abbruch genommen. Was danach ungebunden bleibt, ist
  // genau der Fall, den die Regel sehen soll.
  const zeilen = md.split(/\r?\n/);
  for (let k = 0; k < zeilen.length; k++) {
    if (!CHECKBOX_RE.test(zeilen[k])) continue;
    const einzug = bulletEinzug(zeilen[k]);
    let leerFolge = 0;
    for (let j = k + 1; j < zeilen.length; j++) {
      const z = zeilen[j];
      if (z.trim() === '') { if (++leerFolge >= 2) break; continue; }
      leerFolge = 0;
      if (/^[ \t]*(?:>[ \t]*)*#{1,6}[ \t]/.test(z)) break;
      // Eine gleich- oder höherrangige Bullet eröffnet die nächste Bindungs-Einheit
      // — ab da gilt Zeile k nicht mehr. Tiefer eingezogene Bullets tun das nicht.
      if (BULLET_RE.test(z) && bulletEinzug(z) <= einzug) break;
      if (z.includes('<!-- @meta')) {
        const { zeile } = bindeCheckbox(zeilen, j);
        if (zeile === k) break; // gebunden — Zweck erfüllt
        // Fremdes, aber sauber gebundenes @meta eines TIEFER eingezogenen
        // Unterschritts innerhalb des Blocks: nicht unser Fall, weiterlaufen.
        if (zeile !== null && zeile > k && bulletEinzug(zeilen[zeile]) > einzug) continue;
        probleme.push({
          id: parseEtikett(z).id,
          meldung: `Checkbox-Zeile «${zeilen[k].trim().slice(0, 60)}» (Z.${k + 1}) steht über dem @meta auf Z.${j + 1}, ist aber nicht an die Checkbox gebunden — plan:set würde sie stehen lassen`,
        });
        break;
      }
    }
  }

  // (11) Spec-Bindung — Regel und Begründung in scripts/plan/specBindung.ts.
  // Regel 9 prüft die Existenz des Fahrplan-CONTAINERS, Regel 11 den Zeiger auf
  // die Bau-Spec DARIN. Ohne sie ist ein Anker, der auflöst und trotzdem den
  // falschen Abschnitt trifft, für jedes Tor unsichtbar (Befund B1 des
  // Bauplan-Reviews 4.8.2026; F2-Familie: geprüft wurde der Container, nicht der Inhalt).
  probleme.push(...pruefeSpecBindung(md, leseDatei));

  // (4b) Azyklie
  const z = zyklus(einheiten);
  if (z) probleme.push({ id: z, meldung: `dep-Graph hat einen Zyklus bei "${z}"` });
  // (5) max. ein 26x auf wip
  const wip26 = einheiten.filter((e) => e.etikett.asset26x && e.etikett.status === 'wip');
  if (wip26.length > 1) probleme.push({ id: null, meldung: `zwei 26×-Assets gleichzeitig wip: ${wip26.map((e) => e.id).join(', ')}` });
  // (5b) höchstens EIN 26×-Slot-Inhaber (Etikett-Übergabe); slot:inhaber verlangt 26x:ja
  const slotInhaber = einheiten.filter((e) => e.etikett.slot === 'inhaber');
  if (slotInhaber.length > 1) probleme.push({ id: null, meldung: `zwei 26×-Slot-Inhaber: ${slotInhaber.map((e) => e.id).join(', ')}` });
  for (const e of slotInhaber) if (!e.etikett.asset26x) probleme.push({ id: e.id, meldung: `slot: inhaber ohne 26x: ja` });
  // (5c) Slot-Inhaber muss den Slot auch zurückgeben können — s. SLOT_STILLSTAND.
  for (const e of slotInhaber) {
    if (SLOT_STILLSTAND.includes(e.etikett.status)) {
      probleme.push({
        id: e.id,
        meldung: `slot: inhaber bei status ${e.etikett.status} — hält den 26×-Slot, gibt ihn aber nie zurück (Slot übergeben oder slot-Feld streichen)`,
      });
    }
  }
  // (7) FAHRPLAN-Link-Check (eingegliedertes QS-PH)
  for (const f of fahrplanDateien) if (!md.includes(f)) probleme.push({ id: null, meldung: `${f} ist nicht aus ROADMAP.md verlinkt` });

  // (8) @queue-Integrität — die Queue ist die EINE Prioritäts-Quelle (Einbau 24.7.2026);
  // eine Queue, die auf tote/erledigte IDs zeigt oder der Prosa widerspricht, steuert falsch.
  const inQueue = new Set<string>();
  for (const id of queue) {
    // (8.1) jede Queue-ID trägt ein @meta
    if (!vorhanden.has(id)) probleme.push({ id, meldung: `@queue-ID "${id}" hat kein @meta` });
    // (8.2) keine Dublette
    if (inQueue.has(id)) probleme.push({ id, meldung: `@queue-ID "${id}" mehrfach in @queue` });
    inQueue.add(id);
    // (8.3) Stale-Guard: erledigte/geparkte/blockierte Schritte haben in der Queue
    // nichts verloren (§14.2 «Plan in beide Richtungen pflegen», maschinell erzwungen).
    // `blocked` ergänzt 31.7.2026 (Endprüfungs-Fund 15): ein blockierter Queue-Kopf
    // ist unbaubar und blieb still grün — 8.4 greift dort nicht, weil er gar nicht
    // erst in readyNow landet und readyNow[0] darum unverändert bleibt. Genau die
    // Fehlerklasse des Ur-Befunds vom 24.7.2026, nur über `blocked` statt über `dep`.
    const ziel = einheiten.find((e) => e.id === id);
    if (ziel && QUEUE_STALE.includes(ziel.etikett.status)) {
      probleme.push({ id, meldung: `@queue-ID "${id}" ist ${ziel.etikett.status} — veraltete Steuerung, aus @queue entfernen` });
    }
  }
  // (8.4) Prosa-Konsistenz-Guard: behauptet der Fliesstext einen «obersten» Schritt,
  // muss er der TATSÄCHLICHEN plan:next-Ausgabe entsprechen (resolve().readyNow[0]),
  // nicht bloss dem Queue-Kopf — sonst bleibt genau die Drift latent, die der Guard
  // schliessen soll: ein Queue-Kopf, der blocked/dep-wartend wird, wäre gegen queue[0]
  // weiterhin «konsistent», während plan:next längst einen anderen obersten liefert
  // (Ur-Befund 24.7.2026: Dekret sagte QS-TOK, plan:next lieferte LERNPHASE-AB;
  // Härtung nach adversarialem Verify-Befund vom selben Tag).
  const obersterZeile = md.split(/\r?\n/).find((z) => z.includes('⬆ OBERSTER OFFENER SCHRITT'));
  if (obersterZeile) {
    const idImText = obersterMarkerId(md);
    if (!queue.length) {
      probleme.push({ id: null, meldung: `Prosa behauptet einen obersten Schritt («⬆ OBERSTER OFFENER SCHRITT»), aber es gibt keine @queue` });
    } else if (idImText) {
      const mechanischOberster = resolve(einheiten, queue).readyNow[0] ?? null;
      if (idImText !== mechanischOberster) {
        probleme.push({ id: idImText, meldung: `Prosa behauptet oberster "${idImText}", plan:next liefert "${mechanischOberster ?? '—'}"` });
      }
    }
  }

  return probleme;
}

// CLI
if (!process.env.VITEST) {
  const md = readFileSync('ROADMAP.md', 'utf8');
  // FAHRPLAN-Link-Check (QS-PH): JEDE FAHRPLAN-*.md in `fahrplaene/` muss aus ROADMAP.md
  // verlinkt sein — AUSSER den in ARCHIV_BACKLOG grandfatherten Altlasten (Archiv-Kandidaten).
  // So meldet der Check eine NEU hinzugefügte/neu referenzierte unverlinkte FAHRPLAN rot,
  // ohne die historische Altlast jedesmal rotzumachen.
  // AP-8 (31.7.2026): Scan-Ort vom Repo-Wurzel auf `fahrplaene/` umgestellt (Umzug der
  // aktiven Fahrpläne). Verglichen wird weiterhin der BASENAME gegen den ROADMAP-Volltext —
  // Verweise tragen ihn in jeder Form (Link, `fahrplan:`-Feld, Prosa).
  const alle = fahrplanScan();
  const zuPruefen = alle.filter((f) => !ARCHIV_BACKLOG.has(f));
  let probleme: Problem[];
  try {
    probleme = pruefe(md, zuPruefen, (p) => existsSync(p));
  } catch (e) {
    console.error('check:plan ROT:\n  - (global): @meta nicht lesbar — ' + (e as Error).message);
    process.exit(1);
  }
  if (probleme.length) {
    console.error('check:plan ROT:');
    for (const p of probleme) console.error(`  - ${p.id ?? '(global)'}: ${p.meldung}`);
    process.exit(1);
  }
  console.log('check:plan grün.');
}
