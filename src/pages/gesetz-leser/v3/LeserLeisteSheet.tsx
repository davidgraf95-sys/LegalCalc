import { createPortal } from 'react-dom';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { GliederungSheet } from '../parts/GliederungSheet';

// ─── Die Seitenleiste als Bottom-Sheet (Kap. 4b) ─────────────────────────────
//
// Herausgelöst aus `LeserRahmenV3.tsx` (H3, §6.6): der Rahmen soll sagen, WO
// etwas steht — nicht auch noch, wie ein Portal in eine Overlay-Schicht hängt.
// Er entscheidet weiterhin OB (Breite, Klapp-Zustand) und WOHIN (`ziel`,
// `paneRolle`); beides kommt als Prop, damit diese Datei ohne `imPane`- und ohne
// Breiten-Zweig bleibt (Fundament-Sonde: `imPane`/`istSekundaer` nur in den
// Wurzel-Dateien).
//
// ── H2 · DAS SHEET TRÄGT SEINE PANE-ROLLE (Befund 16.8.2026) ────────────────
// Gemessen im Split @1440 (Pane 590 px, also unter der xl-Schwelle): das Sheet
// wird per Portal in die Overlay-Schicht gehängt und landet dabei AUSSERHALB von
// `[data-pane="…"]` — die Vorfahrenkette des Suchfelds endete bei `#root`. Damit
// verliert die einzige Bedienung des Panes, die es in dieser Breite gibt, ihre
// Zugehörigkeit: bei ZWEI offenen Sheets sind zwei identische Suchfelder
// ununterscheidbar nebeneinander im DOM.
//
// Das ist kein Test-Problem, sondern eine Lücke im Portal-Vertrag, und H3 hängt
// das Kontext-Panel in dieselbe Schicht (`LeserPanelZone` trägt denselben
// Marker). Die Rolle wandert darum MIT: ein Attribut an der Sheet-Wurzel,
// gesetzt aus derselben Quelle, aus der auch der Adress-Schreiber seine
// Pane-Weiche zieht (`istSekundaer`, nicht `imPane` — B1-Falle); der Rahmen
// reicht sie als `paneRolle` herein.
//
// Ä5: der BEHÄLTER nennt seine Fläche, der klebende Leisten-Sockel liest sie
// (`.lc-leiste-sockel`, index.css) — sonst malte er `paper` auf ein
// `paper-raised`-Blatt (gemessen 17.8.2026 als Tonkante).

export function LeserLeisteSheet({
  ziel, paneRolle, sheetRef, onSchliessen, pfad, aktArtikelLabel,
  sprungFeld, feldZuoberst, ortAnzeigen, titel, baum,
}: {
  /** Overlay-Wurzel des Panes; `null` = Einzelansicht (Sheet im Fluss). */
  ziel: HTMLElement | null;
  paneRolle: 'primaer' | 'sekundaer';
  sheetRef: RefObject<HTMLDivElement | null>;
  onSchliessen: () => void;
  pfad: string[];
  aktArtikelLabel: string | null;
  /** ── A2 (H2b-Nachzug) · DASSELBE Suchfeld, jetzt IM Blatt ────────────────
   *  Ä19 hatte das Feld in die Such-Zone des Kopf-Blocks gezogen und im Blatt
   *  weggelassen. Der H2b-Nachzug hat das umgekehrt: bei offenem Blatt fängt der
   *  Dialog den Fokus, das Feld im Kopf-Block wäre also unerreichbar (WCAG
   *  2.4.3). Darum gibt die Such-Zone es solange her und das Blatt trägt es —
   *  EIN Feld, nie zwei (§5, Fehler K2). Der Rahmen entscheidet, welche Lage
   *  gilt (`blattOffen`). */
  sprungFeld?: ReactNode;
  /** Ä18: das Feld ist das oberste Element — auf allen drei Breiten dieselbe Regel. */
  feldZuoberst?: boolean;
  /** Ä32: «Sie sind hier» gehört zur Gliederung, nicht über die Trefferliste. */
  ortAnzeigen?: boolean;
  titel: string;
  baum: ReactNode;
}) {
  const sheet = (
    <div data-v3-pane={paneRolle} style={{ '--leser-leiste-flaeche': 'var(--paper-raised)' } as CSSProperties}>
      <GliederungSheet sheetRef={sheetRef} inPane={ziel != null} onSchliessen={onSchliessen}
        pfad={pfad} aktArtikelLabel={aktArtikelLabel}
        sprungFeld={sprungFeld} feldZuoberst={feldZuoberst} ortAnzeigen={ortAnzeigen}
        // Ä10: der Blatt-Kopf benennt die Zone; die Leiste darin schweigt.
        titel={titel} baum={baum} />
    </div>
  );
  return ziel ? createPortal(sheet, ziel) : sheet;
}
