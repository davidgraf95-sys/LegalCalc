import type { BrowseErlass } from '../../../lib/normtext/browse-typen';
import type { CurrencyEintrag, ErlassKopf } from '../../../lib/normtext/browse';
import type { ErlassTyp } from '../../../lib/normtext/register';
import { erfassungsgrad, STUFE_WORT } from '../../../lib/normtext/erfassungsgrad';
import { nichtKonsolidiertSatz, naechsteFassungSatz } from '../../../lib/normtext/erlassKopfText';
import type { KantonSystematik } from '../../../lib/normtext/systematik';
import type { GliederungsKennzahlen } from '../gliederungsModell';
import { formatiereDatum, kopfOverline, verifiziertesSachgebiet } from '../helpers';
import { teilerfassung, nurErlassdatum, erlassOrgan } from '../erlassUebersichtDaten';
import type { BestimmungsWort } from './erlassAnsicht';

// ═══ Übersichtsbox → Angaben (David-Auftrag 17.8.2026, «orientiere dich an
//     fedlex») ══════════════════════════════════════════════════════════════
//
// «Das Übersichtfeld ist sehr unästhetisch, insbesondere wenn es aufgeklappt
//  ist. Mach das schöner und orientiere dich an Fedlex.» — Wortlaut David.
//
// Diese Datei ist die REINE HÄLFTE der Antwort: sie entscheidet, WELCHE Angaben
// die Box trägt, und liefert sie als typisierte Zeilen. Die Komponente rendert
// nur noch (§3). Warum getrennt: die Auswahl je Erlassart ist die Sache, die
// falsch werden kann («SR —» am Kantonserlass, «Artikel» am §-Erlass, eine leere
// Wertspalte) — und sie ist ohne Browser prüfbar (`leser-v3-uebersicht.test.ts`,
// je Erlassart ein Fall). Rein und deterministisch (§2): kein DOM, keine Uhr,
// kein Speicher.
//
// ─── WAS FEDLEX VORMACHT (docs/ux-audit-2026-07/fedlex/or-top.png) ──────────
//
// Fedlex setzt links neben den Erlass eine Karte «Allgemeine Informationen»:
// Label links, Wert rechts, je Paar EINE Zeile, dazwischen Haarlinien —
// «Abkürzung OR», «Beschluss 30. März 1911», «Inkrafttreten 1. Januar 1912»,
// «Quelle AS 27 317». Sans, ruhig, keine Doppelpunkte, keine gemischten
// Schriftstimmen. Der Datumssatz im Textkopf lautet «vom 30. März 1911 (Stand am
// 1. Januar 2026)».
//
// ÜBERNOMMEN: der Label/Wert-Rhythmus, eine Zeile je Angabe, Sans für alles
// Meta, keine Doppelpunkte, Datum in der amtlichen Form «vom …».
// NICHT ÜBERNOMMEN: die Karte selbst. Design-Grundlage Kap. 8 Nr. 1 verbietet
// Rahmen um jedes Element («Trennung über Weissraum, dann Linie») — und die Box
// war bis H2b genau so ein Kasten (Ä5). Statt Fedlex' Rahmen plus Linie je Zeile
// trägt die Liste EINE Haarlinie oben und EINE unten; die Zeilen trennt das
// 4-px-Raster. Ebenfalls nicht übernommen: Fedlex' drei Karten übereinander
// (Fahrplan Kap. 4b: «EINE Übersichtsbox, nicht sticky — Fedlex hat drei»).
//
// ─── DOPPELT ODER NICHT? DIE ENTSCHEIDUNG, DIE DER AUFTRAG VERLANGT ─────────
//
// Gemessen 17.8.2026 (D 1440, Box aufgeklappt, fünf Erlasse) stand die Box
// GLEICHZEITIG mit dem Erlass-Kopf auf dem Bild — beide über der Falz, keine 40
// cm auseinander. Was der Kopf (`parts/ErlassLeserKopf.tsx`, S3) dort ohnehin
// sagt: SR-Nummer · Bestimmungszahl · Stand · «in Kraft seit …» · den
// Standausweis «gegen Fedlex-Konsolidierung geprüft am … (maschinell)» · die
// Warnung «nicht konsolidiert» · «↗ geltende Fassung» · das amtliche PDF · und
// als Overline die oberste Sachgebiets-Stufe.
//
// Die naheliegende Rechtfertigung «die Box hält fest, was der Kopf beim Scrollen
// verliert» ist NACHGEPRÜFT UND FALSCH: die Übersichtsbox steht ausserhalb des
// klebenden Blocks und scrollt selbst weg (Fahrplan Kap. 4b, Sonde
// `e2e/leser-v3-seitenleiste-ordnung` (b) misst genau das). Wer tief in Art. 429
// liest, hat WEDER den Kopf NOCH die Box. Es gibt also nichts «festzuhalten» —
// die Box ist Ankunfts-Auskunft, und zwei Ankunfts-Auskünfte nebeneinander sind
// eine zu viel (§5, Design-Grundlage Kap. 1 Nr. 3).
//
// DARAUS DIE ARBEITSTEILUNG:
//   Kopf  = WELCHER Erlass, WIE AKTUELL, WO die amtliche Fassung.
//   Box   = WOHER er kommt und WIE er gebaut ist — der Steckbrief.
//
// Gestrichen, weil der Kopf es im selben Bild sagt (je mit Messwert im
// Vollzugsvermerk): der Grundhinweis «Massgeblich ist stets die amtliche
// Fassung.» (stand an der StPO im selben Kasten wie die Warnung, die denselben
// Halbsatz trägt — gemessen 2 Vorkommen), der Standausweis-Satz «gegen
// Fedlex-Konsolidierung geprüft am …», und die Umfang-Zeile (ihre Zahl steht in
// der Ruhezeile).
// GEBLIEBEN ist dagegen die Datums-KETTE Erlassdatum → In Kraft seit → Stand,
// obwohl der Kopf zwei ihrer Glieder auch führt: dort stehen sie als «·»-Kette
// in einer Zeile, hier als Chronologie in drei — das ist Fedlex' «Beschluss /
// Inkrafttreten»-Block und die Frage, für die man eine Steckbrief-Liste
// überhaupt aufklappt. Die Dopplung ist damit bewusst und benannt, nicht
// übersehen.
// Gestrichen, weil gemessen wertlos: die Fassungs-Kennung. In Datumsform ist sie
// derselbe Wert wie der Stand in anderer Notation («Stand 01.04.2025 · Fassung
// 20250401», §5); in Hash-Form trifft sie 1231 von 1469 Erlassen (84 %,
// gezählt über `register.json` 17.8.2026) und ist ein Drift-Schlüssel für die
// Maschine, keine Auskunft für den Leser — §7 Bst. d ist durch die
// Drift-ERKENNUNG erfüllt, nicht durch das Abdrucken des Hashes.
//
// GEBLIEBEN ist alles, was NUR die Box trägt: Erlassart, erlassgebendes Organ,
// Erlassdatum, Gliederungstiefe/Anhang, das volle Sachgebiet, die amtlichen
// Ziele — und die vier §8-Sätze über die Grenzen unserer eigenen Erfassung, die
// bis hierher hinter einer ZWEITEN Klappe («Mehr zu diesem Erlass») lagen. Ein
// Ehrlichkeits-Hinweis, für den man zweimal klicken muss, ist keiner (§8).

