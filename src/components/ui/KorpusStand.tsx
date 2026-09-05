import { STARTSEITE_ZAEHLER } from '../../data/startseiteZaehler.generated';
import { Datum } from './Datum';

// ─── Korpus-Stand · EIN Baustein, zwei Konsumenten (W2·23-STARTSEITE-V4) ─────
//
// Zeigt, wann die drei Register (Gesetze · Rechtsprechung · Materialien) zuletzt
// ERZEUGT wurden — aus der buildseitig generierten Mini-Datei (kein Register-
// Import in den Startseiten-/Shell-Chunk, §15). Konsumenten: Startseite
// («Jüngste Entscheide im Korpus», Fuss) und Seitenleiste (Fuss).
//
// §8 — Wortlaut bewusst «Register erzeugt», nie «Stand der Rechtsprechung»:
// die `stand*`-Felder sind das Datum des Build-Laufs, nicht das Datum des
// jüngsten Inhalts. Das Datum des jüngsten Entscheids zeigen die Karten selbst.
// §3: reine Darstellung.
export function KorpusStand({ className = '' }: { className?: string }) {
  const z = STARTSEITE_ZAEHLER;
  const zeilen: { name: string; iso: string }[] = [
    { name: 'Gesetze', iso: z.standGesetze },
    { name: 'Rechtsprechung', iso: z.standRechtsprechung },
    { name: 'Materialien', iso: z.standMaterialien },
  ];
  return (
    <p className={`text-micro text-ink-500 leading-relaxed ${className}`}>
      <span className="text-ink-600">Register erzeugt:</span>{' '}
      {zeilen.map((r, i) => (
        <span key={r.name} className="whitespace-nowrap">
          {i > 0 && <span aria-hidden> · </span>}
          {r.name} <Datum iso={r.iso} />
        </span>
      ))}
    </p>
  );
}
