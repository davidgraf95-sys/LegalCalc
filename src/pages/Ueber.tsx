import { Link } from 'react-router-dom';
import { SeitenKopf } from '../components/layout/SeitenKopf';

// Seite «Über» – Entstehungsgeschichte mit persönlichem Bezug.
export function Ueber() {
  return (
    <div className="space-y-10 max-w-reading">
      <SeitenKopf overline="Über" titel="Über LexMetrik" />

      <div className="space-y-4 text-body-s text-ink-600 leading-relaxed">
        <p>Die Idee zu LexMetrik kam mir bei der Vorbereitung auf die Anwaltsprüfung in Basel-Stadt.</p>
        <p>
          Wie viele habe ich dabei auch KI-Tools genutzt. Für das Verständnis schwieriger Fragen
          waren sie oft hilfreich. Bei den Fristberechnungen dagegen, die im Grunde nur saubere
          Regelanwendung sind, konnte ich mich nicht auf sie verlassen: Mal wurde der Fristbeginn
          verschoben, mal eine Gerichtsferienperiode übergangen, mal ein Datum genannt, das schlicht
          nicht stimmte – jedes Mal mit grosser Selbstsicherheit.
        </p>
        <p>
          Das hat mich überrascht, denn eine Frist kennt kein Ermessen. Sie ergibt sich aus dem
          Gesetz und einigen Entscheiden, und am Ende steht ein einziges richtiges Datum. Wer es
          verpasst, verliert das Recht. Eine solche Berechnung sollte verlässlich sein und sich
          überprüfen lassen – nicht von der Tagesform eines Sprachmodells abhängen.
        </p>
        <p>
          Genau dafür ist LexMetrik gebaut. Es rechnet nicht nach Wahrscheinlichkeit, sondern
          wendet feste Regeln an – dieselbe Eingabe führt immer zum selben Ergebnis. Jeden Schritt
          legt es offen und belegt ihn mit der Norm, dem Link auf die geltende amtliche Fassung und
          dem Stand. Die juristische Prüfung nimmt es niemandem ab. Aber es liefert eine Grundlage,
          die sich in Minuten kontrollieren lässt.
        </p>
        <p>
          Aus dem Fristenrechner ist inzwischen eine Arbeitsplattform geworden. Werkzeuge berechnen
          Fristen, Beträge und Quoten und stellen Rechtsdokumente aus festen, strukturierten
          Textbausteinen zusammen. Gesetzestexte des Bundes und der Kantone stehen im Volltext bereit, ergänzt um
          Leitentscheide und Gesetzesmaterialien. Alles stammt ausschliesslich aus amtlichen,
          urheberrechtsfreien Quellen – und jeder Inhalt deklariert offen, wie weit er geprüft ist.
          Was in welcher Tiefe abgedeckt ist, zeigt die Seite{' '}
          <Link to="/abdeckung" className="text-brass-700 hover:text-brass-600">Abdeckung</Link>,
          die Arbeitsweise im Detail die Seite{' '}
          <Link to="/methodik" className="text-brass-700 hover:text-brass-600">Methodik</Link>.
        </p>
        <p>
          LexMetrik bleibt in Entwicklung. Rückmeldungen sind willkommen – besonders dann, wenn
          etwas nicht stimmt:{' '}
          <Link to="/kontakt" className="text-brass-700 hover:text-brass-600">Kontakt</Link>.
        </p>
        {/* Signatur – externe Verlinkung wie übrige externe Links (neues Tab) */}
        <p className="pt-2">
          <a
            href="https://www.linkedin.com/in/david-graf-a5667624b/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium"
          >
            David Graf
          </a>
        </p>
      </div>
    </div>
  );
}
