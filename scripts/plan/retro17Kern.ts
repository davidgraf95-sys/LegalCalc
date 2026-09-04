// scripts/plan/retro17Kern.ts — die reine Deutung der Bau-Messreihe (Stufe 2,
// Schritt QS-SELBSTOPT, Fahrplan-§ «Selbstoptimierender Bau»).
//
// WAS DAS IST. Stufe 1 misst (`selbstopt:erheben` → messwerte/selbstopt-zeitreihe.json).
// Dieses Werkzeug DEUTET die Messreihe und schlägt Roadmap-Schritte vor. Es
// liest ausschliesslich zwei Dateien — die Zeitreihe und ROADMAP-CHRONIK.md —
// und schreibt NICHTS: kein Auto-Commit, kein Auto-PR, keine Datei. Die Ausgabe
// geht auf stdout und ist als ENTWURF markiert.
//
// WARUM ES NICHTS ENTSCHEIDET. Der Fahrplan setzt die Reihenfolge ausdrücklich:
// «Hebung zu einem geplanten Agenten erst nach Bewährung und mit David-Entscheid
// — §17-Fünf-Schritte: Automatisieren zuletzt.» Ein Werkzeug, das aus einer
// Messreihe selbsttätig den Plan ändert, hätte genau die Rückkopplung, vor der
// Stufe 1 sich hütet: der Bau optimierte dann die Zahl statt die Sache. Deshalb
// ist die Ausgabe ein VORSCHLAG in Menschensprache, und die übernehmende Session
// trägt die Verantwortung für jede Zeile, die sie daraus übernimmt.
//
// DETERMINISTISCH (§2). Kein Modell, kein Netz, keine Wanduhr in der Deutung:
// gleiche Zeitreihe + gleiche Chronik ⇒ gleiche Ausgabe. Alle Schwellen stehen
// als benannte Konstanten unten; sie sind gesetzt, nicht hergeleitet, und die
// Ausgabe nennt sie mit, damit niemand eine Empfehlung für eine Messung hält.
//
// WARUM GETRENNT VON `retro-17.ts` (7.8.2026). Die CLI dort läuft beim IMPORT —
// sie steht hinter `if (!process.env.VITEST)` auf Modulebene, nicht in einer
// Funktion. Seit `plan:next` die Vorschlagslage zeigt, importiert der
// Pflicht-Einstieg diese Funktionen; läge die CLI in derselben Datei, druckte
// jedes `npm run plan:next` den vollen retro:17-Bericht mitten in seine
// Lage-Ausgabe. Rein von unrein zu trennen ist hier also keine Stilfrage,
// sondern die Bedingung dafür, dass der Kern überhaupt wiederverwendbar ist —
// dasselbe Muster wie `selbstoptKern.ts` gegenüber `selbstopt-erheben.ts`.
import { ZEITREIHE_DATEI, quoteText, type Snapshot, type Zeitreihe } from './selbstoptKern';

/** Chronik-Datei — zweite und letzte Quelle (Fahrplan: «liest NUR Zeitreihe + Chronik»). */
export const CHRONIK_DATEI = 'ROADMAP-CHRONIK.md';

// ─────────────────────────────── Schwellen ───────────────────────────────
//
// Alle Werte sind GESETZT, nicht aus den Daten gelernt — sonst verschöbe sich
// die Schwelle mit dem Zustand, den sie beurteilen soll, und nichts wäre je
// auffällig. Sie stehen hier beieinander, damit eine spätere Kalibrierung EINE
// Stelle hat (§5), und die Ausgabe nennt sie bei jedem Befund mit.

/** Unter so vielen Snapshots ist keine Aussage über Verlauf belegbar. */
export const MIN_SNAPSHOTS = 5;
/** Rot-Häufung: ab dieser Quote UND dieser absoluten Zahl roter Läufe. */
export const ROT_QUOTE = 0.1;
export const ROT_MINDEST = 3;
/** Streich-PRÜFkandidat: nie rot, aber mindestens so oft gelaufen. */
export const NIE_ROT_MINDEST_LAEUFE = 30;
/** CI-Quoten, ab denen der Bau-Weg selbst zum Thema wird. */
export const CI_FAILURE_SCHWELLE = 0.2;
export const CI_RERUN_SCHWELLE = 0.15;

