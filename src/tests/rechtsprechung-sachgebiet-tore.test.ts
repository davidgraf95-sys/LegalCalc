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
import {
  bgeBand, hatSozialversicherungsErlass, istGemischteDritteOerAbteilung,
} from '../../scripts/normtext/entscheide-mapping';
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

/** Aktenzeichen des unterliegenden aza-Urteils. Steht NICHT im Register (dort
 *  fehlt `azaUrteil`), darum aus der Snapshot-Datei des Eintrags gelesen — nur
 *  für die wenigen Band-II-Einträge, die das Tor überhaupt prüft. */
function azaAzVon(e: BrowseEntscheid): string {
  if (!e.datei) return '';
  const p = join('public', 'rechtsprechung', e.datei);
  const wrap = JSON.parse(readFileSync(p, 'utf8')) as { eintraege?: Array<{ azaUrteil?: { aktenzeichen?: string } | null }> };
  return String(wrap.eintraege?.[0]?.azaUrteil?.aktenzeichen ?? '');
}

/** Die EINE deklarierte Ausnahme vom Band-II-Veto (Gegenprüfung Runde 2, G3;
 *  kodiert in `dritteOerSachgebiet`): ein Entscheid der III. öffentlich-
 *  rechtlichen Abteilung (9C — die einzige, die nach Art. 31 BgerR Steuern UND
 *  Sozialversicherung führt), der ausschliesslich Sozialversicherungs-Erlasse
 *  und KEIN Bundes-Steuergesetz trägt. Strukturell geprüft, keine Fall-Liste. */
function istErlaubteBandIIAusnahme(e: BrowseEntscheid): boolean {
  const keys = normKeysVon(e);
  return istGemischteDritteOerAbteilung(azaAzVon(e))
    && hatSozialversicherungsErlass(keys)
    && !keys.some((k) => BUNDES_STEUER_KEYS.has(k));
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
  //
  // EINE AUSNAHME, ENG UND STRUKTURELL (Gegenprüfung Runde 2, Befund G3,
  // 29.8.2026): Ein 9C-Entscheid, der ausschliesslich Sozialversicherungs-
  // Erlasse und kein Bundes-Steuergesetz trägt, IST ein Sozialversicherungsfall
  // — die Bandzuteilung ist dann eine Publikationsentscheidung der Sammlung,
  // kein Gegenbeweis (Anlassfall BGE 149 II 381, «Überarztung», ATSG/KVG).
  // Das Tor bleibt dadurch scharf: Kehrte der 9C-Default zurück, verstiessen
  // die 60 Band-II-Einträge MIT Steuer-Signal weiterhin (sie tragen einen
  // Steuer-Key); kehrte der 8C-Default zurück, verstiessen BGE 149 II 337 und
  // BGE 148 II 73 weiterhin (ihr aza ist nicht 9C). Rot gezeigt am 29.8.2026.
  const bandII = eintraege.filter(
    (e) => e.gericht === 'bge' && bgeBand(String(e.nummer ?? '')) === 'II',
  );
  const bandIISozial = bandII.filter((e) => e.sachgebiet === 'sozialversicherung');

  it('kein Band-II-Leitentscheid ist als Sozialversicherung klassiert — ausser der deklarierten 9C-Ausnahme', () => {
    const verstoesse = bandIISozial
      .filter((e) => !istErlaubteBandIIAusnahme(e))
      .map((e) => `${e.nummer} (${e.key})`);
    expect(verstoesse).toEqual([]);
  });

  it('die Ausnahme existiert wirklich — sonst wäre die Einschränkung tot', () => {
    // Gegenprobe (§6.7, Muster Tor B): Gäbe es keinen einzigen Fall, der die
    // Ausnahme braucht, wäre sie eine Bedingung ohne Wirkung und gehörte
    // gestrichen statt bewacht (§17-Rückbau).
    expect(bandIISozial.filter(istErlaubteBandIIAusnahme).length).toBeGreaterThan(0);
  });

  it('das Tor misst wirklich am Bestand (sonst prüfte es die leere Menge)', () => {
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
