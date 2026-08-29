// Tore gegen die Wiederkehr der Sachgebiets-Pauschalen im Rechtsprechungs-Korpus.
//
// ANLASS: Gegenprüfung der W2-Trennung vom 29.8.2026, Befunde F1/F3. Die Zeile
// `'9C': 'sozialversicherung'` etikettierte 71 Leitentscheide falsch, ohne dass
// irgendein Tor angeschlagen hätte — die Klassierung war in sich konsistent und
// nur fachlich falsch. Beide Tore hier prüfen darum nicht die Kette gegen sich
// selbst, sondern das AUSGELIEFERTE Register gegen eine amtliche Invariante.
//
// Sie greifen nicht nur für den einen behobenen Fall, sondern für jede künftige
// Regel-Änderung, die dieselbe Verwechslung wieder einbaut (§17-Wurzelfix).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { bgeBand, hatSozialversicherungsErlass } from '../../scripts/normtext/entscheide-mapping';
import type { BrowseEntscheid } from '../lib/rechtsprechung/register';

const REGISTER = join('public', 'rechtsprechung', 'register.json');
const eintraege: BrowseEntscheid[] =
  JSON.parse(readFileSync(REGISTER, 'utf8')).entscheide as BrowseEntscheid[];

/** Bundes-Steuererlasse mit Register-key. «StG» fehlt bewusst: der Key ist
 *  föderal/kantonal mehrdeutig und steht in ABK_AUSSCHLUSS. */
const BUNDES_STEUER_KEYS = new Set(['DBG', 'STHG', 'MWSTG', 'VSTG']);

function normKeysVon(e: BrowseEntscheid): string[] {
  return (e.normKeys ?? []).map((k) => String(k).toUpperCase());
}

describe('Tor A — BGE Band II trägt nie «sozialversicherung»', () => {
  // AMTLICHE GRUNDLAGE: Die amtliche Sammlung ordnet ihre Bände nach
  // Rechtsgebiet — Band II ist das Band für Verwaltungsrecht und
  // internationales öffentliches Recht (mit dem Abgaberecht), Band V das
  // Sozialrechts-Band. Ein vom Bundesgericht selbst in Band II publizierter
  // Entscheid ist nach eben dieser Einordnung kein Sozialversicherungsfall.
  //
  // WAS DAS TOR FÄNGT: jede Abteilungs-Pauschale, die sich über den Band
  // hinwegsetzt. Genau das passierte zweimal — 68 Leitentscheide über den
  // 9C-Default (Art. 31 BgerR führt dort AUCH die Steuern) und zwei weitere
  // über den 8C-Default (die IV. Abteilung führt neben der Sozialversicherung
  // auch öffentliches Personalrecht und Staatshaftung: BGE 149 II 337,
  // BPG-Kündigung einer SBB-Angestellten; BGE 148 II 73, Staatshaftung der
  // ETHL). Ein Abteilungs-Default darf den Band nie überstimmen.
  it('kein Band-II-Leitentscheid ist als Sozialversicherung klassiert', () => {
    const verstoesse = eintraege
      .filter((e) => e.gericht === 'bge')
      .filter((e) => bgeBand(String(e.nummer ?? '')) === 'II')
      .filter((e) => e.sachgebiet === 'sozialversicherung')
      .map((e) => `${e.nummer} (${e.key})`);
    expect(verstoesse).toEqual([]);
  });

  it('das Tor misst wirklich am Bestand (sonst prüfte es die leere Menge)', () => {
    const bandII = eintraege.filter(
      (e) => e.gericht === 'bge' && bgeBand(String(e.nummer ?? '')) === 'II',
    );
    expect(bandII.length).toBeGreaterThan(100);
  });
});

describe('Tor B — Bundes-Steuererlass ohne Sozialversicherungs-Erlass ⇒ nie «sozialversicherung»', () => {
  // WARUM DIE ENGE FASSUNG — gemessen VOR dem Scharfstellen (29.8.2026), wie
  // es §6.7 verlangt: Die BREITE Fassung («Steuer-normKey ⇒ nie
  // sozialversicherung») hätte am Bestand 10 Einträge gemeldet, und ALLE ZEHN
  // sind echte Sozialversicherungsfälle, die ein Steuergesetz nur mitzitieren:
  //   · BGE 151 V 343, 151 V 326, 148 V 277, 147 V 242, 147 V 114,
  //     146 V 341, 146 V 224 — allesamt Band V, das Sozialrechts-Band;
  //   · AH.2023.4, AH.2021.9 (AHV) und UV.2020.40 (UV) — kantonal.
  // Der Grund ist systematisch, nicht zufällig: die AHV-Beiträge
  // Selbstständigerwerbender werden nach Art. 23 AHVV aus der Steuermeldung
  // der kantonalen Steuerbehörde abgeleitet, ein AHV-Beitragsfall zitiert
  // darum regelmässig das DBG. Ein breites Tor wäre also nicht «streng»,
  // sondern schlicht falsch — es zwänge dazu, richtige Klassierungen kaputt
  // zu machen, damit es grün wird.
  //
  // Die enge Fassung nimmt darum den Sozialversicherungs-Erlass (SR 830–838)
  // als Ausnahme heraus und hat am Bestand 0 Treffer. Sie fängt weiterhin
  // genau den Defekt, um den es geht: einen REINEN Steuerfall, der als
  // Sozialversicherung etikettiert ist (BGE 150 II 26, «Art. 117/120 DBG,
  // Unterbrechung der Verjährung» — stand vor der Korrektur so da).
  it('kein Eintrag mit reinem Bundes-Steuer-Signal ist als Sozialversicherung klassiert', () => {
    const verstoesse = eintraege
      .filter((e) => e.sachgebiet === 'sozialversicherung')
      .filter((e) => normKeysVon(e).some((k) => BUNDES_STEUER_KEYS.has(k)))
      .filter((e) => !hatSozialversicherungsErlass(normKeysVon(e)))
      .map((e) => `${e.gericht} ${e.nummer} [${normKeysVon(e).join(',')}]`);
    expect(verstoesse).toEqual([]);
  });

  it('die herausgenommene Ausnahme existiert wirklich — sonst wäre die Einschränkung tot', () => {
    // Gegenprobe zur Einschränkung oben (§6.7): Gäbe es die Fälle
    // «Sozialversicherung MIT Steuer- UND SV-Erlass» nicht, wäre der
    // SV-Erlass-Filter eine Bedingung ohne Wirkung und gehörte gestrichen.
    const echteAusnahmen = eintraege
      .filter((e) => e.sachgebiet === 'sozialversicherung')
      .filter((e) => normKeysVon(e).some((k) => BUNDES_STEUER_KEYS.has(k)))
      .filter((e) => hatSozialversicherungsErlass(normKeysVon(e)));
    expect(echteAusnahmen.length).toBeGreaterThan(0);
  });
});
