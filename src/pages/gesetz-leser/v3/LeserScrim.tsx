import { createPortal } from 'react-dom';

// ─── B7-N1 · LM-015 · Die abdunkelnde Fläche hinter einem Leser-Overlay ──────
//
// Entscheid David 8.8.2026. Der Befund (Sichtprüfung 29.7.2026): «Die
// Menüfenster haben keine abdunkelnde Fläche dahinter; Gesetzestext und
// Menüinhalt laufen ineinander.» Reproduziert am gebauten Stand 30.8.2026
// @1440: «Ansicht ▾» misst 240 × 199 px auf deckendem `paper-raised`, z-40 —
// ohne jede Abdunklung dahinter.
//
// ── DIE REGEL: DER SCRIM FOLGT DER FOKUS-FALLE, NICHT DER FLÄCHE ────────────
// Eine eigene Datei, weil genau diese Regel sonst nirgends stünde und die
// Begründung an zwei Bauteilen hinge. `usePopoverAutoZu` führt vier Modi; zwei
// davon fangen den Fokus (`popover`, `blatt`), zwei bewusst nicht (`beiwerk`,
// `spalte` — `OHNE_FALLE` dort). Wer den Fokus fängt, IST modal und muss das
// auch zeigen; wer ihn bewusst nicht fängt, darf keinen Scrim tragen. Genau
// daran ist Ä52 (17.8.2026) entschieden worden: dem Rechtsprechungs-Panel auf D
// wurde der Scrim ABGENOMMEN, weil `kopfStufen.panelForm` für `'rechts'` «der
// Lesetext bleibt links sichtbar und LESBAR; das Panel ist Beiwerk» verspricht.
// Beide Hälften derselben Regel, kein Widerspruch — und `LeserPanelZone` hält
// sich mit ihrem eigenen, gleich gebauten Scrim am modalen Blatt daran.
//
// ── `black`, NICHT `ink-900` ────────────────────────────────────────────────
// Präzedenz `components/layout/Shell.tsx` (Schubladen-Scrim, dort schon
// notiert): `--ink-900` flippt mit dem Thema und ist im Dunkelmodus `#E9E7E2`.
// Ein `bg-ink-900/30` HELLT dort auf, statt abzudunkeln — genau dieser Fehler
// stand bis zum 30.8.2026 im modalen Blatt-Scrim und ist mit B7-N1 behoben.
// Gemessene Wirkung (Leuchtdichte im Lesefeld, 400 × 200 px): hell
// 237.5 → 166.1, dunkel 32.7 → 23.0 — je −30 %, in BEIDEN Themes abdunkelnd.
//
// 30 % ist der Wert des modalen Leser-Blatts (`LeserPanelZone`), nicht die 50 %
// der Vollflächen-Schublade: ein 240-px-Menü ist kein Vollbild
// (Minimalismus-Vorgabe David 28.7.2026, «Optik des Gesetzes nicht überladen»).
// EINE Zahl für die Rolle (§5) — wer sie ändert, ändert sie an beiden Orten.
//
// F2-1 (31.8.2026): Farbe und Deckung stehen seither NICHT mehr hier, sondern
// als `.lc-scrim` bei den Tokens in `src/index.css` — die Regel «black, nicht
// ink-900» und «30 % ist die Zahl DER ROLLE» galt für sechs Fundstellen und war
// an dreien noch falsch gebaut. Die Herleitung oben bleibt, wo sie entstanden
// ist (§2b); der WERT wohnt jetzt an einer Stelle. Position, z-Ebene und der
// Klick-Handler bleiben hier: sie sind die Anatomie DIESES Scrims, nicht die
// der Rolle.
//
// ── WARUM PORTAL UND WARUM `z-reader-scrim` (C3: benannte Rolle für den
//    vormals rohen Wert 16, Schichtungs-Skala in index.css) ─────────────────
// Am `<body>`, nicht im Kopf-Teilbaum, und UNTER dem klebenden Kopf (dessen
// `z-reader-kopf` = 17, Herleitung in `LeserKopf.tsx`): so tritt der
// Lesetext zurück, während Öffner UND Menü scharf stehen. Das ist zugleich der
// «sichtbare Bezug zum auslösenden Knopf», den LM-015 zusätzlich verlangt —
// läge der Scrim im Kopf-Teilbaum, dimmte er den Trigger mit.
//
// ── A11Y ────────────────────────────────────────────────────────────────────
// `aria-hidden`, kein Tab-Stopp, keine Rolle (Muster Shell): der Weg hinaus
// bleibt Escape, Aussenklick und der Öffner selbst. Der Klick-Handler ist
// trotzdem eigens verdrahtet — `usePopoverAutoZu` prüft den Aussenklick gegen
// `wrapRef`, und diese Fläche liegt im Portal ausserhalb davon; die Zusage
// «Klick auf die Abdunklung schliesst» soll nicht davon abhängen, wo der Knoten
// hängt.
//
// SSR: der Aufrufer rendert nur im offenen Zustand, und der ist beim ersten
// Render immer `false` — `document` wird im Prerender nie berührt.
export function LeserScrim({ onSchliessen }: { onSchliessen: () => void }) {
  return createPortal(
    <div
      data-v3-ansicht-scrim
      className="lc-scrim fixed inset-0 z-reader-scrim"
      onClick={onSchliessen}
      aria-hidden
    />,
    document.body,
  );
}
