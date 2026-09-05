import { Fragment } from 'react';
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
      {/* Der Trenner steht AUSSERHALB des `whitespace-nowrap`, damit die Zeile
          zwischen den drei Registern umbrechen kann. Zusammen bleibt nur, was
          zusammengehört (Name + Datum).
          GEMESSEN 5.9.2026 (W2·23 Paket B, Preview @1440, Konsument
          Seitenleisten-Fuss): mit dem Trenner INNERHALB der nowrap-Spans gab es
          in der ganzen Zeile keinen einzigen Umbruchpunkt — sie mass 385 px in
          einer 223 px breiten Spalte und gab der Seitenleiste eine horizontale
          Scrollachse (scrollWidth 401 gegen clientWidth 255). Auf der breiten
          Startseiten-Zeile fällt derselbe Mangel nicht auf; er ist trotzdem
          derselbe. Reine Darstellung, Wortlaut und Reihenfolge unverändert. */}
      {zeilen.map((r, i) => (
        <Fragment key={r.name}>
          {i > 0 && <span aria-hidden> · </span>}
          <span className="whitespace-nowrap">{r.name} <Datum iso={r.iso} /></span>
        </Fragment>
      ))}
    </p>
  );
}
