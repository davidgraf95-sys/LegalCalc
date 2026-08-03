// ─── Navigations-SSoT der App-Shell (Build-Plan App-Shell, Phase 2) ─────────
//
// EINE Quelle für die linke Seitenleiste (Sidebar.tsx) und das mobile
// Schubladen-Menü. REINES, typisiertes Datenmodul: kein JSX, KEINE Rechtslogik
// (CLAUDE.md §3) — nur die Navigations-Topologie.
//
// SSoT / «ableiten statt duplizieren» (Build-Plan Leitplanke 4): die Rechner-,
// Vorlagen- und Gesetze-Einträge werden NICHT hier hartcodiert, sondern aus der
// bestehenden Fachkonfiguration abgeleitet —
//   · Rechner  ← OBERKATEGORIEN (oberkategorien.ts) ohne «vorlagen»
//   · Vorlagen ← VORLAGE_SEKTIONEN (startseiteConfig.ts)
//   · Gesetze  ← GEBIETE (normtext/register.ts) für die Bund-Rechtsgebiete
// — sodass eine neue Kategorie/Sektion/ein neues Rechtsgebiet automatisch in
// der Seitenleiste erscheint und nichts an zwei Stellen gepflegt wird (§5).
//
// Nur die echten App-Texte (Start, Recherche) und die Meta-Ziele sind aus
// keiner Fachkonfiguration ableitbar und stehen darum literal.

import { OBERKATEGORIEN } from './oberkategorien';
import { KATALOG_KARTEN, VORLAGE_SEKTIONEN, istVerfuegbar } from './startseiteConfig';
import { kategorieFuer } from './oberkategorien';
import { istVorlage } from './vorlagenKategorie';
import { SYSTEMATIK } from './normtext/systematik';
import { INTERNATIONAL_RUBRIK_IDS } from './normtext/international-rubriken';
import { GEBIETE } from './normtext/register';
import { KANTONE, KANTON_NAMEN } from '../data/tarif/typen';
import { BEHOERDEN } from './materialien/register';
// IA-7 (W2·5d §11.5): Erlass-Zahl-Badges an den 26 Kantonslinks — Zahl aus dem
// generierten Zähler-SSoT (register.json → gen:zaehler, Drift-Tor check:zaehler;
// build-time, KEIN Client-Fetch, §15.3), Zustands-Wort aus der IA-2-SSoT
// erfassungsgrad.ts (KEINE zweite Zähl-Wahrheit, §5).
import { STARTSEITE_ZAEHLER } from '../data/startseiteZaehler.generated';
import { erfassungsgrad, STUFE_WORT } from './normtext/erfassungsgrad';

/** Blatt: ein Navigationsziel (Route, ggf. mit Query/Hash für eine Teilsicht). */
export interface NavLink {
  art: 'link';
  label: string;
  /** Voller Pfad inkl. ?query/#hash — wird unverändert an react-router <Link to> gegeben. */
  ziel: string;
  /** IA-7: kleine Erlass-Zahl rechts am Eintrag (heute nur Kantonslinks) —
   *  reine Anzeige, von Anfang an im Markup (§15.2, kein CLS). */
  zahl?: number;
  /** IA-7: vollständiger Accessible Name (Name + Zahl + Zustands-Wort,
   *  O4-Muster — nie nur Farbe/Zahl, §11.6.8). Nur gesetzt, wenn `zahl` gesetzt ist. */
  ariaLabel?: string;
}

/** Knoten mit Kindern: entweder ein Abschnitt mit Überschrift oder eine
 *  aufklappbare Untergruppe (<details>). */
export interface NavGruppe {
  art: 'gruppe';
  label: string;
  /** Optional: macht die Gruppen-Überschrift klickbar → Übersicht (z.B. Bund/
   *  Kantone → /gesetze?ebene=…); der Chevron klappt die Kinder weiterhin auf. */
  ziel?: string;
  /** true → als natives <details> rendern (aufklappbar, tastaturzugänglich). */
  aufklappbar?: boolean;
  /** Bei aufklappbar: Anfangszustand. Bund startet eingeklappt (Build-Plan). */
  standardOffen?: boolean;
  kinder: NavKnoten[];
}

export type NavKnoten = NavLink | NavGruppe;

/** Ein Abschnitt der Hauptnavigation; titel === null bei den kopflosen
 *  Top-Einträgen (Start/Recherche) über den ersten Gruppentitel. */
