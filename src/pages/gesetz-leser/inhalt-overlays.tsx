import type { LesePosition } from './lesePosition';
import { WeiterlesenChip } from './parts/WeiterlesenChip';
import { LeserTastatur } from './parts/LeserTastatur';

// ═══ ABSCHNITT · Leser-Overlays (§6.6-Split, QS-TOK/T14) ═════════════════════
// W2·10-UI-NAV/R4 + R8. Beide hängen INNEN an `.lc-leser`: der Chip erbt von
// dort `--nt-stick` (N0c, die EINE Quelle der realen Sticky-Höhe), und beide
// rendern im Ruhezustand `null` ⇒ prerendertes Markup byte-gleich. Nur die
// Primär-/Einzelansicht — im sekundären Pane liefe sonst ein ZWEITER globaler
// keydown-Listener und j/k sprängen doppelt.
//
// `display: contents` am Träger ist hier keine Kosmetik, sondern der Fix eines
// gemessenen 20-px-Shifts: `.lc-leser` trägt `space-y-5`, und dessen Regel
// `> * + *` hätte dem Lese-Inhalt einen Margin gegeben, sobald ein zweites Kind
// danebensteht — obwohl beide Overlays `position: fixed` sind und gar keinen
// Platz brauchen. Ein Träger ohne eigene Box nimmt den Margin entgegen und wirft
// ihn weg; der Rhythmus der Lesespalte bleibt exakt der vor dieser Einheit
// (belegt in leser-weiterlesen-r4-r8.e2e.ts, «Entfernen bewegt nichts»).
//
// Eigene Datei (nicht in ./inhalt-weiterlesen): `react-refresh/only-export-
// components` verlangt, dass eine Datei entweder nur Komponenten oder nur
// Nicht-Komponenten exportiert — der R4-Hook und dieses Markup können darum
// nicht zusammenliegen. Der Zustand dazu lebt in ./inhalt-weiterlesen.
export function LeserOverlays({ istSekundaer, weiterlesen, onWeiterlesen, onVerwerfen, artTokens, aktivToken, onSprung }: {
  istSekundaer: boolean;
  weiterlesen: LesePosition | null;
  onWeiterlesen: () => void;
  onVerwerfen: () => void;
  artTokens: string[];
  aktivToken: string | null;
  onSprung: (token: string) => void;
}) {
  return (
    <div className="contents">
      {!istSekundaer && weiterlesen && (
        <WeiterlesenChip label={weiterlesen.label}
          onWeiterlesen={onWeiterlesen} onVerwerfen={onVerwerfen} />
      )}
      {!istSekundaer && (
        <LeserTastatur tokens={artTokens} aktivToken={aktivToken} onSprung={onSprung} />
      )}
    </div>
  );
}
