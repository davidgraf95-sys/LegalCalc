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
  /** Gerichtsentscheide im Volltext (Nicht-Verweise). */
  rechtsprechungVolltext: number;
  /** Erfasste amtliche Materialien (Behördenpublikationen, nur-live-link). */
  materialien: number;
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
  "gesetzeKantonVolltext": 1339,
  "gesetzeVolltext": 1566,
  "kantonErlassZahlen": {
    "AG": 4,
    "AI": 4,
    "AR": 266,
    "BE": 5,
    "BL": 5,
    "BS": 859,
    "FR": 6,
    "GE": 4,
    "GL": 5,
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
  "rechtsprechungVolltext": 5093,
  "materialien": 1561,
  "rechner": 23,
  "vorlagen": 26,
  "standGesetze": "2026-09-04",
  "standRechtsprechung": "2026-08-31",
  "standMaterialien": "2026-09-05"
};
