import type { Entscheidquelle, EntscheidSprache, Abschnittstyp } from '../lib/rechtsprechung/typen';
import type { KopfLabelKey } from '../lib/rechtsprechung/kopf';

// Provenienz-Fuss (§7): Daten-Label je Quelle — BS-Tranche §7.1 (vorher hart
// «OpenCaseLaw», was für gerichte-bs falsch wäre). Deklariert, kein Raten.
export const QUELLE_LABEL: Record<Entscheidquelle, string> = {
  opencaselaw: 'OpenCaseLaw',
  entscheidsuche: 'entscheidsuche.ch',
  'gerichte-bs': 'Rechtsprechungs-Datenbank der Gerichte Basel-Stadt (amtlich)',
};

// Sprung zu einem Anker im Body + kurzes Ziel-Blinken (bestehendes lc-ziel-blink
// aus dem Gesetz-Leser; §13-Token, keine neue Optik). Respektiert reduced-motion.
// Rein clientseitig (nur aus Klick-/Effekt-Handlern) — kein SSR-Pfad.
export function springeZuAnker(id: string): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.getElementById(id);
  if (!el) return false;
  const reduziert = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ block: 'start', behavior: reduziert ? 'auto' : 'smooth' });
  el.classList.add('lc-ziel-blink');
  window.setTimeout(() => el.classList.remove('lc-ziel-blink'), 2400);
  return true;
}

// Rubrum-Beschriftungen je Sprache (zukunftsfest; heute trägt der Korpus nur de,
// fr/it greifen automatisch, sobald solche Entscheide importiert werden). rm → de.
export const KOPF_LABEL: Record<EntscheidSprache, Record<KopfLabelKey, string>> = {
  de: { gegenstand: 'Gegenstand', parteien: 'Parteien', vorinstanz: 'Vorinstanz', besetzung: 'Besetzung' },
  fr: { gegenstand: 'Objet', parteien: 'Parties', vorinstanz: 'Autorité précédente', besetzung: 'Composition' },
  it: { gegenstand: 'Oggetto', parteien: 'Parti', vorinstanz: 'Autorità inferiore', besetzung: 'Composizione' },
  rm: { gegenstand: 'Gegenstand', parteien: 'Parteien', vorinstanz: 'Vorinstanz', besetzung: 'Besetzung' },
};

// Ehrlicher Marker, wenn die Thema-Leitzeile abgeleitet ist (keine amtliche Regeste, §8).
export const SYNTH_MARKER: Record<EntscheidSprache, string> = {
  de: 'Sachgebiet aus der Aktenstruktur abgeleitet — keine amtliche Regeste vorhanden.',
  fr: 'Domaine déduit de la structure du dossier — aucun regeste officiel disponible.',
  it: 'Ambito dedotto dalla struttura degli atti — nessuna massima ufficiale disponible.',
  rm: 'Sachgebiet aus der Aktenstruktur abgeleitet — keine amtliche Regeste vorhanden.',
};

// Reihenfolge der Sprung-Ziele (amtliche Gliederung); Regeste vorangestellt.
export const NAV_TYPEN: Abschnittstyp[] = ['regeste', 'sachverhalt', 'erwaegung', 'dispositiv'];
