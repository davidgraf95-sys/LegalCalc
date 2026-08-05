import { KANTONE } from '../../lib/kantone';
import type { Kanton } from '../../types/legal';
import { gerichtsErlass } from '../../data/gerichtsorganisationErlasse';
import type { KvMaterie } from '../../lib/vorlagen/klageVereinfacht';
import { SgAdressatKachel } from './SgBehoerdenWahl';
import { KvGerichtWahl } from './KvGerichtWahl';
import { Checkbox, Field, GruppenTitel, inputCls } from './ui';
import { usePaneKlasse } from '../layout/PaneKontext';

// ─── Gerichtswahl-Block der Klage-/Familienrecht-Masken (Entdopplung D2) ────
// Reine Darstellung (§3): Kantonswahl · Adressat-Kachel · Rechtsgrundlage der
// Gerichtsorganisation · kantonale Gerichtsauflösung · Handeingabe. Der Block
// stand 6x kopiert in den Vorlagen-Seiten (Code-Inventur 4.8.2026, Posten D2).
//
// §1-Leitplanke: Jede Abweichung zwischen den Kopien ist hier ein EXPLIZITER
// Prop, kein stillschweigend vereinheitlichter Default — Wortlaute, Labels,
// Platzhalter und Spaltenklassen bleiben je Maske exakt die bisherigen.
//
// BEWUSST NICHT eingebunden: VorlageSchlichtungsgesuchBs. Dort geht es um die
// Schlichtungsbehörde, nicht um das Gericht — andere Registry (behoerdeFuer),
// anderer Auflöser (SgBehoerdenWahl mit fünf fachlichen Zusatz-Props), eigene
// Schema-Felder (behoerde*) und zwei fachliche Zwischenblöcke (Art. 200 ZPO,
// BS-Routing-Warnung). Eine gemeinsame Abstraktion würde zwei rechtlich
// verschiedene Adressaten gleichmachen (§1) — dort wird nur die identische
// GerichtsGrundlageZeile mitbenutzt.

export type AufgeloesteAdresse = { zeilen: string[]; url?: string };
export type ManuelleAdresse = { name: string; strasse: string; plzOrt: string };

/** Zeile «Rechtsgrundlage Gerichtsorganisation» — in allen sechs Masken
 *  byte-identisch (Auftrag David 10.6.2026: Direktlink auf den kantonalen
 *  Gerichtsorganisations-Erlass; ohne url nur die Erlass-Angabe, §8). */
export function GerichtsGrundlageZeile({ kanton }: { kanton: Kanton }) {
  const e = gerichtsErlass(kanton);
  return (
    <p className="text-xs text-ink-500">
      Rechtsgrundlage Gerichtsorganisation: {e.url
        ? <a href={e.url} target="_blank" rel="noreferrer" className="text-brass-700 underline">{e.abk} {kanton} ({e.nummer}) ↗</a>
        : <>{e.abk} {kanton} ({e.nummer})</>}
    </p>
  );
}

