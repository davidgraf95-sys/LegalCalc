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
//
// ── Ä79 (H4-II, 17./18.8.2026) · SEITHER IST SIE DER EINE GRIFF ─────────────
// Der Absatz darüber beschreibt, warum die Schiene entstand — der Kopf-☰ blieb
// dabei stehen. Gemessen @1440 mit eingeklappter Gliederung standen damit ZWEI
// sichtbare ☰ für DIESELBE Handlung: dieser hier bei x = 184 («Gliederung
// einblenden») und der Kopf-☰ bei x = 1117 («Gliederung») — **933 px
// auseinander an gegenüberliegenden Fensterkanten**. Das ist Ä79, und es ist
// derselbe Befund, den der Absatz darüber gerade beheben wollte, nur eine
// Etappe später: der unbeschriftete 24-px-Knopf auf der Gegenseite war noch da.
//
// WELCHER BLEIBT, ist darum keine Geschmacksfrage — dieser: er steht am Ort der
// Gliederung und er ist BESCHRIFTET. Der Rahmen lässt den Kopf-☰ genau so lange
// weg, wie diese Schiene sichtbar ist (`schieneSteht` in `./LeserRahmenV3`);
// unter der Schienen-Schwelle (kein `istXl`, also Handy und jedes schmale Pane)
// gibt es keine Schiene, und dort ist der Kopf-☰ unverändert der einzige Weg.
// BEWACHT: `e2e/leser-v3-h4-kopfwege` (c) misst @1440 den Kopf-☰ gegen 0 UND
// klickt danach diese Schiene — eine Abwesenheit ohne funktionierenden Ersatz
// wäre ein Verlust, kein Aufräumen (§6.7 b); (c2) hält @390 die Gegenprobe.

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
