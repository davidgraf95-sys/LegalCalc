// ─── «Rechtsprechung ▾» — eigenes Dropdown der Leser-Werkzeugleiste (W2·7-BEZUG/B4) ─
//
// Vorgabe David 28.7.2026: die Auswahl, WELCHE Rechtsprechung am Artikel steht,
// bekommt ein EIGENES Dropdown in der Leser-Werkzeugleiste («Gesetze › Bund ›
// ZGB · Art. 212 ZGB · Im Gesetz suchen … · Ansicht ▾ · Stand …»), analog zum
// bestehenden «Ansicht ▾» — nicht als weiterer Streifen IN «Ansicht» und nicht
// nur in der Artikel-Sektion.
//
// ── ARBEITSTEILUNG DER BEIDEN DROPDOWNS ────────────────────────────────────
// «Ansicht ▾»          — WIE der Gesetzestext dargestellt wird (Linien,
//                        Fussnoten, Verweise).
// «Rechtsprechung ▾»   — WELCHE Entscheide die Zeile zeigt (Instanzen, Kantone,
//                        seit B5: Zeitraum über Zeitstrahl und Von-Bis-Datum).
// Die Trennung ist die Frage, die der Nutzer stellt — «wie sieht es aus?» gegen
// «was steht drin?» —, nicht die Technik dahinter.
//
// ── ANDOCKPUNKT B5 — EINGELÖST (28.7.2026) ─────────────────────────────────
// Der Panel-Inhalt ist eine Folge benannter Abschnitte. B5 hat seinen Zeitstrahl
// + die Von-Bis-Datumseingabe als WEITEREN Abschnitt ergänzt
// (`components/verzahnung/BezugZeitWahl.tsx`), ohne die Facetten-Steuerung, die
// Artikel-Fuss-Darstellung oder dieses Gerüst umzubauen: der Andockpunkt hat
// gehalten, was er versprach. Beide Steuerungen sind vollständig gesteuert und
// kennen weder dieses Menü noch die Werkzeugleiste.
//
// REIHENFOLGE DER ABSCHNITTE: erst WELCHE Instanzen, dann AUS WELCHER ZEIT. Das
// ist die Reihenfolge, in der die Auswahl wirkt (der Zeitstrahl zeigt die
// Verteilung der bereits gewählten Instanzen) — und die, in der man fragt.
//
// Bedien-/A11y-Mechanik ist bewusst die BAUGLEICHE wie in `LeserAnsichtMenu`
// (ehrliche Disclosure, KEIN role=menu — ein Menü verspräche eine
// Pfeiltasten-Bedienung, die es nicht gibt; `useDialogFokus` für Fokus-Falle,
// Escape und Fokus-Rückgabe; pointerdown-ausserhalb schliesst). Zwei Dropdowns
// nebeneinander, die sich verschieden bedienen liessen, wären die schlechtere
// Wucherung als ein Stück doppelte Mechanik (§5 gilt dem Fachinhalt, nicht der
// Bedien-Konvention).

import { useEffect, useId, useRef, useState } from 'react';
import { useDialogFokus } from '../../components/layout/useDialogFokus';
import { BezugFacettenWahl } from '../../components/verzahnung/BezugFacettenWahl';
import { BezugZeitWahl } from '../../components/verzahnung/BezugZeitWahl';
import {
  setzeBezugKlassen, setzeBezugKantone, setzeBezugZeit, setzeOption,
  useBezugKlassen, useBezugKantone, useLeserOptionen,
} from './leserOptionen';
import { istErweitert } from './bezugAuswahl';
import { istBereichOffen, type Histogramm, type Zeitbereich } from './bezugZeit';
import { ladeBezugsBilanz, type BezugsBilanz, type KlassenZahlen } from '../../lib/rechtsprechung/bezuege';
import type { BezugStatus } from '../../lib/verzahnung/facetten';

