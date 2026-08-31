import { FehlSeite, type FehlWeg } from '../components/ui/FehlSeite';

// 404 in der Familie der statischen Seiten (SeitenKopf): Overline + Ablesekante
// + Display-Titel. Statt einer Sackgasse mehrere geführte Wiedereinstiege.
//
// ── D-6 (Design-Konsistenz, 31.8.2026) · EINE FEHLSEITE ────────────────────
// Diese Seite war von den vier Fehl-Flächen die reglementskonformste — sie
// allein trug schon den `SeitenKopf` mit Overline, Ablesekante und H1. Genau
// darum ist sie die VORLAGE des geteilten Bausteins geworden und nicht sein
// Sonderfall. Zwei Dinge ändern sich hier trotzdem:
//   · TITEL «Diese Seite gibt es nicht.» → «Seite nicht gefunden». Der Baustein
//     baut den Titel aus dem Objekt, damit alle vier Flächen denselben Satzbau
//     tragen. §8: nichts abgeschwächt — die Erklärung darunter steht Wort für
//     Wort weiter da, und die drei Wege bleiben vollzählig.
//   · WEGE: Kanon-Pfeil «←» und eine `<nav>`-Landmark statt der `lc-list` —
//     dieselbe Zeile wie auf den drei anderen Fehlseiten.
// Die frühere `max-w-reading`-Klammer entfällt: der Lead trägt die Lesespalte
// seit dem Qualitäts-Pass 29.8.2026 im `SeitenKopf` selbst (T1/L5), und die
// Wege-Zeile ist keine Fliesstext-Zeile.
const WEGE: [FehlWeg, ...FehlWeg[]] = [
  { to: '/', label: 'Katalog – alle Rechner & Vorlagen' },
  { to: '/methodik', label: 'Methodik' },
  { to: '/kontakt', label: 'Kontakt' },
];

export function NotFound() {
  return (
    <FehlSeite bereich="404 · Nicht gefunden" objekt="Seite" wege={WEGE}
      erklaerung="Die Adresse ist veraltet oder vertippt. Hier kommen Sie zurück ins Werkzeug:" />
  );
}
