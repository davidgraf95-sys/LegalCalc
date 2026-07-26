import { describe, it, expect } from 'vitest';
import {
  klassifiziere, klassifiziereFussnote, strippeFnText, KURZ, type Klasse,
} from '../../scripts/normtext/fussnoten-klassifikation';

// W2·5i-HIST-ANSICHT / H1 — Klassifikator-Tor.
//
// Die sicherheitskritische Richtung ist EINSEITIG: nur 'A' (AENDERUNG) ist in der
// Ansicht «Änderungshistorie: aus» ausblendbar. Ein Substanz-Text, der 'A' bekommt,
// verliert amtliche Information (§1/§15) — die Gegenrichtung kostet nur Komfort.
// Darum prüfen die Tests vor allem: WAS DARF NIE 'A' WERDEN.
//
// Belegquelle der Fälle: bibliothek/normen/hist-ansicht-h0-trennbarkeit.md
// (korpusweite Messung 25.7.2026 + Hand-Labelung n=300 + Vollscan aller 25'367
// AENDERUNG-Fälle). Die Auflage-2-Fälle sind die dort namentlich benannten
// Einzelbefunde, wörtlich aus den Sidecars entnommen.

describe('Grundklassen (Regel-Kern, aus der H0-Messung gehoben)', () => {
  const faelle: Array<[Klasse, string]> = [
    // AENDERUNG — reine Revisionsprosa (die EINZIGE ausblendbare Klasse).
    ['AENDERUNG', 'Fassung gemäss Ziff. I des BG vom 16. Dez. 2005, in Kraft seit 1. Jan. 2008 (AS 2007 4791).'],
    ['AENDERUNG', 'Eingefügt durch Ziff. I des BG vom 19. Juni 2020, in Kraft seit 1. Jan. 2023 (AS 2020 4005).'],
    ['AENDERUNG', 'Aufgehoben durch Anhang Ziff. 2 des BG vom 18. Juni 2010, mit Wirkung seit 1. Jan. 2011 (AS 2010 4525).'],
    ['AENDERUNG', 'Ursprünglich Art. 42.'],
    ['AENDERUNG', 'Die Paarform gilt sinngemäss.'],
    ['AENDERUNG', 'Die Berichtigung vom 4. Mai 2021 betrifft nur den französischen Text.'],
    // VERWEIS — echter Verweis/Substanz.
    ['VERWEIS', 'SR 311.0'],
    ['VERWEIS', 'Art. 5 des Bundesgesetzes über den Datenschutz.'],
    ['VERWEIS', 'SG 154.100'],
    ['VERWEIS', 'Verordnung (EU) 2016/679 des Europäischen Parlaments.'],
    // GRAUZONE — Revisionsvermerk MIT Leser-Redirect.
    ['GRAUZONE', 'Heute: Bundesamt für Justiz.'],
    ['GRAUZONE', 'Fassung gemäss Ziff. I des BG vom 1. Jan. 2000; siehe auch die SchlB zu diesem Titel.'],
    ['GRAUZONE', 'Dieses Gesetz ist aufgehoben. Massgebend ist jetzt das Reglement (SG 123.400).'],
    // ZITAT — reine Publikationsnachweise.
    ['ZITAT', 'BBl 2019 1234'],
    ['ZITAT', '[AS 1971 777]'],
    // UNKLAR — keine Regel greift ⇒ konservativ sichtbar.
    ['UNKLAR', 'Der Ausdruck bezeichnet die zuständige Stelle.'],
  ];
  for (const [erwartet, text] of faelle) {
    it(`${erwartet}: «${text.slice(0, 56)}…»`, () => {
      expect(klassifiziere(text)).toBe(erwartet);
    });
  }
});