// ── Fremdagenten (QS-FREMDAGENTEN, 4.9.2026) — Schwellen aus Fahrplan §2/§3 ──

/** Unter so vielen Jules-PRs (gemerged+geschlossen, 7 Tage) ist die Quote nicht belastbar. */
export const JULES_QUOTE_MIN_N = 3;
/** Fahrplan §3 «Phase 1 Jules … < 2 von 3 ⇒ zurück auf Doku-only». */
export const JULES_RUECKBAU_QUOTE = 2 / 3;
/** Fahrplan §2 Phase 4: Skalierungs-Kandidat ab dieser Quote UND dieser Median-Dauer. */
export const JULES_SKALIEREN_QUOTE = 5 / 6;
export const JULES_SKALIEREN_MEDIAN_MAX_MIN = 45;
/** Fahrplan §3 «Phase 3 Zweitblick … n = 5». */
export const ZWEITBLICK_DURCHGAENGE_SCHWELLE = 5;

/** Die Marke, an der jede maschinell erzeugte Vorschlagszeile erkennbar ist. */
export const ENTWURF_MARKE = '<!-- ENTWURF retro:17 — Übernahme nur durch Session-/David-Entscheid -->';

// ─────────────────────────────── Befunde ───────────────────────────────

export interface Befund {
  /** Kurzschlüssel der Regel — stabil, damit Befunde vergleichbar bleiben. */
  art:
    | 'rot-haeufung'
    | 'nie-rot'
    | 'ci-failure'
    | 'ci-rerun'
    | 'f-klasse'
    | 'jules-rueckbau'
    | 'jules-skalieren'
    | 'jules-lehre'
    | 'gemini-rueckbau'
    | 'zweitblick-schwelle'
    | 'kontingent-beleg'
    | 'jules-alarm';
  /** Vorgeschlagener Schritt-Titel (fett im ROADMAP-Bullet). */
  titel: string;
  /** Der belegende Satz: Zahlen, Schwelle, Quelle. */
  anlass: string;
  /** Was zu tun wäre — inklusive der Vorsicht, die dazugehört. */
  hinweis: string;
}

/**
 * Deutet die Zeitreihe. Reine Funktion über Zeitreihe + Chronik-Text.
 *
 * Reihenfolge der Befunde ist die Reihenfolge der Regeln, innerhalb einer Regel
 * alphabetisch nach Tor-Name — nicht nach Schwere. Eine Sortierung nach Schwere
 * wäre eine Gewichtung, und Gewichten ist Deuten: das bleibt beim Menschen.
 */