/** Eine Zeile der Label/Wert-Liste. `label` ist die Sprache, `id` der Anker. */
export interface UebersichtZeile {
  /** Stabile Kennung für React-Key und Sonde — nie der Label-Text: der ist
   *  Sprache und darf sich ändern, ohne einen Wächter zu brechen. */
  id: string;
  label: string;
  /** Der Wert. NIE leer: eine Zeile ohne Wert entsteht gar nicht (§8 — «SR —»
   *  ist keine Auskunft, sondern ein leeres Versprechen). */
  wert: string;
  /** Ziffern-Wert ⇒ `tabular-nums` (Design-Grundlage Kap. 2.3). */
  ziffern?: boolean;
}

/** Ein amtliches Ziel. Getrennt von den Zeilen, weil die Skizze 4e Fakten und
 *  Aktionen ausdrücklich trennt — und weil ein Link kein Wert ist. */
export interface UebersichtLink {
  id: string;
  label: string;
  href: string;
  /** Zeichen vor dem Label: ↗ verlässt die Seite, ⬇ liefert eine Datei. */
  zeichen: '↗' | '⬇';
}

export interface UebersichtsAngaben {
  /** Die EINE Zeile im Ruhezustand — «SR 312.0 · 480 Artikel». */
  ruhe: string;
  zeilen: UebersichtZeile[];
  links: UebersichtLink[];
  /** Warnung «nicht konsolidiert», GENAU EINMAL. Der Wortlaut ist der des
   *  Erlass-Kopfs (`nichtKonsolidiertSatz`, S3/F5) — bis hierher führte die Box
   *  einen eigenen, zweiten Wortlaut für denselben Sachverhalt (§5). Das «⚠»
   *  steckt NICHT im String: es ist redundante Verstärkung und wird im UI
   *  `aria-hidden` davorgesetzt (DESIGN-REGLEMENT B3). */
  warnung: string | null;
  /** Angekündigte, noch nicht geltende Konsolidierung. Eigenes Feld, weil es
   *  eine andere Aussage ist als die fehlende Konsolidierung — und weil beide
   *  gleichzeitig zutreffen können. */
  vorbehalt: string | null;
  /** Die §8-Sätze über die Grenzen der eigenen Erfassung. Leer = nichts zu
   *  vermelden; dann entfällt der Block, statt «keine Einschränkungen» zu
   *  behaupten (das wäre eine Aussage, die wir nicht belegen können). */
  hinweise: string[];
}

