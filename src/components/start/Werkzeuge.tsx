import { Link } from 'react-router-dom';
import { EinfacheFristForm } from '../forms/EinfacheFristForm';
import { RubrikKachel } from '../ui/RubrikKachel';

// ─── Werkzeuge (Startseite V4, Modul #3 — ersetzt den Schnellrechner) ───────
//
// RÜCKBAU statt Angleichung (§17-Gegengewicht): auf «/» stand bis V3 ein
// Tab-Kasten mit drei Reitern, einer ZWEITEN, anders gestalteten Tab-Leiste für
// die Gebührenart (Befund W2·19: Schnellrechner.tsx:56 vs. :93), 26 Kantons-
// Knöpfen, Ferien-Auswahl und einem Mehrmonats-Kalender — auf der Seite, die in
// einem Blick zeigen soll, was LexMetrik kann. Der Voll-Rechner
// `/rechner/tagerechner` trägt all das bereits.
//
// Geblieben ist der EINE Handgriff, der auf eine Startseite gehört: die Frist in
// einer Zeile. Sie hostet das ECHTE Formular (§5/§1 — dieselbe Engine, dieselben
// Eingaben, nur die Darstellungs-Variante `zeile`), nie eine Kopie der
// Rechenlogik. Prozesskosten und Zuständigkeit sind Link-Karten zum
// Voll-Rechner, kein eingebettetes Zweit-Formular mehr.
//
// Reine Darstellung (§3).

export function Werkzeuge() {
  return (
    /* Zweispaltig erst ab xl, und die rechte Spalte fix statt 1/3 —
       GEMESSEN, nicht geraten (5.9.2026): bei `lg:grid-cols-3` + col-span-2 lag
       die Fristen-Karte @1024 auf 509 px Innenbreite; die drei Feldspalten
       massen dann je 134 px, wovon nach 14 px Innenabstand und den 44 px
       Kalenderknopf-Reserve 76 px für einen 87 px breiten Datumswert blieben —
       exakt die LM-074-Kappung. Unter xl steht die Karte darum ganzbreit; ab
       xl nimmt die Kachel-Spalte 20rem, der Rest gehört der Fristen-Zeile. */
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
      <div className="lc-card space-y-3 p-5">
        <p className="lc-overline">Frist in einer Zeile</p>
        <EinfacheFristForm variante="zeile" />
        <p className="text-body-s text-ink-500">
          Rückwärtsrechnung, Zustellart, Hemmung und Presets im{' '}
          <Link to="/rechner/tagerechner" className="font-medium text-brass-700 no-underline hover:text-brass-600">
            Fristenrechner →
          </Link>
        </p>
      </div>
      {/* Zwei Einstiege statt zweier eingebetteter Formulare — über denselben
          Kachel-Baustein wie die Landkarte (C-5, §5), ohne Zähler. */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        <RubrikKachel ziel="/rechner/prozesskosten" titel="Prozesskosten"
          nutzen="Gerichts- und Parteikosten nach kantonalem Tarif, mit Vorschuss, Kostenrisiko und offengelegtem Rechenweg." />
        <RubrikKachel ziel="/rechner/zustaendigkeit" titel="Zuständigkeit"
          nutzen="Örtliche Zuständigkeit im Zivilprozess — Weichen nach ZPO, mit Begründung je Schritt." />
      </div>
    </div>
  );
}