interface NavAbschnitt {
  titel: string | null;
  /** Optional: macht die Abschnitts-Überschrift selbst klickbar → Gesamtübersicht
   *  (Auftrag David 20.6.2026: Klick auf Rechner/Vorlagen/Gesetze öffnet die
   *  jeweilige Übersicht). */
  ziel?: string;
  kinder: NavKnoten[];
}

const link = (label: string, ziel: string): NavLink => ({ art: 'link', label, ziel });

// ─── Abgeleitete Einträge (SSoT) ────────────────────────────────────────────
//
// Die echten Werkzeuge (Engines/Vorlagen) hängen DIREKT unter ihrer Kategorie
// (Auftrag David 19.6.2026): jede Rechner-Oberkategorie und jede Vorlagen-Gruppe
// ist eine aufklappbare Untergruppe, deren Kinder die SOFORT verfügbaren Karten
// (mit eigener Seite) als Direktlinks sind — abgeleitet aus dem Katalog (§5),
// nicht zweitgepflegt. Klicktiefe 1 von der Seitenleiste ins Werkzeug.

const katVon = (k: typeof KATALOG_KARTEN[number]) => kategorieFuer(k) ?? 'vorlagen';

// Verfügbare Karten EINER Kategorie als Werkzeug-Direktlinks (Katalog-Reihenfolge).
const werkzeugeFuer = (pruefen: (k: typeof KATALOG_KARTEN[number]) => boolean): NavLink[] =>
  KATALOG_KARTEN.filter((k) => istVerfuegbar(k) && !!k.href && pruefen(k)).map((k) => link(k.title, k.href!));

const werkzeugGruppe = (label: string, kinder: NavLink[]): NavGruppe =>
  ({ art: 'gruppe', label, aufklappbar: true, standardOffen: false, kinder });

// Rechner: die drei Aufgaben-Oberkategorien ausser «Vorlagen» — je als
// aufklappbare Gruppe mit ihren Rechnern.
const RECHNER_KINDER: NavKnoten[] = OBERKATEGORIEN
  .filter((k) => k.id !== 'vorlagen')
  .map((kat) => werkzeugGruppe(kat.titel, werkzeugeFuer((k) => !istVorlage(k) && katVon(k) === kat.id)));

// Vorlagen: die fünf Dokument-Gruppen — je als aufklappbare Gruppe mit ihren
// Vorlagen (nach Dokument-Typ `art`).
const VORLAGEN_KINDER: NavKnoten[] = VORLAGE_SEKTIONEN
  .map((s) => werkzeugGruppe(s.title, werkzeugeFuer((k) => istVorlage(k) && k.art === s.art)));

// ─── International: Kanonik + Anker-Abbildung (IA-6 Stufe 2, §11.8 Y-C) ─────
//
// EINE Quelle (§5) für alles, was die frühere Alias-Seite /international
// betraf: die kanonische Säulen-URL, die fünf Sach-Anker und ihre Abbildung
// auf die Ziel-Sektionen der Säule. Konsumenten: die Sidebar-Gruppe hier,
// der Redirect (src/pages/InternationalRedirect.tsx) und die Tore
// (src/tests/international-redirect.test.ts).
//
// Die Abbildung ist heute die IDENTITÄT — die Ziel-Sektionen der Säule werden
// von derselben Komponente gerendert wie zuvor die Alias-Seite
// (InternationalRubriken, §5) und tragen dieselben ids. Sie steht trotzdem
// explizit da: eine spätere Rubrik-Umbenennung hat damit GENAU EINE Stelle,
// und der Test prüft jedes Ziel gegen die real gerenderten ids statt gegen
// eine Annahme (§7 «verifizieren, nicht vertrauen»).

/** Kanonische Säulen-URL der International-Rubrik (Ziel des /international-Redirects). */
export const INTERNATIONAL_SAEULE = '/gesetze?ebene=international';

/** Alt-Pfad, dessen Link-Erbe der Redirect übernimmt. */
export const INTERNATIONAL_ALIAS = '/international';

/** Die fünf Sach-Anker der Sidebar samt Ziel-Anker auf der Säule. */
export const INTERNATIONAL_RUBRIKEN: { label: string; anker: string; zielAnker: string }[] = [
  { label: 'Menschenrechte', anker: 'menschenrechte', zielAnker: 'menschenrechte' },
  { label: 'Int. Privat- & Zivilrecht', anker: 'privat-zivil', zielAnker: 'privat-zivil' },
  { label: 'Rechtshilfe (Haager)', anker: 'rechtshilfe', zielAnker: 'rechtshilfe' },
  { label: 'Schweiz–EU', anker: 'schweiz-eu', zielAnker: 'schweiz-eu' },
  { label: 'EU-Verordnungen (DSGVO u. a.)', anker: 'eu-verordnungen', zielAnker: 'eu-verordnungen' },
];