export interface UebersichtsEingabe {
  erlass: BrowseErlass;
  /** Erlass-Kopf aus dem Struktur-Sidecar; `null` = noch nicht geladen (§8). */
  kopf: ErlassKopf | null;
  currency: CurrencyEintrag | undefined;
  erlassTyp: ErlassTyp | undefined;
  /** Gezählte Bestimmungen des Snapshots. `null` = KEIN Snapshot geladen
   *  (nur-live-link/pdf-embed) — dann keine Zahl statt einer falschen Null. */
  anzahl: number | null;
  bestimmungsWort: BestimmungsWort;
  bestimmungsEtikettStatus: 'entwurf' | undefined;
  gliederungsTiefe: number;
  kennzahlen: GliederungsKennzahlen | null;
  kantonSys: Record<string, KantonSystematik>;
  kantonErlassAnzahl: number | null;
  nichtKonsolidiert: boolean;
  nichtKonsolidiertSeit: string | null;
}

/**
 * Die eine Zeile im Ruhezustand: «SR 312.0 · 480 Artikel».
 *
 * ÄNDERUNG gegenüber `erlassAnsicht.uebersichtsZeile` (die weiterhin existiert
 * und weiterhin von ihren Sonden geprüft wird): der **Stand fällt weg**.
 * Gemessen 17.8.2026 an allen fünf Probe-Erlassen lief die alte Zeile über DREI
 * Zeilen à 11 px in der Mono-Stimme — sie war der sichtbarste Teil dessen, was
 * David «unästhetisch» nannte, und ihr längstes Glied war «Stand 01.04.2025».
 * Der Stand steht im Erlass-Kopf im selben Bild und in der Liste unten als
 * eigene Zeile; er verschwindet also nicht, er hört nur auf, die Ruhezeile zu
 * sprengen.
 *
 * Fehlende Angaben entfallen ERSATZLOS: ein Erlass ohne SR-Nummer (12 von 1469,
 * gezählt 17.8.2026) bekommt keinen Platzhalter.
 */