const LEERES_HISTOGRAMM: Histogramm = { balken: [], ohneJahr: 0 };
const OFFEN: Zeitbereich = { von: '', bis: '' };
const LEERE_KLASSEN: Partial<Record<BezugStatus, KlassenZahlen>> = {};

/**
 * Panelbreite in px — EINE Zahl, aus der sowohl die CSS-Breite als auch die
 * Randklemmung unten rechnet (§5). Als Tailwind-Klasse `w-[17rem]` plus separate
 * JS-Konstante wären es zwei Wahrheiten, die beim ersten Nachjustieren
 * auseinanderlaufen — und die Klemmung rechnete dann still falsch.
 *
 * B5: 240 → 272 px. Gemessen 28.7.2026: bei 240 px schnitt das native
 * Datumsfeld die Jahreszahl ab («31.12.202»), und zwanzig Balken standen auf je
 * 9 px.
 */
const PANEL_PX = 272;
/** Mindestabstand zum Fensterrand, wenn das Panel geklemmt werden muss. */
const RAND_PX = 8;
/** Was das Panel dem Fenster insgesamt lässt, wenn es breiter wäre als dieses
 *  (= die `max-width` unten). Auch diese Zahl trägt beides: CSS und Klemmung. */
const FENSTER_RESERVE_PX = 32;