/** Säulen-URL mit Sach-Anker (leerer Anker → nackte Säule). */
export function saeulenZiel(zielAnker: string): string {
  return zielAnker ? `${INTERNATIONAL_SAEULE}#${zielAnker}` : INTERNATIONAL_SAEULE;
}

/**
 * Hash eines Alt-Links `/international#<anker>` → Hash auf der Säule.
 * Massstab sind ALLE real gerenderten Sektions-ids der Säule
 * (INTERNATIONAL_RUBRIK_IDS, 7 Stück), nicht nur die 5 Sidebar-Rubriken —
 * sonst verliert der Client-Pfad funktionierende Anker, die der Server-308
 * (Browser hängt das Fragment selbst an) erhält (Bug-Check #424, B-1).
 * Unbekannte Anker (Tippfehler, Fremdlinks) verlieren den Hash, statt einen
 * toten Anker weiterzureichen: die Säule ist dann der ehrliche Landeplatz
 * (§8 — kein stiller Sprung ins Leere). Ohne Hash bleibt es ohne Hash.
 */
export function internationalAnkerAbbildung(hash: string): string {
  const roh = decodeURIComponent(hash.replace(/^#/, ''));
  if (!roh) return '';
  return INTERNATIONAL_RUBRIK_IDS.includes(roh) ? roh : '';
}

// Gesetze: «Bund» nach der funktionalen Systematik (systematik.ts) UND «Kantone»
// nach Kanton — beide als gleichartige aufklappbare Untergruppen (Auftrag David
// 20.6.2026: Kantone gleich wie Bund, aufklappbar in die Kantone). Ziel = /gesetze
// mit ?ebene= (Tab-Vorwahl) und Kategorie-Anker «sys-<id>» bzw. ?kt=<KT> (Vorwahl).
const GESETZE_KINDER: NavKnoten[] = [
  {
    art: 'gruppe',
    label: 'Bund',
    ziel: '/gesetze?ebene=bund',
    aufklappbar: true,
    standardOffen: false,
    kinder: SYSTEMATIK.map((k) => link(k.titel, `/gesetze?ebene=bund#sys-${k.id}`)),
  },
  {
    art: 'gruppe',
    label: 'Kantone',
    ziel: '/gesetze?ebene=kanton',
    aufklappbar: true,
    standardOffen: false,
    // Ordnung vereinheitlichen (Gesetzes-UX G5 · §4.3.4): die Kantone erscheinen
    // ALPHABETISCH nach Vollnamen — dieselbe Ordnung wie das Kantonsraster der
    // Übersicht, statt der früheren föderalen Standesordnung (BV Art. 1), die der
    // alphabetischen Raster-/Pill-Ordnung widersprach. Vollname statt Code, damit
    // die Liste scannbar ist (David: «sehr unübersichtlich»).
    // IA-7 (§11.5): Erlass-Zahl-Badge an JEDEM Kantonslink — dieselbe Mengen-
    // Ehrlichkeit wie die IA-2-Pills/-Karten (§8): Zahl = Zähler-SSoT,
    // Zustands-Wort = erfassungsgrad.ts (nur konsumiert). 0-Fall: Badge «0»,
    // aria «keine Erlasse» (Wortlaut wie SchweizKarte/AzRegister, O4).
    // Skalierungs-Invariante (§11.0): kein «if kanton === …», nur Ableitung.
    kinder: [...KANTONE]
      .sort((a, b) => KANTON_NAMEN[a].localeCompare(KANTON_NAMEN[b], 'de'))
      .map((kt) => {
        const n = STARTSEITE_ZAEHLER.kantonErlassZahlen[kt] ?? 0;
        const wort = STUFE_WORT[erfassungsgrad(kt, n).stufe];
        const mengen = n === 0 ? 'keine Erlasse' : `${n} ${n === 1 ? 'Erlass' : 'Erlasse'}`;
        return {
          ...link(KANTON_NAMEN[kt], `/gesetze?ebene=kanton&kt=${kt}`),
          zahl: n,
          ariaLabel: `${KANTON_NAMEN[kt]} — ${mengen}, ${wort}`,
        };
      }),
  },
  // International unter «Gesetze» subsumiert (Auftrag David 25.6.2026) — eigene
  // einklappbare Gruppe wie Bund/Kantone. IA-6 Stufe 2 (FAHRPLAN-GESETZES-UX
  // §11.4 Ziff. 3, §11.8 Y-C, W2·5d): Kopf UND Kinder zeigen jetzt auf die
  // KANONISCHE Säule — die Kinder auf `?ebene=international#<anker>`. Damit
  // läuft keine interne Navigation mehr über den Alias (R-SCOPE-4: geteilte Nav
  // ausserhalb Gesetze.tsx); /international selbst bleibt als Alt-Link-Erbe
  // auflösbar, aber nur noch als Redirect (vercel.json 308 + InternationalRedirect).
  {
    art: 'gruppe',
    label: 'International',
    ziel: INTERNATIONAL_SAEULE,
    aufklappbar: true,
    standardOffen: false,
    kinder: INTERNATIONAL_RUBRIKEN.map((r) => link(r.label, saeulenZiel(r.anker))),
  },
];

// Rechtsprechung: gleichrangig zu «Gesetze». Die Sachgebiete (GEBIETE, dieselbe
// Sach-Achse wie die Gesetze → Verzahnung) liegen in EINER einklappbaren Gruppe
// «Nach Sachgebiet» — damit der Eintrag ein Dropdown ist wie Bund/Kantone unter
// Gesetze (Auftrag David 24.6.2026), standardmässig zu. Ziel je Sachgebiet:
// /rechtsprechung?rg=<gebiet> (Vorwahl, teilbar).
const RECHTSPRECHUNG_KINDER: NavKnoten[] = [
  {
    art: 'gruppe',
    label: 'Nach Sachgebiet',
    aufklappbar: true,
    standardOffen: false,
    // 'international' ist die Sach-Achse der Rubrik «International» (Staatsverträge),
    // nicht der Rechtsprechung — kein Entscheid trägt es. Aus der Rechtsprechungs-
    // Navigation ausgeblendet (sonst leerer Sachgebiets-Link, §8).
    kinder: GEBIETE.filter((g) => g.id !== 'international').map((g) => link(g.label, `/rechtsprechung?rg=${g.id}`)),
  },
];

// Materialien: amtliche Ressourcen (Soft-Law) je Behörde — EINE einklappbare
// Gruppe «Nach Behörde» (wie Rechtsprechung «Nach Sachgebiet»), standardmässig
// zu. Ziel je Behörde: /materialien#b-<id> (Sprung-Anker der Übersicht).
const MATERIALIEN_KINDER: NavKnoten[] = [
  {
    art: 'gruppe',
    label: 'Nach Behörde',
    aufklappbar: true,
    standardOffen: false,
    kinder: BEHOERDEN.map((b) => link(b.kuerzel, `/materialien#b-${b.id}`)),
  },
];

// ─── Hauptnavigation ─────────────────────────────────────────────────────────

export const NAVIGATION: NavAbschnitt[] = [
  // «Recherche» bewusst entfernt (Auftrag David 19.6.2026): das Browsen läuft
  // über die Kategorie-Drilldowns (Fristen · Gebühren & Beträge · Vorlagen).
  //
  // Reihenfolge (Startseite V3, I1 — FAHRPLAN §7): Nachschlagen zuerst
  // (Gesetze · Rechtsprechung · Materialien), dann die aktiven Werkzeuge
  // (Rechner · Vorlagen). Rubrik-Kacheln der Startseite iterieren über dasselbe
  // Array (ohne «Start») — eine Landkarte, eine Ordnung.
  { titel: null, kinder: [link('Start', '/')] },
  { titel: 'Gesetze', ziel: '/gesetze', kinder: GESETZE_KINDER },
  { titel: 'Rechtsprechung', ziel: '/rechtsprechung', kinder: RECHTSPRECHUNG_KINDER },
  { titel: 'Materialien', ziel: '/materialien', kinder: MATERIALIEN_KINDER },
  { titel: 'Rechner', ziel: '/rechner', kinder: RECHNER_KINDER },
  { titel: 'Vorlagen', ziel: '/vorlagen', kinder: VORLAGEN_KINDER },
];

// Utility/Meta unten in der Seitenleiste — echte, indexierbare Routen.
export const NAVIGATION_META: NavLink[] = [
  link('Einstellungen', '/einstellungen'),
  link('Methodik', '/methodik'),
  link('Über', '/ueber'),
  link('Kontakt', '/kontakt'),
  link('Datenschutz', '/datenschutz'),
];

/** Alle Blatt-Ziele (flach) — für Tests/Abgleich (keine toten Links). */
export function alleNavLinks(knoten: NavKnoten[] = [
  ...NAVIGATION.flatMap((a) => a.kinder),
  ...NAVIGATION_META,
]): NavLink[] {
  return knoten.flatMap((k) => (k.art === 'link' ? [k] : alleNavLinks(k.kinder)));
}