export function befunde(z: Zeitreihe, chronik: string): Befund[] {
  const out: Befund[] = [];
  const snaps = z.snapshots;
  if (snaps.length === 0) return out;
  const letzter = snaps[snaps.length - 1];
  const kum = letzter.torRot.kumuliert;

  // (1) Rot-Häufung je Tor — wo Zeit verloren geht.
  for (const tor of Object.keys(kum.je).sort()) {
    const z2 = kum.je[tor];
    if (z2.gesamt === 0) continue;
    const quote = z2.rot / z2.gesamt;
    if (z2.rot < ROT_MINDEST || quote < ROT_QUOTE) continue;
    out.push({
      art: 'rot-haeufung',
      titel: `\`${tor}\` stabilisieren — häufigstes Rot der Messreihe`,
      anlass:
        `${z2.rot} von ${z2.gesamt} Läufen rot (${quoteText(quote)}); Schwelle ${quoteText(ROT_QUOTE)} ` +
        `und mindestens ${ROT_MINDEST} rote Läufe${chronikZusatz(chronik, tor)}`,
      hinweis:
        'Erst die Ursachen der roten Läufe auszählen (echter Fund vs. Umgebung vs. Flake), ' +
        'dann entscheiden — ein oft rotes Tor kann das wertvollste sein.',
    });
  }

  // (2) Nie rot — Streich-PRÜFkandidat, ausdrücklich kein Streich-Auftrag.
  //
  // Der Chesterton-Vorbehalt steht bewusst IM Vorschlag und nicht in einer
  // Fussnote: «seit Geburt nie rot» ist genauso gut ein Beleg dafür, dass das
  // Tor wirkt (niemand baut mehr den Fehler, den es fängt), wie dafür, dass es
  // nichts fängt. Die Messreihe kann diese beiden Fälle NICHT unterscheiden.
  //
  // EINE Sammelzeile statt eines Blocks je Tor (Steuerungs-Diät 29.8.2026):
  // gemessen erzeugte die Regel ~30 wortgleiche Blöcke, die sich einzig im
  // Tor-Namen und in zwei Zahlen unterschieden — vier Bildschirmseiten
  // Vorschlagstext, in denen die anderen Regeln untergingen. Der Hinweis ist
  // für alle Kandidaten identisch (es IST derselbe Chesterton-Vorbehalt), also
  // steht er einmal da; die Namen und ihre Läufe stehen im Anlass.
  if (snaps.length >= MIN_SNAPSHOTS) {
    const kandidaten = Object.keys(kum.je)
      .sort()
      .filter((tor) => kum.je[tor].rot === 0 && kum.je[tor].gesamt >= NIE_ROT_MINDEST_LAEUFE);
    if (kandidaten.length) {
      out.push({
        art: 'nie-rot',
        titel:
          kandidaten.length === 1
            ? `\`${kandidaten[0]}\` auf Wirksamkeit prüfen — nie rot über die ganze Messreihe`
            : `${kandidaten.length} Tore auf Wirksamkeit prüfen — nie rot über die ganze Messreihe`,
        anlass:
          `über ${snaps.length} Snapshots je 0 rot; Schwelle ${NIE_ROT_MINDEST_LAEUFE} Läufe. ` +
          kandidaten.map((tor) => `${tor} (${kum.je[tor].gesamt} Läufe${chronikZusatz(chronik, tor)})`).join(' · '),
        hinweis:
          'PRÜFkandidaten, kein Streich-Auftrag (Chesterton): «nie rot» belegt genauso gut, dass das Tor ' +
          'wirkt — der Fehler wird nicht mehr gebaut, WEIL es da ist. Vor jeder Streichung die ' +
          'Sabotage-Probe: Defekt einpflanzen, prüfen ob es rot wird, byte-gleich zurückbauen. ' +
          'Wird es rot, ist es wirksam und bleibt. Je Tor einzeln entscheiden, nie als Paket.',
      });
    }
  }

  // (3) CI-Quoten — der Bau-Weg selbst.
  if (letzter.ci) {
    if (letzter.ci.failureRate >= CI_FAILURE_SCHWELLE) {
      out.push({
        art: 'ci-failure',
        titel: 'CI-Ausfallquote senken — Ursachen der roten Läufe auszählen',
        anlass:
          `Failure-Rate ${quoteText(letzter.ci.failureRate)} über ${letzter.ci.verdikte} Läufe MIT Verdikt ` +
          `(von ${letzter.ci.laeufe} abgeschlossenen; Schwelle ${quoteText(CI_FAILURE_SCHWELLE)}); ` +
          `Aufschlüsselung: ${aufschluesselung(letzter)}`,
        hinweis:
          'Abgebrochene Läufe (`cancelled`/`skipped`) sind hier weder Zähler noch Nenner — sie hatten nie ' +
          'Gelegenheit zu prüfen. `timed_out` und Konsorten zählen als Ausfall. ' +
          'Vor jeder Zuschreibung an ein Feature: Nullprobe und Streuung (Dispatch-§0 Ziff. 3).',
      });
    }
    if (letzter.ci.rerunRate >= CI_RERUN_SCHWELLE) {
      out.push({
        art: 'ci-rerun',
        titel: 'Wiederholungsläufe eindämmen — Flake-Quellen benennen',
        anlass:
          `Rerun-Rate ${quoteText(letzter.ci.rerunRate)} über ${letzter.ci.laeufe} Läufe ` +
          `(Schwelle ${quoteText(CI_RERUN_SCHWELLE)})`,
        hinweis:
          'Wiederholungen sind Wanduhr ohne Erkenntnisgewinn. Erst die wiederholten Jobs benennen, ' +
          'dann ihre Instabilität beheben — nie die Wiederholung selbst abschalten.',
      });
    }
  }

  // (4) F-Klassen: ein NEUER datierter Vorfall zwischen erstem und letztem
  //     Snapshot. Gezählt wird nur die Spalte «Was passierte» (s. `parseFKlassen`)
  //     — ein nachgetragenes FIX-Datum darf hier nichts auslösen, sonst
  //     antwortete der Bau auf eine Reparatur mit einer Eskalation.
  //
  //     `?? {}`: die Schema-Prüfung verlangt `fKlassen` inzwischen, aber diese
  //     Funktion wird auch über Fremd-Dateien (`--datei`) gefahren. Ein
  //     Absturz an dieser Stelle wäre der teuerste denkbare Ausgang eines
  //     Werkzeugs, das nur berichten soll.
  const erster = snaps[0];
  const jetztAlle = letzter.fKlassen ?? {};
  const vorherAlle = erster.fKlassen ?? {};
  for (const k of Object.keys(jetztAlle).sort()) {
    const jetzt = jetztAlle[k];
    const vorher = vorherAlle[k] ?? 0;
    if (jetzt <= vorher) continue;
    out.push({
      art: 'f-klasse',
      titel: `Fehlerklasse ${k} eskalieren — Gegenmittel greift nicht`,
      anlass:
        `datierte Vorfälle ${vorher} → ${jetzt} zwischen dem ersten (${erster.erhobenAm.slice(0, 10)}) ` +
        `und dem letzten Snapshot (${letzter.erhobenAm.slice(0, 10)}); Quelle: Spalte «Was passierte» ` +
        `des Registers im Skill \`lehren\` — Reparaturdaten zählen dort nicht mit`,
      hinweis:
        'Regel 5 des Skills `lehren`: zweimal trotz Gegenmittel ⇒ Form eskalieren (Prosa → Dispatch → Tor). ' +
        'Keine neue Regel danebenlegen, das bestehende Gegenmittel verschärfen.',
    });
  }

  // (5) Fremdagenten — Jules und Gemini, aus dem letzten Snapshot (Stufe 1,
  //     QS-FREMDAGENTEN). `letzter.fremdagenten` ist bei alten Snapshots
  //     (Schema < 3, migriert) und bei Ausfall der jeweiligen Quelle `null` —
  //     jede Teilregel schweigt dann, statt mit erfundenen Zahlen zu deuten.
  const jules = letzter.fremdagenten?.jules ?? null;
  if (jules) {
    // (a)+(b) Quote ohne Nacharbeit — Proxy gemerged/(gemerged+geschlossen),
    //     weil die Fahrplan-Spalte «Nacharbeit» nicht automatisch erfasst ist
    //     (s. `JulesMessung`-Docstring in `fremdagenten-messung.ts`).
    const n = jules.prs_gemerged_7d + jules.prs_geschlossen_7d;
    if (n >= JULES_QUOTE_MIN_N) {
      const quote = jules.prs_gemerged_7d / n;
      if (quote < JULES_RUECKBAU_QUOTE) {
        out.push({
          art: 'jules-rueckbau',
          titel: 'Rückbau: Jules nur Doku/Mechanik',
          anlass:
            `Quote ohne Nacharbeit (gemerged/(gemerged+geschlossen)) ${quoteText(quote)} über n=${n} PRs der ` +
            `letzten 7 Tage (${jules.prs_gemerged_7d} gemerged, ${jules.prs_geschlossen_7d} geschlossen); ` +
            `Schwelle ${quoteText(JULES_RUECKBAU_QUOTE)} (Fahrplan §3 «Phase 1 Jules … < 2 von 3»)`,
          hinweis:
            'Fahrplan §3 Rückbau-Regel: der betroffene Teil wird zurückgebaut, nicht bewacht. Flächen: ' +
            '`auftrag`-Weiche, `AGENTS.md`, ci.yml-Step, `landung`-Absatz, Ticket-Vorlage, Label.',
        });
      } else if (
        quote >= JULES_SKALIEREN_QUOTE &&
        jules.median_dauer_min !== null &&
        jules.median_dauer_min <= JULES_SKALIEREN_MEDIAN_MAX_MIN
      ) {
        out.push({
          art: 'jules-skalieren',
          titel: 'Ticketzahl auf 3–5 anheben (Phase 4)',
          anlass:
            `Quote ${quoteText(quote)} über n=${n} PRs · Median-Dauer ${jules.median_dauer_min} min; ` +
            `Schwellen ${quoteText(JULES_SKALIEREN_QUOTE)} und ≤ ${JULES_SKALIEREN_MEDIAN_MAX_MIN} min (Fahrplan §2 Phase 4)`,
          hinweis:
            'Erst die Fahrplan-Spalte «Nacharbeit» gegenlesen (hier nicht automatisch erfasst) — erst dann ' +
            'seriell auf 3–5 Tickets pro Session anheben (Stückzahl entsperrt 4.9.2026, Messung bleibt Pflicht).',
        });
      }
    }

    // (c) Jeder geschlossene Jules-PR der letzten 7 Tage ⇒ Lehre verankern.
    if (jules.prs_geschlossen_7d > 0) {
      out.push({
        art: 'jules-lehre',
        titel: 'Lehre verankern: Tor-Regel oder Vorlagen-Zeile (Beleg #662 → Kommentar-Bilanz)',
        anlass: `${jules.prs_geschlossen_7d} geschlossene(r) Jules-PR(s) in den letzten 7 Tagen (Quelle: Jules-Messung)`,
        hinweis:
          'Formregel Skill `lehren`, Ergänzung Fremdagenten: die Ablehnung noch in DERSELBEN Session als ' +
          'Tor-Regel (Fremd-PR-Tor/Erstfilter) oder Vorlagen-Zeile verankern — nie nur als Kommentar.',
      });
    }
  }

  const gemini = letzter.fremdagenten?.gemini ?? null;
  if (gemini) {
    // (d) Diskrepanz-Finder: mehr Schein- als echte Funde ⇒ Rückbau prüfen.
    if (gemini.diskrepanz_schein > gemini.diskrepanz_echt) {
      out.push({
        art: 'gemini-rueckbau',
        titel: 'Rückbau Diskrepanz-Finder prüfen',
        anlass:
          `Phase-2-Register: Schein ${gemini.diskrepanz_schein} > echt ${gemini.diskrepanz_echt} über ` +
          `${gemini.diskrepanz_laeufe} Erlass-Läufe (Fahrplan §3 «Schein > echt ⇒ Rückbau»)`,
        hinweis:
          'Flächen bei Rückbau: `scripts/analyse/gemini-diskrepanz*.ts`, `korpus-werkstatt`-Absatz, ' +
          '`gegenpruefung`-Station.',
      });
    }

    // (e) Phase-3-Zweitblick-Durchgänge erreichen die Zähl-Schwelle.
    if (gemini.zweitblick_durchgaenge >= ZWEITBLICK_DURCHGAENGE_SCHWELLE) {
      out.push({
        art: 'zweitblick-schwelle',
        titel: 'Schwelle §3 anwenden, Verdikt eintragen',
        anlass:
          `${gemini.zweitblick_durchgaenge} Zweitblick-Durchgänge im §5-Register erreicht ` +
          `(Schwelle n=${ZWEITBLICK_DURCHGAENGE_SCHWELLE}, Fahrplan §3 «Phase 3 … mehr Schein als echt ⇒ Weg zu»)`,
        hinweis:
          'Echt gegen Schein über die Durchgänge auszählen und das Verdikt in Fahrplan §3 eintragen — ' +
          'dieses Werkzeug zählt nur die Durchgänge, nicht das Verdikt.',
      });
    }

    // (f) Jedes protokollierte Kontingent-Ereignis ⇒ Fahrplan-Zahlen abgleichen.
    if (gemini.kontingent_ereignisse >= 1) {
      out.push({
        art: 'kontingent-beleg',
        titel: 'Limiten im Fahrplan belegen/korrigieren',
        anlass:
          `${gemini.kontingent_ereignisse} Kontingent-Ereignis(se) im §5-Register (Fahrplan §5: Zahlen ` +
          `100/Tag · 15 parallel für Jules bislang unbelegt)`,
        hinweis:
          'Das erste real beobachtete Ereignis belegt die Fahrplan-Zahlen oder korrigiert sie — Eintrag ' +
          'gegen die Tabelle prüfen, Text bei Bedarf anpassen (Fahrplan §4 «Limite erkennen»).',
      });
    }
  }

  // (g) Alarm «Issue ohne Annahme» — eigenständig von der Quote, da er einen
  //     akuten Betriebszustand meldet, keinen Verlauf.
  if (jules?.alarm) {
    out.push({
      art: 'jules-alarm',
      titel: 'Jules-Verbindung prüfen — Issue seit über 10 min ohne Annahme',
      anlass:
        `Alarm aus der letzten Kontingent-/Ticket-Messung (tickets_24h=${jules.tickets_24h}); Signal ` +
        `«kein "Jules is on it" binnen 10 min» (Fahrplan §4 «Limite erkennen»)`,
      hinweis:
        'Erst `npm run fremdagenten:messung -- --kontingent` laufen lassen: Tages-/Parallel-Stopp, ' +
        'App-Problem oder eine hängende Session unterscheiden. Bis geklärt: keine neuen Jules-Tickets ' +
        '(Skill `auftrag` Ziff. 6 «Grüne Spur → Jules»).',
    });
  }

  return out;
}

