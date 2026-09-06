import { useEffect, useId, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePaneKlasse } from '../layout/PaneKontext';
import { useUniversalSuche } from '../suche/useUniversalSuche';
import { SuchResultate } from '../suche/SuchResultate';
import { aktivePosition, flacheTreffer, naechsterKey, vorigerKey, gewaehlterHref } from '../suche/trefferAuswahl';

// ─── Universal-Suche (Held der Startseite) ──────────────────────────────────
//
// Prominentes Feld über Rechner+Vorlagen, Fristen-Vorlagen, Gesetze und
// Rechtsprechung. Teilt seit der UI-Welle Hook (useUniversalSuche) und
// Trefferpanel (SuchResultate) mit der Header-Suche — EIN Suchweg, EIN
// Resultat-Dropdown (Auftrag David, §5). Eigenheit des Hero gegenüber dem
// Header: der Suchwert ist über ?q= teilbar/permalinkfähig und steht prominent.
// SSR/Prerender: kein Autofokus (Mobil-Tastatur verdeckt sonst die Treffer).
//
// W2·24-R3 (nur Darstellung, §3 — Hook, Trefferpanel, Tastatur und ?q=-Kopplung
// sind Zeile für Zeile unverändert): aus dem gerahmten `lc-input`-Kasten mit
// Lupen-Icon ist die SUCHZEILE des Referenzbildes geworden — eine Zeile Literata
// über einer 2-px-Kante (`.st-frage`, src/index.css). Die Lupe entfällt: sie war
// die Ikone, die den Kasten als Suchfeld auswies; die Zeile weist sich über
// `role="search"`, `type="search"` und ihren Beispiel-Platzhalter aus. Der
// PLATZHALTER nennt jetzt konkrete Eingaben statt Gattungswörter — dieselbe
// Aussage, an einem Beispiel statt an einer Aufzählung.
//
// R3-NACHZUG 6.9.2026 — DIESE ANNAHME IST WIDERLEGT (David am Bild, Befund D1):
// «Die grosse Suchzeile liest sich als Überschrift, nicht als Eingabefeld.»
// `role`/`type`/Platzhalter sind Auszeichnung, kein Bild — was man sah, war eine
// Zeile Literata in derselben Grösse wie die Begrüssung darüber. Die Lupe kommt
// darum zurück, aber IN die Zeile (SVG, `currentColor`, nicht in einem Kasten),
// und über der Zeile steht ein Label «Suchen» in Archivo — dieselbe Anordnung,
// die das Referenzbild seinen Werkzeug-Feldern gibt («.werk label»).
// Das Label ist ein echtes <label>: es benennt das Feld (Klick fokussiert) und
// trägt den vollen Scope-Satz als sr-only-Fortsetzung, damit der zugängliche
// Name den sichtbaren Text ENTHÄLT (WCAG 2.5.3) — das frühere `aria-label`
// hätte ihn ersetzt.
// Der PLATZHALTER ist gekürzt (Prüfbefund R3-F6): «… · Kündigungsfrist» wurde
// @390 mitten im Wort gekappt. Zwei Beispiele reichen, und `.st-frage-feld`
// setzt zusätzlich `text-overflow: ellipsis` (index.css).
//
// R10-NACHZUG (David 6.9.2026, D14: «begrüssung prominenter und suche
// kleiner»): die Zeile trug bis hierhin dieselbe Grösse wie die Begrüssung
// (bis `text-h1`, 32 px) — GENAU das Bild, das David als «liest sich wie eine
// Überschrift» sah (R3-F1). Jetzt ist die Begrüssung (`SuchBlock.tsx`) die
// grosse Zeile, und das Feld eine Stufe darunter: `text-body-l` (18 px, ein
// Skalenwert der Typo-Skala) @390, ab `lg` die Token-Variable
// `--pult-suche-gross` (22 px, `index.css`) über `text-[length:var(--…)]`
// (B2: `check:design-tokens` verbietet rohe `text-[…rem]`). 22 px ist auf der
// Skala frei (h3=20, h2=25.6) — ein eigener Wert statt Zwischenrundung, weil
// beide Nachbarwerte hier sichtbar daneben liegen (20 zu nah an body-l, 25.6
// kaum kleiner als die Begrüssungs-Stufe h2). Feldhöhe ~48 px kommt aus
// `.pult-suche-feld` (additiv, index.css) — die BESTEHENDE Regel `.st-frage-
// feld` bleibt unverändert (Parallel-Bau, `index.css` ist hier nur additiv),
// die neue Klasse überschreibt nur `padding`, weil sie später im Stylesheet
// steht (gleiche Spezifität, spätere Kaskaden-Position gewinnt).