export function GerichtsWahlBlock({
  kanton, onKanton, layout, kantonHinweis, gruppenTitel,
  bsAdresse, aufgeloest, ohneAdresseHinweis,
  materie, onAufgeloest,
  manuellAktiv, onManuellAktiv, uebersteuertHinweis,
  manuell, onManuell, platzhalter, spaltenKlasse,
}: {
  kanton: Kanton;
  onKanton: (k: Kanton) => void;
  /** 'nebeneinander' = GruppenTitel, Kantonswahl links und Adresskachel rechts
   *  (Klage-Masken, Original-Basel-Darstellung 10.6.2026).
   *  'gestapelt' = Kanton-Feld über volle Breite mit Gerichtsstand-Hinweis,
   *  Kachel darunter (Familienrecht-Masken). */
  layout: 'nebeneinander' | 'gestapelt';
  /** hint am Kanton-Feld — nur im Layout 'gestapelt' belegt. */
  kantonHinweis?: string;
  /** Überschrift — nur im Layout 'nebeneinander' belegt. */
  gruppenTitel?: string;
  /** Adressat für Kanton BS. Seitenspezifisch aufgelöst: die vereinfachte
   *  Klage wählt den Spruchkörper routing-abhängig (§ 71 GOG BS), die übrigen
   *  Masken adressieren fest das Zivilgericht. */
  bsAdresse: AufgeloesteAdresse;
  /** Ergebnis der kantonalen Gerichtsauflösung (Schema-Feld gerichtAufgeloest). */
  aufgeloest?: AufgeloesteAdresse;
  /** Wortlaut der Fallback-Notiz, wenn weder BS noch aufgelöst — je Maske
   *  verschieden formuliert, deshalb Prop und kein Default. */
  ohneAdresseHinweis: string;
  /** Materie für die Spezialgerichts-Prüfung in KvGerichtWahl; ausserhalb der
   *  vereinfachten Klage leer (dort gibt es keine Materie-Auswahl). */
  materie: KvMaterie | '';
  onAufgeloest: (a: AufgeloesteAdresse | null) => void;
  manuellAktiv: boolean;
  onManuellAktiv: (v: boolean) => void;
  /** Zusatz «(übersteuert die hinterlegte Anschrift)» am Checkbox-Label. */
  uebersteuertHinweis: boolean;
  manuell?: ManuelleAdresse;
  onManuell: (g: ManuelleAdresse) => void;
  /** Platzhalter der Handeingabe-Felder; fehlende Einträge rendern — wie
   *  bisher — gar kein placeholder-Attribut. */
  platzhalter?: { name?: string; strasse?: string; plzOrt?: string };
  /** Grid-Klasse für Strasse + PLZ. Default ist die pane-adaptive Klasse;
   *  das gemeinsame Scheidungsbegehren übergibt die feste Viewport-Klasse. */
  spaltenKlasse?: string;
}) {
  const pk = usePaneKlasse();
  const spalten = spaltenKlasse
    ?? pk('grid grid-cols-1 sm:grid-cols-2 gap-3', 'grid grid-cols-1 @lg/pane:grid-cols-2 gap-3');

  const kantonFeld = (
    <Field label="Kanton" hint={kantonHinweis}>
      <select className={inputCls} value={kanton}
        onChange={(e) => onKanton(e.target.value as Kanton)}>
        {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
      </select>
    </Field>
  );

  const adressat = !manuellAktiv && (kanton === 'BS' ? (
    <SgAdressatKachel zeilen={bsAdresse.zeilen} url={bsAdresse.url} />
  ) : aufgeloest ? (
    <SgAdressatKachel zeilen={aufgeloest.zeilen} url={aufgeloest.url} />
  ) : (
    <div className="lc-notice text-body-s">{ohneAdresseHinweis}</div>
  ));

  return (
    <div className="space-y-3">
      {layout === 'nebeneinander' ? (
        <>
          <GruppenTitel>{gruppenTitel}</GruppenTitel>
          <div className="grid grid-cols-[8rem_1fr] gap-3 items-start">
            {kantonFeld}
            {adressat}
          </div>
        </>
      ) : (
        <>
          {kantonFeld}
          {adressat}
        </>
      )}
      <GerichtsGrundlageZeile kanton={kanton} />
      {kanton !== 'BS' && !manuellAktiv && (
        <KvGerichtWahl kanton={kanton} materie={materie} onAufgeloest={onAufgeloest} />
      )}
      <Checkbox
        checked={manuellAktiv}
        onChange={onManuellAktiv}
        label={uebersteuertHinweis
          ? <><span>Adresse des Gerichts von Hand erfassen <span className="text-ink-500">(übersteuert die hinterlegte Anschrift)</span></span></>
          : <><span>Adresse des Gerichts von Hand erfassen</span></>} />
      {manuellAktiv && (
        // Layout 11.6.2026 (Auftrag David, einheitlich mit dem
        // Schlichtungsgesuch): Name volle Breite, Strasse + PLZ zweispaltig.
        <div className="space-y-3 pl-6">
          <Field label="Gericht">
            <input className={inputCls} value={manuell?.name ?? ''}
              onChange={(e) => onManuell({ name: e.target.value, strasse: manuell?.strasse ?? '', plzOrt: manuell?.plzOrt ?? '' })}
              placeholder={platzhalter?.name} />
          </Field>
          <div className={spalten}>
            <Field label="Strasse und Hausnummer">
              <input className={inputCls} value={manuell?.strasse ?? ''}
                onChange={(e) => onManuell({ name: manuell?.name ?? '', strasse: e.target.value, plzOrt: manuell?.plzOrt ?? '' })}
                placeholder={platzhalter?.strasse} />
            </Field>
            <Field label="PLZ und Ort">
              <input className={inputCls} value={manuell?.plzOrt ?? ''}
                onChange={(e) => onManuell({ name: manuell?.name ?? '', strasse: manuell?.strasse ?? '', plzOrt: e.target.value })}
                placeholder={platzhalter?.plzOrt} />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}