/**
 * Ergänzt einen Befund um den Chronik-Kontext: Wurde zu diesem Tor schon einmal
 * etwas gebaut? Wortgrenzen-Treffer, nie blosse Substring-Präsenz — «check:plan»
 * darf nicht durch «check:plane…» belegt gelten (Dispatch-§0 Ziff. 2).
 */
export function chronikTreffer(chronik: string, tor: string): number {
  const escaped = tor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(?<![\\w:-])${escaped}(?![\\w:-])`, 'g');
  return [...chronik.matchAll(re)].length;
}

function chronikZusatz(chronik: string, tor: string): string {
  const n = chronikTreffer(chronik, tor);
  return n === 0
    ? '; in der Chronik bisher nicht als Bau-Gegenstand belegt'
    : `; die Chronik nennt ${tor} ${n}×`;
}

function aufschluesselung(s: Snapshot): string {
  if (!s.ci) return '—';
  const e = Object.entries(s.ci.je);
  return e.length ? e.map(([k, v]) => `${k} ${v}`).join(', ') : '—';
}

// ───────────────────────────────── Ausgabe ─────────────────────────────────

/**
 * Formatiert den Vorschlagsblock. Jede Vorschlagszeile trägt die ENTWURF-Marke;
 * ein `@meta`-Etikett wird bewusst NICHT erzeugt.
 *
 * Grund für das fehlende `@meta`: Eine erfundene ID kollidierte womöglich mit
 * einer echten (check:plan Regel 1, «id mehrfach etikettiert») oder trüge kein
 * `feld:` und machte Regel 14 rot, sobald jemand den Block einfügt.
 * Das Etikett vergibt die übernehmende Session bewusst, nicht dieses Werkzeug.
 * Der Block sagt das in seinem Kopf, damit niemand es durch Ausprobieren lernt.
 */
export function bericht(z: Zeitreihe, chronik: string): string[] {
  const z2: string[] = [];
  const n = z.snapshots.length;
  const letzter = n ? z.snapshots[n - 1] : null;

  z2.push('═══════════════════════════════════════════════════════════════════════');
  z2.push('retro:17 — ENTWURF eines ROADMAP-Vorschlagsblocks (Stufe 2, QS-SELBSTOPT)');
  z2.push('═══════════════════════════════════════════════════════════════════════');
  z2.push('');
  z2.push(`Quellen: ${ZEITREIHE_DATEI} (${n} Snapshot${n === 1 ? '' : 's'}) · ${CHRONIK_DATEI}`);
  if (letzter) z2.push(`Letzte Erhebung: ${letzter.erhobenAm.slice(0, 10)}`);
  z2.push('');
  z2.push('Dieses Werkzeug SCHLÄGT VOR und entscheidet nichts. Es schreibt keine Datei,');
  z2.push('committet nicht und öffnet keinen PR. Wer eine Zeile übernimmt, vergibt selbst');
  z2.push('ID und `@meta` (eine erfundene ID kollidiert womöglich mit einer echten und macht check:plan');
  z2.push('rot) und verantwortet den Vorschlag als eigenen Entscheid.');
  z2.push('');

  if (n === 0) {
    z2.push('KEINE DATENLAGE — die Zeitreihe ist leer.');
    z2.push(`Erst \`npm run selbstopt:erheben\` laufen lassen (mindestens ${MIN_SNAPSHOTS}× über mehrere Bau-Tage).`);
    return z2;
  }

  const gefunden = befunde(z, chronik);
  const duenn = n < MIN_SNAPSHOTS;

  if (duenn) {
    z2.push(`⚠️  DATENLAGE DÜNN — ${n} Snapshot${n === 1 ? '' : 's'}, nötig sind ${MIN_SNAPSHOTS}.`);
    z2.push('   Keine Streich-Empfehlung belegbar: «seit jeher grün» und «zweimal zufällig grün»');
    z2.push('   sehen bei dieser Zahl von Messpunkten gleich aus. Die Regel «nie rot» ist deshalb');
    z2.push('   ausgesetzt; die übrigen Befunde stehen unter demselben Vorbehalt.');
    z2.push('');
  }

  if (gefunden.length === 0) {
    z2.push('Keine Auffälligkeit über den gesetzten Schwellen — kein Vorschlag.');
    z2.push('');
    z2.push(schwellenZeile());
    return z2;
  }

  z2.push(`${gefunden.length} Vorschlag${gefunden.length === 1 ? '' : 'sblöcke'} — zum Prüfen, nicht zum Übernehmen:`);
  z2.push('');
  for (const b of gefunden) {
    z2.push(`- [ ] **${b.titel}** *(Anlass: ${b.anlass})* — ${b.hinweis}`);
    z2.push(`  ${ENTWURF_MARKE}`);
    z2.push('');
  }
  z2.push(schwellenZeile());
  return z2;
}

function schwellenZeile(): string {
  return (
    `Gesetzte Schwellen (keine Messwerte): Rot-Häufung ab ${quoteText(ROT_QUOTE)} und ${ROT_MINDEST} roten Läufen · ` +
    `«nie rot» ab ${NIE_ROT_MINDEST_LAEUFE} Läufen und ${MIN_SNAPSHOTS} Snapshots · ` +
    `CI-Failure ab ${quoteText(CI_FAILURE_SCHWELLE)} · CI-Rerun ab ${quoteText(CI_RERUN_SCHWELLE)}.`
  );
}