export function LeserRechtsprechungMenu({
  kantoneVerfuegbar = [], klassenImErlass = LEERE_KLASSEN,
  histogramm = LEERES_HISTOGRAMM, bereich = OFFEN,
}: {
  /** Kantone, zu denen DIESER Erlass Kanten hat (aus dem geladenen Bezugs-Shard).
   *  Leer ⇒ kein Kanton-Streifen (nichts zu filtern, §13 F4). */
  kantoneVerfuegbar?: string[];
  /** B7/c: Kanten je Instanz-Klasse in DIESEM Erlass — die Zahl am Schalter.
   *  Leer ⇒ es steht keine Zahl da (Shard noch nicht geladen), nie eine 0. */
  klassenImErlass?: Partial<Record<BezugStatus, KlassenZahlen>>;
  /** B5: Jahres-Verteilung der Kanten dieses Erlasses (Zeitstrahl). Leer =
   *  Shard noch nicht geladen ⇒ der Streifen sagt das, statt eine Grafik ohne
   *  Inhalt zu zeigen. */
  histogramm?: Histogramm;
  /** B5: aktiver Von-Bis-Bereich. Default = beide Enden offen. */
  bereich?: Zeitbereich;
}) {
  const opt = useLeserOptionen();
  const klassen = useBezugKlassen();
  const kantone = useBezugKantone();
  const [offen, setOffen] = useState(false);
  // Wie weit muss das Panel nach RECHTS geschoben werden, damit es nicht links
  // aus dem Fenster läuft? 0 = gar nicht (der Normalfall auf dem Desktop).
  const [schub, setSchub] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useDialogFokus(offen, panelRef, () => setOffen(false));

  // B7/c: die korpusweite Facetten-Bilanz erklärt eine LEERE Klasse («Eidg. 0 —
  // korpusweit 164 Kanten an 93 Artikeln»). Geladen wird sie erst beim ÖFFNEN
  // des Panels und genau einmal je Sitzung (Cache in `ladeBezugsBilanz`): sie
  // beantwortet eine Frage, die man nur im geöffneten Menü stellt, und darf
  // darum nichts kosten, solange es zu ist (§15). Bleibt sie aus, fehlt nur der
  // erklärende Zusatz — die Zahl des Erlasses steht trotzdem da.
  const [bilanz, setBilanz] = useState<BezugsBilanz | null>(null);
  useEffect(() => {
    if (!offen || bilanz) return;
    let lebt = true;
    void ladeBezugsBilanz().then((b) => { if (lebt && b) setBilanz(b); });
    return () => { lebt = false; };
  }, [offen, bilanz]);

  /**
   * Öffnen mit Randklemmung.
   *
   * BEFUND 28.7.2026, an der Geometrie gemessen: bei 390 px Fensterbreite sass
   * die linke Panel-Kante auf x = −94 — knapp ein Drittel der Steuerung lag
   * ausserhalb des Fensters, darunter der «von»-Beschriftungstext. Das Panel
   * hängt mit `right-0` am Auslöser, und der Auslöser steht mitten in der
   * Werkzeugleiste, nicht an deren rechtem Rand; `max-width` hilft dagegen
   * nichts, weil nicht die Breite überläuft, sondern die Verankerung. (Der
   * Befund ist mit B4 entstanden — dort lag die Kante bei −62 — und wurde mit
   * der breiteren B5-Fläche grösser. Behoben wird er hier, weil eine Steuerung,
   * die man nicht ganz sieht, keine Steuerung ist.)
   *
   * Gerechnet wird BEIM KLICK, nicht in einem Layout-Effekt nach dem Rendern:
   * die rechte Kante des Auslösers steht in diesem Moment fest, die
   * Panelbreite ist deklariert — es braucht keine Messung des noch nicht
   * gerenderten Panels und es gibt darum auch kein sichtbares Zurückspringen.
   */
  function umschalten(): void {
    if (offen) { setOffen(false); return; }
    const r = wrapRef.current?.getBoundingClientRect();
    if (r && typeof window !== 'undefined') {
      const breite = Math.min(PANEL_PX, window.innerWidth - FENSTER_RESERVE_PX);
      const links = r.right - breite;
      setSchub(links < RAND_PX ? Math.round(RAND_PX - links) : 0);
    }
    setOffen(true);
  }

  useEffect(() => {
    if (!offen) return;
    const klick = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOffen(false);
    };
    document.addEventListener('pointerdown', klick);
    return () => document.removeEventListener('pointerdown', klick);
  }, [offen]);

  // Der Auslöser trägt ein dezentes Signal, wenn die Auswahl vom Grundzustand
  // abweicht — sonst müsste man das Menü öffnen, um zu sehen, dass ein Filter
  // wirkt (§8: kein unsichtbar wirkender Filter). Ein Punkt, kein Zähler: die
  // Werkzeugleiste soll nicht voller werden als nötig.
  //
  // B5: ein aktiver ZEITRAUM zählt dazu. Er ist der Filter, der am stärksten
  // wegnimmt und dabei am wenigsten sichtbar ist — die Auflistung wird bloss
  // kürzer, ohne dass irgendwo ein Schalter anders aussähe. Ohne dieses Signal
  // wäre die §8-Zusage «kein unsichtbar wirkender Filter» genau hier gebrochen.
  const abweichend = istErweitert(klassen) || !istBereichOffen(bereich);

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <button
        type="button"
        onClick={umschalten}
        aria-expanded={offen}
        aria-controls={panelId}
        aria-label="Rechtsprechung"
        data-rechtsprechung-menu
        className="lc-leiste-griff lc-leiste-griff-fest gap-0.5 px-1 sm:gap-1 sm:px-1.5"
        title="Welche Entscheide unter den Artikeln stehen: Instanzen, Kantone und Zeitraum"
      >
        <span aria-hidden>§</span>
        {/* Das Wort erst ab lg. Gemessen 28.7.2026 (B4): bei 774 px drängte die
            ausgeschriebene Beschriftung den Breadcrumb auf «Ge… › B… › S…»
            zusammen — die Werkzeugleiste soll nicht voller werden als nötig
            (Vorgabe David). B6 hat die Gegenprobe gemacht (beide Wörter ab md):
            bei 768 px blieben der Ortsangabe 152 px statt der nötigen ~200 —
            der Befund hält, die Schwelle bleibt lg. «Ansicht ▾» ist jetzt
            DIESELBE (vorher sm), damit die zwei als Paar schalten. Der
            Accessible-Name bleibt über `aria-label` erhalten, das Dropdown ist
            also in JEDER Breite benannt. */}
        <span className="hidden lg:inline">Rechtsprechung</span>
        {abweichend && <span aria-hidden className="lc-punkt lc-punkt-entscheid" />}
        <span aria-hidden className={`transition-transform ${offen ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {offen && (
        <div
          ref={panelRef}
          id={panelId}
          tabIndex={-1}
          role="group"
          aria-label="Auswahl der Rechtsprechung"
          // Breite und Klemmung kommen aus DENSELBEN Konstanten wie die
          // Rechnung in `umschalten` (§5) — darum als style, nicht als
          // Tailwind-Klasse mit eigener Zahl.
          style={{
            width: `min(${PANEL_PX}px, calc(100vw - ${FENSTER_RESERVE_PX}px))`,
            transform: schub ? `translateX(${schub}px)` : undefined,
          }}
          className="absolute right-0 top-full z-40 mt-1.5 flex flex-col gap-0.5 rounded-lg border border-line bg-paper-raised p-1.5 shadow-lg"
        >
          <p className="lc-overline px-2.5 pb-1 pt-0.5">Entscheide am Artikel</p>

          {opt.leitfaelle === 'an' ? (
            <>
              <BezugFacettenWahl
                klassen={klassen}
                kantone={kantone}
                kantoneVerfuegbar={kantoneVerfuegbar}
                klassenImErlass={klassenImErlass}
                bilanz={bilanz}
                onKlassen={setzeBezugKlassen}
                onKantone={setzeBezugKantone}
              />
              {/* Der Zeitstrahl steht nur da, wo überhaupt Entscheide gezeigt
                  werden: sind ALLE Instanzen abgewählt, filterte er eine leere
                  Menge — ein Steuerelement ohne Wirkung (§13 F4). Der eingestellte
                  Bereich bleibt dabei gespeichert und kehrt mit der ersten wieder
                  eingeschalteten Instanz zurück. */}
              {klassen.length > 0 && (
                <BezugZeitWahl
                  bereich={bereich}
                  histogramm={histogramm}
                  onBereich={setzeBezugZeit}
                />
              )}
            </>
          ) : (
            // ── SACKGASSE AUS B4, hier geschlossen (Befund beim Bau von B5) ──
            // Kein totes Steuerelement (§13 F4): ist die Kanten-Zeile per
            // `data-leitfaelle="aus"` CSS-seitig abgeschaltet (index.css), wirkt
            // die Facetten-Wahl nicht — das wird gesagt, statt Schalter zu
            // zeigen, die nichts tun. Der Zweig IST erreichbar: die
            // B4-Migration überführt ein gespeichertes «Entscheide aus» in
            // `bezugKlassen: []`, lässt `opt.leitfaelle` aber auf 'aus' stehen.
            //
            // Bis hierher verwies der Text auf «Ansicht ▾ › Entscheide» — einen
            // Schalter, den B4 ENTFERNT hat. Die Meldung benannte damit ein
            // Steuerelement, das es nicht gibt (§8), und weil seither KEINE
            // Stelle mehr `setzeOption('leitfaelle', …)` aufruft, gab es
            // buchstäblich keinen Weg zurück: eine Facette wieder einzuschalten
            // half nichts, weil die CSS-Regel die Zeile weiterhin ausblendete.
            // Der Ausweg gehört darum genau dorthin, wo der Verlust auffällt.
            <div className="px-2.5 pb-1 pt-1">
              <p className="text-micro leading-snug text-ink-500">
                Die Entscheide am Artikel sind ausgeblendet — aus einer früheren Einstellung, die es so nicht mehr gibt. Es wird gerade keine Rechtsprechung unter den Artikeln gezeigt.
              </p>
              <button
                type="button"
                data-entscheide-zurueck
                onClick={() => setzeOption('leitfaelle', 'an')}
                className="mt-1.5 rounded px-1.5 py-0.5 text-xs text-ink-500 transition-colors hover:bg-brass-100/40 hover:text-brass-700"
                title="Die Entscheide-Auflistung am Artikel wieder einblenden — danach hier die gewünschten Instanzen wählen"
              >
                Entscheide wieder einblenden
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