export function ruheZeile(
  erlass: Pick<BrowseErlass, 'sr'>,
  anzahl: number | null,
  bestimmungsWort: BestimmungsWort,
): string {
  return [
    erlass.sr ? `SR ${erlass.sr}` : null,
    anzahl != null ? `${anzahl} ${bestimmungsWort}` : null,
  ].filter(Boolean).join(' · ');
}

/**
 * Präpositionen, die ein Sidecar-Erlassdatum einleiten kann — BELEGT, nicht
 * geraten. Gezählt über alle 1420 Struktur-Sidecars (18.8.2026, kein Netz):
 * «Vom» 890 · «vom» 493 · gar keine 27 · «du» 10 (FR/VS). Andere Formen kommen
 * im Korpus nicht vor; käme eine dazu, fängt sie der Rückfall in `datumsAngabe`
 * auf, statt still verstümmelt zu werden.
 *
 * WARUM EIN MUSTER MIT WORTGRENZE UND KEIN `slice(4)`: 27 Sidecars schreiben das
 * Datum ohne Präposition («12. April 2000», gemessen an BS-640.100 im
 * Ä74-Befund). Ein stumpfes Abschneiden verstümmelte diese Gruppe still — der
 * Wert begänne mit «April 2000». Darum eine Identitäts-Prüfung mit Wortgrenze
 * (§7): getroffen wird nur ein führendes Listenwort, gefolgt von Weissraum.
 */
const PRAEPOSITION = /^(?:vom|du)\s+/i;

/**
 * Die fremdsprachigen Geschwister der «(Stand …)»-Klammer, die `nurErlassdatum`
 * schneidet. Gezählt an denselben 1420 Sidecars: «(Stand …)» 1409 (dort erledigt)
 * · «(version …)» 5 · «(état …)» 5 · «(Fassung in Kraft getreten am …)» 1.
 *
 * WARUM NICHT «jede Schluss-Klammer»: `nurErlassdatum` lässt «vom 1. Januar 2000
 * (AS 2000 1)» ausdrücklich stehen (Fundstellen-Angabe, `gesetz-leser-uebersicht-s6`),
 * und diese Regel darf sie nicht hintenherum doch schneiden. Getroffen wird nur,
 * was eine FASSUNG bezeichnet — dieselbe Aussage wie «Stand», in einer anderen
 * Sprache. `Etat` ohne Akzent steht daneben, weil derselbe Erlass je nach
 * Ausgabe-Kodierung beides liefert.
 *
 * NUR IN V3. Die Ist-Hülle rendert ihre Übersicht weiter aus dem blossen
 * `nurErlassdatum` — die eingefrorene Hülle hängt nie an der neuen (FL-4).
 */
const FASSUNGS_KLAMMER = /\s*\((?:Fassung|État|Etat|Version)\b[^)]*\)\s*$/i;

/**
 * Ä80 + P1-2 · Das Sidecar-Erlassdatum wird zur Label/Wert-Zeile: die
 * Präposition wandert ins Etikett («vom 5. Oktober 2007» → Label «Erlass vom»,
 * Wert «5. Oktober 2007»), die Fassungs-Klammer fällt weg (sie steht als
 * eigene Zeile «Stand» direkt darunter — Ä74).
 *
 * DER RÜCKFALL IST DER KERN DES FIXES (Bug-Check 18.8.2026). Ein Etikett «Erlass
 * vom» ist eine ZUSAGE an den Wert: dass dort ein Datum steht und sonst nichts.
 * Bis hierher wurde sie auch dann gegeben, wenn beide Muster danebengriffen —
 * am FR-Erlass 635.1.1 stand «Erlass vom · du 01.05.1996 (version entrée en
 * vigueur le 01.03.2024)», also die Präposition doppelt und der Stand ein
 * zweites Mal. Beginnt der Wert nach beiden Schnitten nicht mit einer Ziffer,
 * halten wir die Zusage nicht: das Etikett fällt auf das neutrale «Erlassdatum»
 * zurück (so heisst es in V1), der Wortlaut bleibt unangetastet, und
 * `tabular-nums` entfällt — eine Zahlen-Kante an einem Wort auszurichten ist der
 * Ä80-Fehler in umgekehrter Richtung.
 *
 * `null` = nach dem Schnitt bleibt nichts (27 Sidecars tragen NUR die Klammer,
 * z. B. «(Stand am 4. September 2024)»). Dann entsteht keine Zeile (§8).
 */