export function UniversalSuche() {
  const navigate = useNavigate();
  const pk = usePaneKlasse();
  const listboxId = useId();
  const feldId = useId();
  const [params, setParams] = useSearchParams();
  const initialQ = params.get('q') ?? '';
  const [wert, setWert] = useState(initialQ);
  const [q, setQ] = useState(initialQ.trim());
  const [enterQ, setEnterQ] = useState<string | null>(null);

  // Was WIR zuletzt in ?q= geschrieben haben — trennt eigene Writes von echten
  // externen Änderungen (Zurück-Taste, Permalink). Als State, damit der
  // Render-Phasen-Abgleich es lesen darf.
  const [geschrieben, setGeschrieben] = useState(initialQ.trim());
  const qParam = params.get('q') ?? '';
  const [letztesParam, setLetztesParam] = useState(qParam);
  if (qParam !== letztesParam) {
    setLetztesParam(qParam);
    if (qParam !== geschrieben) setWert(qParam);
  }

  // Eingabe: Feldwert setzen UND ?q= sofort schreiben (synchron, kein Effect →
  // kein Tipp-Gefecht). Teilbar/Zurück-Taste; replace, damit Tippen keine
  // History füllt.
  const setze = (v: string) => {
    setWert(v);
    setEnterQ(null); // neue Eingabe verwirft einen gepufferten Enter
    const t = v.trim();
    setGeschrieben(t);
    const p = new URLSearchParams(params);
    if (t) p.set('q', t); else p.delete('q');
    setParams(p, { replace: true });
  };

  // Debounce: Eingabe → Such-Query (~120 ms) — nur für die Trefferberechnung.
  useEffect(() => {
    const id = setTimeout(() => setQ(wert.trim()), 120);
    return () => clearTimeout(id);
  }, [wert]);

  const { gruppen, allesGeladen, vorschlag, abdeckung } = useUniversalSuche(q);

  // Enter-Puffer (S3/#52): Enter vor dem Laden merkt sich die Query und öffnet den
  // obersten Treffer, sobald geladen (mobil trifft die «Suchen»-Taste sonst leer).
  useEffect(() => {
    if (enterQ === null) return;
    if (!allesGeladen || enterQ !== q) return;
    const ziel = gruppen.find((g) => g.treffer.length > 0)?.treffer[0]?.href;
    // Deferred, damit kein synchrones set-state-in-effect kaskadiert (Repo-Muster).
    const id = window.setTimeout(() => { setEnterQ(null); if (ziel) navigate(ziel); }, 0);
    return () => window.clearTimeout(id);
  }, [enterQ, q, allesGeladen, gruppen, navigate]);

  // Flache Trefferliste in Anzeigereihenfolge + Pfeil-Auswahl über einen
  // STABILEN Treffer-Key (die oid), NICHT über einen Positions-Index — identisch
  // zur Header-Suche (EIN Suchweg, §5). Wächst die per useDeferredValue
  // entkoppelte Artikelgruppe (§15.3/#183) einen Tick später ein und verschiebt
  // die Positionen, folgt die Auswahl dem SEMANTISCH gleichen Treffer, statt auf
  // einen fremden umzuspringen (Race-Fix #210, Logik in trefferAuswahl.ts).
  // flacheTreffer (SSoT, §5) enthält am Gruppenende auch die «alle N Treffer»-
  // Option (mehrHref) — so ist der Sprung auch per Tastatur erreichbar (a11y).
  const flach = flacheTreffer(gruppen, listboxId);
  const [aktivKey, setAktivKey] = useState<string | null>(null);
  // Bei jeder neuen Query die Hervorhebung zurücksetzen (Render-Phasen-Abgleich
  // statt setState-im-Effekt).
  const [letzteQuery, setLetzteQuery] = useState(q);
  if (q !== letzteQuery) {
    setLetzteQuery(q);
    setAktivKey(null);
  }
  const aktivPos = aktivePosition(flach, aktivKey);
  const aktivId = aktivPos >= 0 ? flach[aktivPos].oid : undefined;

  // Aktiven Treffer in den sichtbaren Bereich rollen (Hero-Liste kann lang sein).
  useEffect(() => {
    if (aktivId) document.getElementById(aktivId)?.scrollIntoView({ block: 'nearest' });
  }, [aktivId]);

  // Pfeil-/Enter-Navigation wie in der Header-Suche (EIN Suchweg, §5): Enter
  // öffnet den hervorgehobenen bzw. — ohne Auswahl — den obersten Treffer.
  const aufTaste = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && flach.length > 0) {
      e.preventDefault();
      setAktivKey((k) => naechsterKey(flach, k));
    } else if (e.key === 'ArrowUp' && flach.length > 0) {
      e.preventDefault();
      setAktivKey((k) => vorigerKey(flach, k));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flach.length > 0) {
        const ziel = gewaehlterHref(flach, aktivKey) ?? flach[0].href;
        navigate(ziel);
      } else if (wert.trim() !== '') {
        setEnterQ(wert.trim()); // Puffer: öffnen, sobald geladen
      }
    } else if (e.key === 'Escape') {
      setAktivKey(null);
    }
  };

  return (
    <section role="search" aria-label="Universal-Suche" className="mt-2 space-y-2">
      <label htmlFor={feldId} className="block font-sans text-xs text-ink-500">
        Suchen<span className="sr-only"> — über Rechner, Vorlagen, Gesetze und Rechtsprechung</span>
      </label>
      <div className="st-frage relative">
        {/* Lupe: 22 px, 1.5 px Strich, `currentColor` — sie erbt die Meta-Tinte
            aus `.st-frage-lupe` und ist rein dekorativ (das Feld ist benannt). */}
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
          strokeLinecap="round" className="st-frage-lupe">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5L21 21" />
        </svg>
        <input
          id={feldId}
          type="search"
          value={wert}
          onChange={(e) => setze(e.target.value)}
          onKeyDown={aufTaste}
          placeholder="Art. 336c OR · BGE 152 V 52"
          /* GEMESSEN 6.9.2026 (Preview @1440 und im Pane): 32 px Literata füllen
             die Textspalte des Satzspiegels bei ~890 px Breite nicht mehr — der
             Platzhalter wird beschnitten. Die grosse Stufe steht darum erst,
             wenn die Spalte sie trägt, und im PANE entscheidet die
             Container-Breite, nicht der Viewport (A-2-Wurzel). */
          className={`st-frage-feld pult-suche-feld pr-9 leading-[1.3] ${pk('text-body-l lg:text-[length:var(--pult-suche-gross)]', 'text-body-l @3xl/pane:text-[length:var(--pult-suche-gross)]')}`}
          enterKeyHint="search"
          role="combobox"
          aria-expanded={q !== ''}
          aria-controls={q !== '' ? listboxId : undefined}
          aria-activedescendant={aktivId}
          aria-autocomplete="list"
        />
        {wert && (
          <button type="button" onClick={() => setze('')} aria-label="Suche leeren"
            className="absolute right-0 bottom-2.5 inline-flex h-7 w-7 items-center justify-center text-ink-500 transition-colors hover:text-ink-900">
            <span aria-hidden className="lc-griff-glyph">✕</span>
          </button>
        )}
      </div>

      <SuchResultate gruppen={gruppen} allesGeladen={allesGeladen} q={q} listboxId={listboxId} aktivId={aktivId}
        vorschlag={vorschlag} abdeckung={abdeckung} onVorschlag={(b) => setze(b)}
        onNavigate={(href) => navigate(href)} />
    </section>
  );
}
