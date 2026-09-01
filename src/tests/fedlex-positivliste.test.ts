// ─── Wächter: Erlassnamen-Positivliste (V-7/V-8, W2·20-VERWEIS-SCHAERFE) ─────
//
// Jeder Eintrag in `src/lib/fedlex/positivliste.ts` ist ein kuratierter
// Identitäts-Treffer (§1) und muss BELEGT sein — nicht behauptet. Beleg-Quelle
// ist das Bund-Register (`public/normtext/register.json`, Titel aus der
// Fedlex-Extraktion mit `quelleUrl`/`stand`), ersatzweise die FEDLEX-URL des
// Ziels (dann steht der Eintrag in der Gegenprüfungs-Liste des PR).
//
// Scheiterns-Fähigkeit (§6.7, Rot-Beweis 1.9.2026): ein Titel-Fragment mit
// Tippfehler, ein Kurztitel ohne Register-Treffer und eine Schreibweise, die
// nicht in der Titel-Klammer steht, reissen je einen Fall.

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FEDLEX, type FedlexGesetz } from '../lib/fedlex';
import {
  GENITIV_EINTRAEGE, KUERZEL_SCHREIBWEISEN, TITEL_EINTRAEGE, titelGeltung,
} from '../lib/fedlex/positivliste';

interface RegisterErlass { key: string; ebene: string; titel?: string; quelleUrl?: string; stand?: string }
const register = JSON.parse(readFileSync(join(process.cwd(), 'public', 'normtext', 'register.json'), 'utf8')) as { erlasse: RegisterErlass[] };
// Register-Key ist der kanonisierte FEDLEX-Key (Umlaute → UE/OE/AE, «-»/« » entfernt).
const kanon = (s: string): string =>
  s.toUpperCase().replace(/Ä/g, 'AE').replace(/Ö/g, 'OE').replace(/Ü/g, 'UE').replace(/[^A-Z0-9]/g, '');
const bundTitel = new Map<string, string>();
for (const e of register.erlasse) if (e.ebene === 'bund' && e.titel) bundTitel.set(kanon(e.key), e.titel.replace(/­/g, ''));
const titelVon = (g: FedlexGesetz): string | undefined => bundTitel.get(kanon(g));
const esc = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('Positivliste V-7a — Kurztitel-Genitive', () => {
  it('jeder Eintrag zeigt auf ein FEDLEX-Ziel, Name und Beleg hängen zusammen', () => {
    const namen = new Set<string>();
    for (const e of GENITIV_EINTRAEGE) {
      expect(FEDLEX[e.gesetz], `${e.name}: Ziel ${e.gesetz} fehlt in FEDLEX`).toBeTruthy();
      expect(namen.has(e.name), `${e.name}: doppelter Name`).toBe(false);
      namen.add(e.name);
      if (e.beleg.startsWith('https://')) {
        // Ersatz-Beleg: die FEDLEX-URL des Ziels (Gegenprüfungs-Liste im PR).
        expect(e.beleg).toBe(FEDLEX[e.gesetz]);
      } else {
        // Register-Beleg: der Kurztitel steht im Fedlex-Titel des Ziels UND im Namen.
        const titel = titelVon(e.gesetz);
        expect(titel, `${e.name}: Ziel ${e.gesetz} nicht im Bund-Register — Beleg per URL nötig`).toBeDefined();
        expect(titel!.includes(e.beleg), `${e.name}: Beleg «${e.beleg}» nicht im Register-Titel «${titel}»`).toBe(true);
        expect(e.name.includes(e.beleg), `${e.name}: Beleg «${e.beleg}» nicht Teil des Namens`).toBe(true);
      }
    }
  });

  it('Geltung «bund» für jeden Kurztitel, den ein kantonaler Register-Erlass ebenfalls trägt', () => {
    // Datensignal, kein Raten: existiert im Register ein kantonaler Erlass, dessen
    // Titel mit dem Kurztitel BEGINNT («Datenschutzgesetz (146.1)», «Kantonales
    // Waldgesetz»), darf der Name nicht ebenenübergreifend gelten. Einführungs-
    // gesetze («Einführungsgesetz zum Schweizerischen Zivilgesetzbuch») zählen
    // nicht — sie heissen nie «des Zivilgesetzbuches».
    for (const e of GENITIV_EINTRAEGE) {
      if (e.geltung === 'bund' || e.beleg.startsWith('https://')) continue;
      const stamm = e.beleg;
      const kantonal = register.erlasse.filter((r) => r.ebene === 'kanton'
        && new RegExp(`^(?:Kantonales\\s+)?${esc(stamm)}\\b`).test((r.titel ?? '').replace(/­/g, '')));
      expect(kantonal.map((r) => r.key), `${e.name} (alle): gleichnamiger kantonaler Erlass — Geltung muss «bund» sein`).toEqual([]);
    }
  });
});

describe('Positivliste V-7b — amtliche Volltitel', () => {
  it('Kopf + Fragment ist wörtlich der Register-Titel des Ziels (ohne Klammer-Zusatz und Datum)', () => {
    const paare = new Set<string>();
    for (const e of TITEL_EINTRAEGE) {
      expect(FEDLEX[e.gesetz], `${e.fragment}: Ziel ${e.gesetz} fehlt in FEDLEX`).toBeTruthy();
      const schluessel = `${e.kopf}|${e.fragment}`;
      expect(paare.has(schluessel), `${schluessel}: doppelt`).toBe(false);
      paare.add(schluessel);
      const titel = titelVon(e.gesetz);
      expect(titel, `${e.gesetz}: nicht im Bund-Register`).toBeDefined();
      const kern = titel!.replace(/\s*\([^()]*\)\s*$/, '').replace(/\s+vom\s+\d{1,2}\.\s+\S+\s+\d{4}/, '').replace(/\s+/g, ' ').trim();
      const kopfNominativ = e.kopf === 'Bundesgesetzes' ? 'Bundesgesetz' : 'Verordnung';
      expect(kern, `${e.gesetz}: Fragment «${e.fragment}» ≠ Register-Titel`).toBe(`${kopfNominativ} ${e.fragment}`);
    }
  });

  it('Kopf «Verordnung» gilt nur im Bund, «Bundesgesetzes» überall', () => {
    expect(titelGeltung('Verordnung')).toBe('bund');
    expect(titelGeltung('Bundesgesetzes')).toBe('alle');
  });
});

describe('Positivliste V-8 — amtliche Kürzel-Schreibweisen', () => {
  it('jede Schreibweise steht in der Titel-Klammer ihres Ziels und kanonisiert auf den Key', () => {
    for (const [schreibweise, gesetz] of KUERZEL_SCHREIBWEISEN) {
      expect(FEDLEX[gesetz], `${schreibweise}: Ziel ${gesetz} fehlt in FEDLEX`).toBeTruthy();
      expect(kanon(schreibweise), `${schreibweise}: kanonisiert nicht auf ${gesetz}`).toBe(kanon(gesetz));
      expect(schreibweise).not.toBe(gesetz);
      const titel = titelVon(gesetz);
      expect(titel, `${schreibweise}: Ziel ${gesetz} nicht im Bund-Register`).toBeDefined();
      expect(new RegExp(`\\((?:[^()]*,\\s*)?${esc(schreibweise)}\\)`).test(titel!),
        `${schreibweise}: nicht in der Titel-Klammer «${titel}»`).toBe(true);
    }
  });
});
