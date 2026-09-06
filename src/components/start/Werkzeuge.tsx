import { Link } from 'react-router-dom';
import { EinfacheFristForm } from '../forms/EinfacheFristForm';
import { StartZeile, StartFuss } from './Satzspiegel';

// ─── Werkzeuge: Frist in einer Zeile (Startseite, Modul «Rechner») ──────────
//
// RÜCKBAU statt Angleichung (§17-Gegengewicht, aus V4 fortgeschrieben): auf «/»
// stand bis V3 ein Tab-Kasten mit drei Reitern, einer ZWEITEN Tab-Leiste für die
// Gebührenart, 26 Kantons-Knöpfen, Ferien-Auswahl und einem Mehrmonats-Kalender.
// Der Voll-Rechner `/rechner/tagerechner` trägt all das bereits.
//
// Geblieben ist der EINE Handgriff, der auf eine Startseite gehört: die Frist in
// einer Zeile. Sie hostet das ECHTE Formular (§5/§1 — dieselbe Engine, dieselben
// Eingaben, nur die Darstellungs-Variante `zeile`), nie eine Kopie der
// Rechenlogik.
//
// W2·24-R3: die beiden `RubrikKachel`-Kacheln (Prozesskosten, Zuständigkeit)
// sind TEXT-VERWEISE geworden — auf «/» gibt es keine Kachel-Optik mehr
// (Fahrplan §6 R3). Die Ziele sind dieselben; dazu die Einstiege in die beiden
// Register. Der Kachel-Baustein `ui/RubrikKachel` bleibt unverändert im
// Bestand — er trägt weiterhin den /gesetze-Einstieg.
// Reine Darstellung (§3).

export function Werkzeuge() {
  return (
    <StartZeile reg="w" ueber="Rechner"
      rand={<>Frist nach ZPO<br />und SchKG</>}
      titel="Frist berechnen">
      <EinfacheFristForm variante="zeile" />
      <StartFuss>
        Rückwärtsrechnung, Zustellart, Hemmung und Kalender im{' '}
        <Link to="/rechner/tagerechner" className="hover:text-reg-w">Fristenrechner</Link>.
        Weitere Rechner:{' '}
        <Link to="/rechner/prozesskosten" className="hover:text-reg-w">Prozesskosten</Link>,{' '}
        <Link to="/rechner/zustaendigkeit" className="hover:text-reg-w">Zuständigkeit</Link>,{' '}
        <Link to="/rechner" className="hover:text-reg-w">alle Rechner</Link>.
        Vorlagen:{' '}
        <Link to="/vorlagen/arbeitsvertrag" className="hover:text-reg-w">Arbeitsvertrag</Link>,{' '}
        <Link to="/vorlagen" className="hover:text-reg-w">alle Vorlagen</Link>.
      </StartFuss>
    </StartZeile>
  );
}
