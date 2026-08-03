// ─── Sach-Rubriken der International-Übersicht (Daten, §3) ──────────────────
//
// Reine Daten-Gliederung: welche Erlass-Keys in welcher Rubrik stehen, mit
// welchem Titel und welcher Sektions-id. Steht in `lib/`, nicht in der
// Komponente, weil die ids AUCH ausserhalb der Darstellung gebraucht werden:
// die Anker-Abbildung des /international-Redirects (IA-6 Stufe 2, §11.8 Y-C)
// prüft ihre Ziele gegen die WIRKLICH gerenderten Sektions-ids statt gegen
// eine Annahme (§7). Genau EINE Quelle für beide (§5) — Darstellung dazu:
// src/components/normtext/InternationalRubriken.tsx.
//
// Keine Rechtslogik, keine Normtexte: alle Einträge sind nur-live-link
// (massgeblich bleibt die amtliche Quelle Fedlex/EUR-Lex, §7/§8).

export const INTERNATIONAL_GRUPPEN: { id: string; titel: string; lede: string; keys: string[] }[] = [
  {
    id: 'menschenrechte',
    titel: 'Menschenrechte',
    lede: 'Die für die Schweiz verbindlichen Menschenrechtsgarantien — wirken über Querverweise in alle nationalen Rechtsgebiete hinein.',
    keys: ['EMRK', 'UNO_PAKT_II', 'UNO_PAKT_I', 'KRK', 'CEDAW', 'UNO_ANTIFOLTER'],
  },
  {
    id: 'privat-zivil',
    titel: 'Internationales Privat- & Zivilrecht',
    lede: 'Vertrags-, Zuständigkeits- und Vollstreckungsrecht über die Grenze — vom Wiener Kaufrecht über das Lugano-Übereinkommen bis zur Vollstreckung ausländischer Schiedssprüche.',
    keys: ['CISG', 'LUGUE', 'VRK', 'NYUE'],
  },
  {
    id: 'rechtshilfe',
    titel: 'Rechtshilfe & Kindes-/Erwachsenenschutz (Haager Übereinkommen)',
    lede: 'Internationale Zusammenarbeit in Zivil- und Handelssachen — Zustellung, Beweisaufnahme, Kindesentführung, internationale Adoption und Erwachsenenschutz.',
    keys: ['HZUE', 'HBEWUE', 'HKUE', 'HAUE', 'HEUE'],
  },
  {
    id: 'asyl-migration',
    titel: 'Asyl & Migration',
    lede: 'Die völkerrechtlichen Grundlagen des Flüchtlings- und Staatenlosenrechts.',
    keys: ['GFK', 'STAATENLOSE'],
  },
  {
    id: 'weitere-spezial',
    titel: 'Weitere Spezialgebiete',
    lede: 'Gewerblicher Rechtsschutz und internationale Zivilluftfahrt.',
    keys: ['PVUE', 'ICAO'],
  },
  {
    id: 'schweiz-eu',
    titel: 'Schweiz–EU',
    lede: 'Das bilaterale Verhältnis Schweiz–EU — das Freizügigkeitsabkommen als zentraler Pfeiler.',
    keys: ['FZA'],
  },
  {
    id: 'eu-verordnungen',
    titel: 'EU-Verordnungen mit Praxisrelevanz',
    lede: 'Spezifische EU-Verordnungen ohne Fedlex-Volltext, aber mit mittelbarer Wirkung auf Schweizer Sachverhalte (extraterritoriale Reichweite, grenzüberschreitendes Privatrecht) — je nur mit Link zur amtlichen EUR-Lex-Fassung.',
    keys: ['DSGVO', 'DSA', 'DMA', 'KI_VO', 'MICA', 'ROM_I', 'ROM_II', 'BRUESSEL_IA'],
  },
];

/** Die Sektions-ids, die die International-Übersicht als `<section id=…>` rendert. */
export const INTERNATIONAL_RUBRIK_IDS: string[] = INTERNATIONAL_GRUPPEN.map((g) => g.id);