export function datumsAngabe(erlassdatum: string): Omit<UebersichtZeile, 'id'> | null {
  const ohneKlammer = nurErlassdatum(erlassdatum).replace(FASSUNGS_KLAMMER, '').trim();
  const wert = ohneKlammer.replace(PRAEPOSITION, '').trim();
  if (!wert) return null;
  const ziffern = /^\d/.test(wert);
  return { label: ziffern ? 'Erlass vom' : 'Erlassdatum', wert, ziffern };
}

/**
 * Erlass → Angaben der Übersichtsbox. Erlass-neutral: jede Zeile entsteht aus
 * dem Datenmodell und entfällt, wo der Erlass die Angabe nicht trägt — kein
 * `if (bund)`, keine leere Wertspalte (Fundament-Auflage 2, Auftrag David
 * 16.8.2026).
 */
export function uebersichtsAngaben(e: UebersichtsEingabe): UebersichtsAngaben {
  const { erlass, kopf } = e;
  // §8: bei GANZ aufgehobenem Erlass IST die Aufhebung die Aussage. Weder eine
  // offene Konsolidierung noch ein Fassungsvorbehalt daneben (beide wären
  // irreführend), und kein «geltende Fassung»-Link — er führte auf die
  // aufgehobene Konsolidierung. Dieselbe Grenze zieht der Erlass-Kopf (B3,
  // Bug-Check 9.8.2026) und seit dem H2b-Nachzug (B5) auch diese Box.
  const lebt = !erlass.aufgehoben;

  const zeilen: UebersichtZeile[] = [];

  // ── Art · «Bundesgesetz» / «Verordnung» / «Kanton BS · Gesetz» ────────────
  // Dieselbe Ableitung, die der Erlass-Kopf für seine Overline nutzt (§5) —
  // aber OHNE das Sachgebiet: das bekommt unten seine eigene Zeile, mit dem
  // vollen Pfad statt nur der obersten Stufe.
  const art = kopfOverline(erlass, e.erlassTyp, null);
  if (art) zeilen.push({ id: 'art', label: 'Art', wert: art });

  // ── Erlassgeber · «Der Schweizerische Bundesrat» ──────────────────────────
  // Aus der amtlichen Präambel. DIE Zeile, an der die alte Box scheiterte:
  // gemessen wurden 282 px (StPO) bzw. 284 px (BS-640.100) abgeschnittener
  // Text, erreichbar nur noch im `title` — und ein Tooltip ist keine Auskunft
  // (§8, dieselbe Regel wie S3 «KEIN title-ERSATZ»). Sie darf jetzt umbrechen.
  const organ = erlassOrgan(kopf);
  if (organ) zeilen.push({ id: 'organ', label: 'Erlassgeber', wert: organ });

  // ══ DIE DATUMS-KETTE · Erlass vom → In Kraft seit → Stand (Ä80) ═══════════
  // Vier Zeilen, EINE Chronologie, in der Folge, in der ein Erlass sie durch-
  // läuft: beschlossen → in Kraft → auf diesem Stand → (allenfalls) aufgehoben.
  //
  // Ä80 (Ästhetik-Prüfer 17.8.2026 abends) hat hier zwei Dinge gerügt, und beide
  // sind an der reinen Funktion zu heilen, nicht am Markup:
  //  (1) Der Stand stand ZWISCHEN Erlassdatum und Inkrafttreten. Fedlex ordnet
  //      «Beschluss → Inkrafttreten» und der Erlass-Kopf führt dieselbe Kette in
  //      derselben Folge — die Box war die einzige Stelle, die anders sortierte
  //      (§5). Jetzt: eine Reihenfolge, eine Quelle.
  //  (2) Die Präposition «vom» stand im WERT. Das nimmt der Wertspalte ihre
  //      Kante: «vom 5. Oktober 2007» beginnt mit einem Wort, «01.04.2025» mit
  //      einer Ziffer, und `tabular-nums` richtet nichts aus, was nicht an
  //      derselben Stelle anfängt. Fedlex hält es umgekehrt — das Label trägt
  //      die Sprache, der Wert nur das Datum. Darum «Erlass vom» als Etikett;
  //      «In Kraft seit» und «Stand» tragen ihre Präposition ohnehin schon dort.
  //      Der Wortlaut lehnt sich an Fedlex an, ohne dessen Kommentar-Text.

  // ── Erlass vom · «5. Oktober 2007» ────────────────────────────────────────
  // `datumsAngabe` schneidet die Fassungs-Klammer (Ä74 — sonst steht der Stand
  // zweimal untereinander), hebt die Präposition ins Etikett (Ä80) und gibt das
  // Etikett wieder her, wo sie ihre Zusage nicht halten kann (P1-2).
  const datum = kopf?.erlassdatum ? datumsAngabe(kopf.erlassdatum) : null;
  if (datum) zeilen.push({ id: 'datum', ...datum });

  if (erlass.inkraftSeit) {
    zeilen.push({
      id: 'inkraft', label: 'In Kraft seit',
      wert: formatiereDatum(erlass.inkraftSeit), ziffern: true,
    });
  }
  // ── Stand · «01.04.2025» ──────────────────────────────────────────────────
  // B8 (Bug-Check 9.8.2026): zwei VD-Erlasse tragen `stand: ""`. «Stand» ohne
  // Wert wäre ein leeres Versprechen — dann entfällt die Zeile (2 von 1469).
  if (erlass.stand) {
    zeilen.push({ id: 'stand', label: 'Stand', wert: formatiereDatum(erlass.stand), ziffern: true });
  }
  if (erlass.aufgehoben) {
    zeilen.push({
      id: 'aufgehoben', label: 'Aufgehoben per',
      wert: formatiereDatum(erlass.aufgehoben.seit), ziffern: true,
    });
  }

  // ── Aufbau · «3 Ebenen · Anhang» ──────────────────────────────────────────
  // Nicht die Bestimmungszahl (die steht in der Ruhezeile), sondern der Bau des
  // Erlasses — die einzige Angabe der Box, die sonst nirgends steht.
  //
  // WARUM «Aufbau» UND NICHT «Gliederung» (17.8.2026): das Etikett hiess beim
  // ersten Bau «Gliederung» — und der BESTEHENDE Ä10-Wächter wurde davon rot
  // (`leser-v3-auskunft` «das Gliederungs-Blatt sagt ‹Gliederung› genau einmal»,
  // gemessen 2×). Zu Recht: im Handy-Blatt trägt der Blatt-Kopf bereits die Zone
  // «Gliederung», und Ä10 hat genau diese Doppelnennung abgeräumt. Ein
  // Zeilen-Etikett darf einen Zonen-Namen nicht zurückholen. Das Tor hat einen
  // echten Rückfall gefangen, nicht sich selbst — der Wächter bleibt
  // unangetastet, die Bezeichnung weicht aus.
  const anhang = (e.kennzahlen?.anhangArtikel ?? 0) > 0;
  const glied = [
    e.gliederungsTiefe > 0
      ? `${e.gliederungsTiefe} ${e.gliederungsTiefe === 1 ? 'Ebene' : 'Ebenen'}`
      : null,
    anhang ? 'Anhang' : null,
  ].filter(Boolean).join(' · ');
  if (glied) zeilen.push({ id: 'aufbau', label: 'Aufbau', wert: glied, ziffern: true });

  // ── Sachgebiet · «Bau- und Planungsrecht › Hochbau» ───────────────────────
  // Bug-Check 17.8.2026 (Nachzug): das Beispiel lautete hier «2 Privatrecht ›
  // 22 Obligationenrecht» — eine Bundes-Systematik, die an DIESER Stelle nie
  // erscheint. `verifiziertesSachgebiet` liest ausschliesslich die KANTONALE
  // Systematik (`helpers.tsx`: ohne `erlass.kanton` gibt es keine `sys`, also
  // `null`); Bundeserlasse tragen ihr Gebiet über `erlassAnsicht.overlineGebiet`
  // aus `GEBIET_LABEL`. Ein Beispiel, das den falschen Zweig zeigt, ist eine
  // falsche Auskunft über den Code (§7) — darum ein kantonales.
  // B9 (Bug-Check 9.8.2026): `verifiziertesSachgebiet` filtert die neutralen
  // Platzhalter der Systematik weg («Bereich SAR») — wo wir keine Einordnung
  // haben, behaupten wir keine (§5, EINE Regel für Krume, Overline und Box).
  const gebiet = verifiziertesSachgebiet(erlass, e.kantonSys);
  const pfad = gebiet ? [gebiet.top, gebiet.sub].filter(Boolean).join(' › ') : '';
  if (pfad) zeilen.push({ id: 'gebiet', label: 'Sachgebiet', wert: pfad });

  // ── Amtliche Ziele ────────────────────────────────────────────────────────
  const links: UebersichtLink[] = [];
  let hinweiseOhneQuelle = false;
  if (erlass.quelleUrl) {
    links.push({
      id: 'quelle', zeichen: '↗',
      label: lebt ? 'geltende Fassung' : 'amtliche (aufgehobene) Fassung',
      href: erlass.quelleUrl,
    });
  }
  if (erlass.pdfUrl) {
    links.push({ id: 'pdf', zeichen: '⬇', label: 'amtliches PDF', href: erlass.pdfUrl });
  }
  // §8 (Bug-Check 17.8.2026, Nachzug): V1 sagt an dieser Stelle ausdrücklich
  // «keine amtliche Quelle hinterlegt» (`../parts/ErlassUebersicht.tsx`), V3
  // liess die Zone stumm. Schweigen liest sich wie «lädt noch», nicht wie «es
  // gibt keine» — und dass der Weg zur amtlichen Fassung FEHLT, ist bei einem
  // Rechtstext die wichtigere Auskunft von beiden. Wortgleich zu V1 (§5).
  if (links.length === 0) hinweiseOhneQuelle = true;

  // ── §8 · was die Anzeige über ihre eigenen Grenzen weiss ──────────────────
  const hinweise: string[] = [];
  if (hinweiseOhneQuelle) hinweise.push('Keine amtliche Quelle hinterlegt.');
  const beleg = teilerfassung(erlass.key);
  if (beleg) hinweise.push(`${beleg.befund} (geprüft ${formatiereDatum(beleg.geprueftAm)})`);
  const grad = erlass.kanton && e.kantonErlassAnzahl != null
    ? erfassungsgrad(erlass.kanton, e.kantonErlassAnzahl) : null;
  if (grad) {
    hinweise.push(`Kanton ${grad.kanton}: ${STUFE_WORT[grad.stufe]}, ${grad.n} Erlasse erfasst.`);
  }
  if (e.bestimmungsEtikettStatus === 'entwurf') {
    hinweise.push(`Zähl-Etikett «${e.bestimmungsWort}» noch nicht amtlich verifiziert (Entwurf).`);
  }
  if (e.kennzahlen && !e.kennzahlen.hatSidecar) {
    hinweise.push('Für diesen Erlass ist keine amtliche Gliederung erfasst — die Leiste listet die Bestimmungen.');
  }

  return {
    ruhe: ruheZeile(erlass, e.anzahl, e.bestimmungsWort),
    zeilen,
    links,
    warnung: lebt && e.nichtKonsolidiert ? nichtKonsolidiertSatz(e.nichtKonsolidiertSeit) : null,
    vorbehalt: lebt && e.currency?.naechsteFassungAb
      ? naechsteFassungSatz(e.currency.naechsteFassungAb) : null,
    hinweise,
  };
}
