import { useId, useRef, useState } from 'react';
import { useLeserSchriftskala as useSchriftskala } from '../leserSchrift';
import { usePopoverAutoZu } from './usePopoverAutoZu';
import {
  HINWEIS_VERMERKE_OHNE_FUSSNOTEN, setzeOption, useLeserOptionen, type OptFeld,
} from '../leserOptionen';

// ─── «Ansicht ▾» der V3-Kopfzeile (FAHRPLAN-LESER-V3 Kap. 4a/4f, H1) ─────────
//
// DREI Schalter, alle zweiwertig (Kap. 4f: 24 → 8 Kombinationen). Der Store
// darunter ist GETEILT mit V1 (FL-6, §5).
//
// S1 (Optionen-Rückbau): der dritte Historie-Modus («Chronologie») und der
// Verweise-Schalter sind nicht mehr bloss aus der V3-BEDIENUNG genommen, sondern
// im Store gestrichen. Die Abbildung `./v3Optionen` (`histZuSicht`/`sichtZuHist`/
// `histUmschalten`) ist damit ersatzlos entfallen — `histansicht` ist ein
// gewöhnliches zweiwertiges Feld, und alle drei Schalter laufen durch `schalte`.
//
// S1-NACHZUG B3 — OFFEN in V3, mit Grund (17.8.2026): der Schalter
// «Änderungsvermerke» wird in V1 nur noch angeboten, wenn der Erlass Vermerke
// TRÄGT (§8, Herleitung in `../berechnungen`). In V3 steht er weiter unbedingt.
// Nicht aus Nachlässigkeit: die Bedingung braucht einen Prop-Weg über
// `leserV3Modell.ts` → `LeserRahmenV3.tsx` → `LeserKopf.tsx`, und alle drei
// Dateien werden von den Etappen H2b und H3 GERADE umgebaut (H3 mit
// unfestgeschriebenen Änderungen im Worktree). Doppelt bauen wäre ein
// Drei-Wege-Konflikt (§0 Ziff. 5: Treffer melden, nicht doppelt bauen). V3 ist
// zudem noch nicht ausgeliefert (H4-Flip wartet auf David), die Asymmetrie
// trifft also keine Nutzerin. Nachzug-Zeile steht in FAHRPLAN-LESER-V3 Kap. 7.
//
// Was hier NICHT steht und bewusst nicht:
//  · Rechtsprechungs-Facetten (Instanz/Kanton/Zeit) — die ziehen in H3 ins
//    Panel, an den Ort ihres Ergebnisses (Kap. 4d). Bis dahin bleiben sie in
//    V3 unsichtbar; ihr Wert im Store wird weder gelesen noch geschrieben, die
//    Ist-Hülle findet ihn also unverändert vor.
//  · Ein Suchfeld — es lebt in der Seitenleiste (Kap. 4b).
//
// A11Y — ehrliche Disclosure, KEIN `role=menu` (Risiko R2, A4-Präzedenz): Der
// Trigger trägt `aria-expanded` + `aria-controls`, das Panel ist eine
// `role="group"` mit `aria-label`; die Schalter sind `role="switch"`. Ein
// `role=menu` verspräche Pfeiltasten-Navigation, die es hier nicht gibt.
// Fokus-Falle, Escape und Fokus-Rückgabe kommen aus dem geteilten
// `useDialogFokus` (§5) — dieselbe Mechanik wie im Ist-Menü.

