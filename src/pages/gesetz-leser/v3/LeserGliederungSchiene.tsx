// ─── Die schmale Schiene links, wenn die Gliederung eingeklappt ist ──────────
//
// Herausgelöst aus `LeserRahmenV3.tsx` (H3-Nachzug C5b, §6.6). Der Rahmen
// entscheidet weiter OB sie steht (Breite · Klapp-Zustand) und WAS der Klick tut;
// diese Datei weiss nur, WIE sie aussieht — sie hat keinen Breiten- und keinen
// Pane-Zweig (Fundament-Sonde).
//
// WARUM SENKRECHTER ECHTER TEXT: 2.25 rem reichen für «Gliederung» waagrecht
// nicht, und eine Abkürzung («Gl.») hilft niemandem. `writing-mode` dreht echten
// Text — er bleibt vorlesbar und durchsuchbar, es ist kein Bild und kein
// `aria-label` als Ersatz für Inhalt (Design-Grundlage Kap. 6).
//
// WARUM SIE ÜBERHAUPT DA IST (Befund David 16.8.2026, @1440 reproduziert):
// klappte man die Gliederung ein, verschwand das Grid ganz. Die Lesespalte sprang
// um 175 px nach links (x 600 → 424) und gewann ganze 31 px Breite (641 → 672,
// mehr lässt das Lesemass nicht zu) — ein Sprung ohne Gewinn. Und der einzige Weg
// zurück war ein 24-px-☰ OHNE Beschriftung, ganz rechts im Kopf (x = 1101), also
// an der gegenüberliegenden Seite von dem, was es zurückholt. Jetzt bleibt das
// Grid stehen, die linke Spur wird zur Schiene mit beschriftetem Öffner: der
// Öffner steht DORT, wo die Gliederung war, die Fläche gewinnt echte 15.75 rem,
// und die Bewegung ist eine Breitenänderung statt eines Umbruchs.

export function LeserGliederungSchiene({ onAuf }: { onAuf: () => void }) {
  return (
    <div className="sticky self-start" style={{ top: 'var(--nt-stick)' }}>
      <button type="button" data-v3-gliederung-schiene
        onClick={onAuf}
        aria-expanded={false} title="Gliederung einblenden"
        className="lc-leiste-schiene">
        <span aria-hidden className="text-base leading-none">☰</span>
        <span className="[writing-mode:vertical-rl] [text-orientation:mixed]">Gliederung</span>
      </button>
    </div>
  );
}
