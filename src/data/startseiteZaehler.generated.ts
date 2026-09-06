// ─── GENERIERT via `npm run gen:zaehler` ────────────────────────────────
// NICHT von Hand editieren. Quellen (SSoT §5): public/normtext/register.json,
// public/rechtsprechung/register.json und der Katalog (startseiteConfig.ts).
// Drift-Tor: `npm run check:zaehler`. Nur echter Volltext ist gezählt
// (Gesetze/Entscheide: status snapshot bzw. Nicht-Verweise).

export interface StartseiteZaehler {
  /** Bundeserlasse im Volltext (status snapshot). */
  gesetzeBundVolltext: number;
  /** Kantonserlasse im Volltext (status snapshot). */
  gesetzeKantonVolltext: number;
  /** Bund + Kanton im Volltext. */
  gesetzeVolltext: number;
  /** IA-7: erfasste Erlasse JE Kanton (alle Manifest-Einträge der Ebene kanton —
   *  dieselbe Zählregel wie die IA-2-Badges/`kantonAnzahl` in Gesetze.tsx). */
  kantonErlassZahlen: Record<string, number>;
  /** W2·24-R3: Systematik des Bundesrechts (Ordnung + Titel aus
   *  `lib/normtext/systematik.ts`, Anker `/gesetze?ebene=bund#sys-<id>`),
   *  je Kategorie die Zahl der VOLLTEXT-Erlasse und bis zu vier Kürzel. */
  bundSystematik: Array<{ nr: string; id: string; titel: string; kuerzel: string[]; anzahl: number }>;
  /** Bundeserlasse der Säule «International» im Volltext (rechtsgebiet international). */
  gesetzeInternationalVolltext: number;
  /** Bis zu vier Kürzel der Säule «International» (Register-Reihenfolge). */
  internationalKuerzel: string[];
  /** Gerichtsentscheide im Volltext (Nicht-Verweise). */
  rechtsprechungVolltext: number;
  /** Erfasste amtliche Materialien (Behördenpublikationen, nur-live-link). */
  materialien: number;
  /** W2·24-R3: erfasste Materialien je Behörde, Reihenfolge BEHOERDEN (rang);
   *  Behörden ohne Eintrag fehlen (nie eine 0-Zeile behaupten, §8). */
  materialienBehoerden: Array<{ id: string; kuerzel: string; name: string; anzahl: number }>;
  /** Verfügbare Rechner (eigene Seite). */
  rechner: number;
  /** Verfügbare Vorlagen (eigene Seite). */
  vorlagen: number;
  /** Stand der Gesetzes-Register-Erzeugung (ISO). */
  standGesetze: string;
  /** Stand der Rechtsprechungs-Register-Erzeugung (ISO). */
  standRechtsprechung: string;
  /** Stand der Materialien-Register-Erzeugung (ISO). */
  standMaterialien: string;
}

export const STARTSEITE_ZAEHLER: StartseiteZaehler = {
  "gesetzeBundVolltext": 227,
  "gesetzeKantonVolltext": 1338,
  "gesetzeVolltext": 1565,
  "kantonErlassZahlen": {
    "AG": 4,
    "AI": 4,
    "AR": 266,
    "BE": 5,
    "BL": 5,
    "BS": 859,
    "FR": 6,
    "GE": 4,
    "GL": 4,
    "GR": 6,
    "JU": 7,
    "LU": 5,
    "NE": 4,
    "NW": 4,
    "OW": 3,
    "SG": 5,
    "SH": 3,
    "SO": 2,
    "SZ": 4,
    "TG": 4,
    "TI": 5,
    "UR": 1,
    "VD": 7,
    "VS": 6,
    "ZG": 4,
    "ZH": 111
  },
  "bundSystematik": [
    {
      "nr": "01",
      "id": "staat",
      "titel": "Staats- und Verfassungsrecht",
      "kuerzel": [
        "BV",
        "ParlG",
        "RVOG",
        "RVOV"
      ],
      "anzahl": 9
    },
    {
      "nr": "02",
      "id": "privatrecht",
      "titel": "Privatrecht",
      "kuerzel": [
        "ZGB",
        "ZStV",
        "GBV",
        "TGBV"
      ],
      "anzahl": 32
    },
    {
      "nr": "03",
      "id": "zivilverfahren",
      "titel": "Zivilprozess- und Zwangsvollstreckungsrecht",
      "kuerzel": [
        "ZPO",
        "SchKG",
        "GebV SchKG",
        "KOV"
      ],
      "anzahl": 6
    },
    {
      "nr": "04",
      "id": "straf",
      "titel": "Strafrecht und Strafverfahren",
      "kuerzel": [
        "StGB",
        "StPO",
        "JStPO",
        "JStG"
      ],
      "anzahl": 14
    },
    {
      "nr": "05",
      "id": "verwaltung",
      "titel": "Verwaltungsrecht",
      "kuerzel": [
        "VwVG",
        "VGG",
        "VGKE",
        "VGR"
      ],
      "anzahl": 139
    }
  ],
  "gesetzeInternationalVolltext": 27,
  "internationalKuerzel": [
    "CISG",
    "LugÜ",
    "HZÜ",
    "HBewÜ"
  ],
  "rechtsprechungVolltext": 5093,
  "materialien": 1561,
  "materialienBehoerden": [
    {
      "id": "ESTV",
      "kuerzel": "ESTV",
      "name": "Eidgenössische Steuerverwaltung",
      "anzahl": 144
    },
    {
      "id": "EDOEB",
      "kuerzel": "EDÖB",
      "name": "Eidg. Datenschutz- und Öffentlichkeitsbeauftragter",
      "anzahl": 18
    },
    {
      "id": "SECO",
      "kuerzel": "SECO",
      "name": "Staatssekretariat für Wirtschaft",
      "anzahl": 155
    },
    {
      "id": "BSV",
      "kuerzel": "BSV",
      "name": "Bundesamt für Sozialversicherungen",
      "anzahl": 3
    },
    {
      "id": "BJ",
      "kuerzel": "EHRA",
      "name": "Eidg. Amt für das Handelsregister (Bundesamt für Justiz)",
      "anzahl": 2
    },
    {
      "id": "FINMA",
      "kuerzel": "FINMA",
      "name": "Eidgenössische Finanzmarktaufsicht",
      "anzahl": 2
    },
    {
      "id": "IGE",
      "kuerzel": "IGE",
      "name": "Eidg. Institut für Geistiges Eigentum",
      "anzahl": 2
    },
    {
      "id": "BR",
      "kuerzel": "BR",
      "name": "Bundesrat (Botschaften)",
      "anzahl": 407
    },
    {
      "id": "BUND",
      "kuerzel": "Bund",
      "name": "Bund (Vernehmlassungen)",
      "anzahl": 828
    }
  ],
  "rechner": 23,
  "vorlagen": 26,
  "standGesetze": "2026-09-05",
  "standRechtsprechung": "2026-09-05",
  "standMaterialien": "2026-09-05"
};