function V3Switch({ an, label, titel, onKlick, ariaLabel, hinweis }: {
  an: boolean;
  label: string;
  titel: string;
  onKlick: () => void;
  ariaLabel?: string;
  /** Ä27 (S1-Nachzug): erklärende Zeile UNTER dem Schalter — Wortlaut aus der
   *  geteilten Konstante (§5), V1 zeigt denselben Satz. DESCRIPTION, nicht Name:
   *  im `aria-label` hiesse der Schalter «… mit den Fussnoten ausgeblendet» und
   *  enthielte damit den Namen des Nachbar-Schalters (Herleitung und der dadurch
   *  ausgelöste Spec-Bruch stehen in `../LeserAnsichtMenu.tsx`). */
  hinweis?: string;
}) {
  const hinweisId = useId();
  return (
    <div>
    <button
      type="button"
      role="switch"
      aria-checked={an}
      aria-label={ariaLabel}
      aria-describedby={hinweis ? hinweisId : undefined}
      title={hinweis ? `${titel}. ${hinweis}` : titel}
      onClick={onKlick}
      className={`flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-left text-body-s transition-colors hover:bg-brass-100/40 ${
        an ? 'text-ink-900' : 'text-ink-600'
      }`}
    >
      <span>{label}</span>
      {/* `ink-500` statt `ink-400`: der AUS-Zustand ist Text und muss AA tragen
          (derselbe axe-Befund wie im Ist-Menü, 26.7.2026). */}
      <span aria-hidden className={`shrink-0 inline-flex items-center gap-1 text-xs ${an ? 'text-brass-700' : 'text-ink-500'}`}>
        {an ? '✓' : '○'} {an ? 'an' : 'aus'}
      </span>
    </button>
    {/* Geschwister, nicht Kind — sonst wanderte der Text in den Accessible-Name
        (Begründung in `../LeserAnsichtMenu.tsx`). */}
    {hinweis && (
      <p id={hinweisId} className="px-2.5 pb-1 text-micro leading-snug text-ink-500">{hinweis}</p>
    )}
    </div>
  );
}