describe('H0-Auflage 2 — die belegten Substanz-Fehlgriffe sind aus AENDERUNG heraus', () => {
  // Beide Texte stammen WÖRTLICH aus den Sidecars und wurden von der Vor-Auflage-
  // Regel als AENDERUNG eingeordnet (Vollscan-Befund, H0-Bericht Ziff. 3).
  // WÖRTLICH aus public/normtext/struktur/kanton/BS-780.100.json (Artikel 29, fn 3).
  const VORBEHALT = '§ 29 Abs. 1: Der BR hat diese Bestimmung am 12. 9. 1991 unter dem Vorbehalt '
    + 'genehmigt, dass der Passus «Bedürfnis in der Region» so ausgelegt wird, dass ein solches '
    + 'Bedürfnis auch dann besteht, wenn die zu bewilligende Abfallanlage einem überregionalen oder '
    + 'gesamtschweizerischen Bedürfnis entspricht und der vorgesehene Standort geeignet ist '
    + '(KtBl 1991 II 366).';
  const EINGESEHEN = 'Diese Vereinbarung, welcher der Regierungsrat am 21. 2. 1989 zugestimmt hat, '
    + 'wird hier nicht abgedruckt. Sie kann bei der Direktion der BVB eingesehen werden.';
  const NICHT_ABGEDRUCKT = 'Die Änderungen werden hier nicht abgedruckt.';

  it('«unter dem Vorbehalt» (BS-780.100 § 29, Auslegungs-Vorbehalt) → VERWEIS, nie AENDERUNG', () => {
    expect(klassifiziere(VORBEHALT)).toBe('VERWEIS');
    expect(klassifiziereFussnote(VORBEHALT)).not.toBe('A');
  });
  it('«eingesehen werden» (BS-953.900 § 93, Bezugsquelle) → VERWEIS, nie AENDERUNG', () => {
    expect(klassifiziere(EINGESEHEN)).toBe('VERWEIS');
    expect(klassifiziereFussnote(EINGESEHEN)).not.toBe('A');
  });
  it('BS-Familie «… werden hier nicht abgedruckt» → GRAUZONE, nie AENDERUNG', () => {
    expect(klassifiziere(NICHT_ABGEDRUCKT)).toBe('GRAUZONE');
    expect(klassifiziereFussnote(NICHT_ABGEDRUCKT)).not.toBe('A');
  });
  it('die Auflage-2-Riegel stehen VOR der Revisionsprosa-Regel (Reihenfolge ist load-bearing)', () => {
    // «Die Änderungen …» triggert REV_START. Ohne Vorrang landete der Satz in 'A'.
    expect(/^Die Änderungen/.test(NICHT_ABGEDRUCKT)).toBe(true);
    expect(klassifiziere(NICHT_ABGEDRUCKT)).not.toBe('AENDERUNG');
    // Ebenso BS-780.100 § 29: «… genehmigt» trifft die REV_START-Alternative
    // `.{0,80}\b(angenommen|genehmigt|zugestimmt)` — genau deshalb war der Fall im
    // H0-Vollscan als AENDERUNG (= ausblendbar) eingeordnet.
    expect(/^.{0,80}\bgenehmigt\b/.test(VORBEHALT)).toBe(true);
    expect(klassifiziere(VORBEHALT)).not.toBe('AENDERUNG');
  });
  it('ABGRENZUNG: «unter Vorbehalt des unbenützten Ablaufs der Referendumsfrist» bleibt Historie', () => {
    // AR-822.41 § 28 — reine Inkraftsetzungs-Prosa. Die Auflage-2-Regel ist bewusst
    // auf die LANGE Form «unter dem Vorbehalt» verengt und darf hier NICHT greifen;
    // sonst wanderte massenhaft Revisionsprosa in die nicht-ausblendbaren Klassen
    // und der Umschalter verlöre seinen Nutzen (§8-Ehrlichkeit der Klasse).
    const t = '1. Januar 2009 unter Vorbehalt des unbenützten Ablaufs der Referendumsfrist '
      + '(RRB vom 16. Dezember 2008, Abl. 2008, S. 1288).';
    expect(klassifiziere(t)).not.toBe('VERWEIS');
  });
});

describe('Sicherheitsrichtung — Substanz-Signale dürfen nie AENDERUNG ergeben', () => {
  // Die Signalliste des korpusweiten Risiko-Scans (H0 Ziff. 3): trägt eine Fussnote
  // eine Bezugsquelle/URL oder einen materiellen Vorbehalt, ist sie nie ausblendbar.
  const nieA = [
    'Die Vereinbarung kann kostenlos eingesehen werden unter www.santesuisse.ch.',
    'Das Dokument kann auf der folgenden Adresse eingesehen werden: www.bag.admin.ch/ref .',
    'Dieser Anhang wird hier nicht abgedruckt. Er kann beim Baudepartement eingesehen werden.',
    'Der Text kann beim Bundesamt bezogen werden.',
    'Der Tarif ist abrufbar unter www.example.admin.ch.',
  ];
  for (const t of nieA) {
    it(`nie 'A': «${t.slice(0, 52)}…»`, () => {
      expect(klassifiziereFussnote(t)).not.toBe('A');
    });
  }
});

describe('Eingabe-Normalisierung', () => {
  it('strippt <b>/<i> und normalisiert Whitespace (identisch zur H0-Messung)', () => {
    expect(strippeFnText('  Fassung gemäss <b>AS\n 2007</b>  4791. ')).toBe('Fassung gemäss AS 2007 4791.');
  });
  it('klassifiziereFussnote arbeitet auf dem ROHEN Sidecar-Text (mit Tags)', () => {
    expect(klassifiziereFussnote('Fassung gemäss Ziff. I, in Kraft seit 1. Jan. 2008 (<b>AS 2007 4791</b>).')).toBe('A');
  });
  it('leerer Text ⇒ U (nichts zu klassifizieren ⇒ sichtbar, konservativ)', () => {
    expect(klassifiziereFussnote('')).toBe('U');
    expect(klassifiziereFussnote('<b></b>  ')).toBe('U');
  });
  it('Kurz-Kodierung ist total und eindeutig', () => {
    expect(Object.values(KURZ).sort()).toEqual(['A', 'G', 'U', 'V', 'Z']);
  });
});

describe('§6.7 — das Tor kann scheitern (Sabotage-Probe)', () => {
  // Ein Tor, das nicht rot werden kann, ist gefährlicher als keines. Diese Probe
  // zeigt EINMAL rot, was der Klassifikator NICHT tut: er vergibt 'A' nicht
  // pauschal, und er vergibt 'A' nicht an Verweis-Text.
  it('würde eine «alles ist A»-Sabotage auffallen lassen', () => {
    const sabotage = (_t: string): 'A' => 'A';
    // Der echte Klassifikator ordnet diesen Verweis NICHT als ausblendbar ein …
    expect(klassifiziereFussnote('SR 311.0')).toBe('V');
    // … eine pauschale 'A'-Implementierung täte es — und fiele hier auf.
    expect(sabotage('SR 311.0')).toBe('A');
    expect(klassifiziereFussnote('SR 311.0')).not.toBe(sabotage('SR 311.0'));
  });
  it('würde eine «nie A»-Sabotage auffallen lassen (der Umschalter wäre wirkungslos)', () => {
    // Gegenrichtung: ein Klassifikator, der nie 'A' vergibt, ist konservativ, aber
    // nutzlos — die Ansicht «aus» blendete nichts aus. Das muss ebenfalls rot werden.
    expect(klassifiziereFussnote('Fassung gemäss Ziff. I des BG vom 16. Dez. 2005 (AS 2007 4791).')).toBe('A');
  });
});