export function LeserAnsichtV3({ kompakt, fussnotenAnzahl }: {
  /** `true` = Handy-Zuschnitt: der Öffner zeigt «···» statt «Ansicht ▾»
   *  (Fahrplan Kap. 4a). Reine Beschriftung — der Accessible-Name bleibt in
   *  beiden Zuschnitten «Ansicht», und die Elemente des Panels sind identisch. */
  kompakt: boolean;
  fussnotenAnzahl: number | null;
}) {
  const opt = useLeserOptionen();
  const schrift = useSchriftskala();
  const [offen, setOffen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // H3 · GETEILTES AUTO-ZU (§5). Bis H2 standen hier drei lokale Effekte:
  // Fokus-Falle/Esc (`useDialogFokus`), Aussenklick und Wisch-Geste (LM-009).
  // H3 bringt eine zweite aufziehbare Fläche — das Rechtsprechungs-Panel —, und
  // zwei Kopien derselben Bedien-Zusage laufen beim ersten Nachjustieren
  // auseinander. Die Mechanik liegt darum in `./usePopoverAutoZu`; die Herleitung
  // beider Effekte (samt LM-009) steht dort im Kopf, nicht mehr hier.
  usePopoverAutoZu({ offen, schliesse: () => setOffen(false), wrapRef, panelRef, modus: 'popover' });

  const schalte = (feld: OptFeld, an: boolean) => setzeOption(feld, an ? 'aus' : 'an');

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOffen((o) => !o)}
        aria-expanded={offen}
        // NUR im offenen Zustand (Bug-Check B3, 16.8.2026): `aria-controls`
        // zeigt im geschlossenen Zustand auf eine Id, die es im DOM gar nicht
        // gibt — das Panel wird bedingt gerendert. axe meldet das als
        // `aria-valid-attr-value` (kaputte Id-Referenz), und Screenreader
        // bieten einen Sprung an, der ins Leere führt (§8). `aria-expanded`
        // trägt die Zustandsauskunft ohnehin allein. Dasselbe Muster wie im
        // Header-Suchfeld (`aria-controls={zeigtPanel ? listboxId : undefined}`).
        aria-controls={offen ? panelId : undefined}
        aria-label="Ansicht"
        data-v3-ansicht
        className="lc-leiste-griff lc-leiste-griff-fest gap-0.5 px-1 sm:gap-1 sm:px-1.5"
        title="Darstellung: Fussnoten · Änderungsvermerke · Rechtsprechung im Text · Grösse des Gesetzestexts"
      >
        {kompakt
          ? <span aria-hidden>···</span>
          : <><span aria-hidden>◧</span><span className="hidden lg:inline">Ansicht</span><span aria-hidden className={`transition-transform ${offen ? 'rotate-180' : ''}`}>▾</span></>}
      </button>

      {offen && (
        <div
          ref={panelRef}
          id={panelId}
          tabIndex={-1}
          role="group"
          aria-label="Darstellungsoptionen"
          data-v3-ansicht-panel
          className="absolute right-0 top-full z-40 mt-1.5 flex w-[15rem] max-w-[calc(100vw-2rem)] flex-col gap-0.5 rounded-lg border border-line bg-paper-raised p-1.5 shadow-lg"
        >
          <p className="lc-overline px-2.5 pb-1 pt-0.5">Darstellung</p>
          <V3Switch
            an={opt.fussnoten === 'an'}
            label="Fussnoten"
            ariaLabel={fussnotenAnzahl != null && fussnotenAnzahl > 0 ? `Fussnoten (${fussnotenAnzahl})` : undefined}
            titel="Amtlicher Fussnoten-Apparat am Artikelfuss ein- oder ausblenden"
            onKlick={() => schalte('fussnoten', opt.fussnoten === 'an')}
          />
          {/* Kap. 4f: dieselbe Information, EIN Schalter. «aus» blendet NUR die
              build-seitig als Änderungsvermerk klassifizierten Fussnoten (kl:'A')
              samt «Fassung»-Zeile aus; echte Verweise, Grauzone und
              Publikationsnachweise bleiben in jeder Stellung sichtbar
              (H0-Auflage 1, §1/§8). */}
          <V3Switch
            an={opt.histansicht === 'an'}
            label="Änderungsvermerke"
            titel="Änderungsvermerke ein- oder ausblenden — echte Verweise, Grauzone und Publikationsnachweise bleiben sichtbar"
            // Ä27 (S1-Nachzug): dieselbe Auskunft und derselbe Wortlaut wie in V1.
            hinweis={opt.fussnoten === 'aus' ? HINWEIS_VERMERKE_OHNE_FUSSNOTEN : undefined}
            onKlick={() => schalte('histansicht', opt.histansicht === 'an')}
          />
          {/* Umwidmung des `leitfaelle`-Schalters (Kap. 4f): er steuert in V3
              «Rechtsprechung im Text». Regel aus dem V-0-Entscheid David
              16.8.2026: ist er AUS, verschwindet in V3 auch der Öffner des
              Panels — Zähler UND Lasche. Panel und Lasche selbst kommen in H3;
              H1 hält nur den Platz frei. */}
          <V3Switch
            an={opt.leitfaelle === 'an'}
            label="Rechtsprechung im Text"
            titel="Hinweise auf Entscheide im Lesetext ein- oder ausblenden"
            onKlick={() => schalte('leitfaelle', opt.leitfaelle === 'an')}
          />

          {/* ── Schriftgrösse ────────────────────────────────────────────────
              H2 · DEKLARIERTE UMKEHR DER H1-ABWEICHUNG A-1 (David 16.8.2026).
              H1 bediente hier bewusst den GLOBALEN Skala-Store
              (`lexmetrik-schriftskala`) — mit der Begründung, ein zweiter
              Speicher für dieselbe Frage wäre eine zweite Wahrheit (§5).
              Davids Befund am gebauten Stand widerlegt die Prämisse: es ist
              NICHT dieselbe Frage. «Wie gross ist die App» und «wie gross ist
              der Gesetzestext, den ich gerade lese» sind zwei Fragen, und der
              globale Regler beantwortete beide zugleich — gemessen skalierte
              er mit dem Normtext auch Kopfzeile und Seitenleiste mit (StPO/V3,
              3× A+: `<html>` 16 → 20.8 px, Kopfzeile 16 → 20.8 px).
              Neu: vier Stufen im GETEILTEN Leser-Store `lm.leser.optionen`
              (Feld `schrift`, V1 und V3 dieselbe Quelle), wirksam nur auf dem
              Lesekörper. Der globale App-Regler bleibt unberührt.
              TREUE-GRENZE gehalten: die Vorgabestufe emittiert gar keine
              Deklaration (`:not()` im Selektor), der Normtext bleibt exakt
              1.125 rem — der Pixelvergleich PX läuft mit der Änderung 4/4 grün. */}
          {/* ── Ä9 (H2b) · ZWEI STELLER, ZWEI NAMEN ──────────────────────────
              BEFUND, gemessen 17.8.2026 @1440 im Leser: ZWEI Regler mit
              `role="group"` und dem IDENTISCHEN Namen «Schriftgrösse» —
              einer in der Topbar (global, `useSchriftskala`), einer hier. Beide
              zeigten «A− 100 % A+». Der Nutzer konnte nicht wissen, welcher was
              tut; ein Screenreader las zweimal dasselbe.
              WAS H2 SCHON GELÖST HAT: die Stellen sind nicht mehr dieselbe Frage
              — der globale skaliert die ganze Anwendung (WCAG 1.4.4), dieser nur
              den Normtext (`leserSchrift.ts`). Es blieb ein BENENNUNGS-Fehler.
              WARUM DER GLOBALE REGLER IM LESER NICHT VERSCHWINDET (Entscheid
              H2b, im Vollzugsvermerk deklariert): ihn im Leser auszublenden hätte
              genau zwei Wege — (a) an einen Leser-Pfad gebunden: dann verliert die
              EINGEFRORENE Ist-Hülle ihren einzigen Schriftregler, denn sie hat
              keinen eigenen (FL-4-Bruch); (b) an das V3-Flag gebunden: dann wüsste
              die App-Topbar vom Flag, dessen Schaltpunkt ausdrücklich die eine
              Fassade ist (FL-1). Beide Wege kosten mehr, als der Befund wiegt.
              Behoben wird darum die Ursache der Verwechslung: dieser Regler sagt,
              WAS er vergrössert. «Im Leser nur EIN Regler für den Gesetzestext»
              ist damit erfüllt; der zweite ist ein anderes Werkzeug mit anderem
              Namen. Ob der App-Regler im Leser dennoch weichen soll, entscheidet
              David (Vollzugsvermerk, offener Punkt). */}
          <div role="group" aria-label="Grösse des Gesetzestexts" className="mt-1 flex items-center justify-between gap-3 border-t border-line px-2.5 pb-0.5 pt-2">
            <span className="text-body-s text-ink-700">Gesetzestext</span>
            <span className="inline-flex items-center gap-0.5 rounded-md border border-line">
              <button type="button" onClick={schrift.kleiner} disabled={!schrift.kannKleiner}
                aria-label="Gesetzestext verkleinern" title="Gesetzestext verkleinern — die Anwendung bleibt gleich gross"
                data-v3-schrift="kleiner"
                className="min-h-6 px-2 py-1 text-xs text-ink-600 hover:bg-paper-sunken disabled:opacity-40">A−</button>
              <span aria-hidden className="num min-w-[2.6rem] text-center text-micro text-ink-500">{schrift.prozent} %</span>
              <button type="button" onClick={schrift.groesser} disabled={!schrift.kannGroesser}
                aria-label="Gesetzestext vergrössern" title="Gesetzestext vergrössern — die Anwendung bleibt gleich gross"
                data-v3-schrift="groesser"
                className="min-h-6 px-2 py-1 text-xs text-ink-600 hover:bg-paper-sunken disabled:opacity-40">A+</button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
