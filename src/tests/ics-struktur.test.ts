// ─── Maschinelle ICS-Validierung (W2·10-UI-NAV-Z1) ─────────────────────────
//
// `src/tests/fristenspiegel.test.ts` hält die Beschriftung als Byte-Anker fest
// («welcher Text steht drin»). Was dort fehlte, ist die Prüfung der FORM: dass
// die Ausgabe ein wohlgeformter RFC-5545-Kalender ist und — der eigentlich
// haftungsrelevante Punkt — dass sie DETERMINISTISCH bleibt (§2). Ein
// `Date.now()` im DTSTAMP wäre in keinem Beschriftungs-Anker aufgefallen,
// hätte aber jeden Golden-Vergleich und jeden Re-Import zerstört.
//
// Zeitzone: Fristen sind Ganztages-Ereignisse und werden nach RFC 5545 §3.6.1
// als `DTSTART;VALUE=DATE` geschrieben — ein DATE trägt definitionsgemäss KEINE
// Zeitzone (RFC 5545 §3.3.4) und ist damit über alle Kalender-Zeitzonen hinweg
// derselbe Kalendertag. Das ist für ein Fristende die richtige Semantik: der
// 30.06. ist der 30.06., unabhängig davon, ob der Kalender auf Europe/Zurich
// oder Etc/UTC steht. Ein Uhrzeit-Ereignis (DTSTART;TZID=Europe/Zurich) wäre
// hier falsch — es würde für Nutzer in anderen Zeitzonen auf den Vor- oder
// Folgetag kippen. Die Tests unten sichern genau diese Wahl ab.
import { describe, it, expect } from 'vitest'
import { icsFuerFrist, icsSammel, type IcsFrist } from '../lib/icsExport'
import { icsTitelSchnellrechner } from '../components/forms/einfacheFristTexte'

const BEISPIEL: IcsFrist = {
  titel: 'Verjährung Forderung',
  endISO: '2027-03-31',
  beschreibung: 'Relative Frist (Art. 60 Abs. 1 OR)\nAnnahme: Kenntnis am 31.03.2024',
  vorfristTage: 3,
  aktenzeichen: '2026-014 MUS',
  url: 'https://lexmetrik.ch/rechner/verjaehrung?a=1',
}

/** Entfaltet RFC-5545-Faltung (CRLF + ein Leerzeichen) und liefert die Zeilen. */
function zeilen(ics: string): string[] {
  return ics.replace(/\r\n /g, '').split('\r\n').filter((z) => z !== '')
}

describe('ICS — RFC-5545-Form', () => {
  it('ist ein geschlossener VCALENDAR mit genau einem VEVENT', () => {
    const z = zeilen(icsFuerFrist(BEISPIEL))
    expect(z[0]).toBe('BEGIN:VCALENDAR')
    expect(z.at(-1)).toBe('END:VCALENDAR')
    expect(z.filter((l) => l === 'BEGIN:VEVENT')).toHaveLength(1)
    expect(z.filter((l) => l === 'END:VEVENT')).toHaveLength(1)
    expect(z).toContain('VERSION:2.0')
    expect(z.some((l) => l.startsWith('PRODID:'))).toBe(true)
  })

  it('schachtelt BEGIN/END sauber (kein offener Block)', () => {
    for (const ics of [icsFuerFrist(BEISPIEL), icsSammel([BEISPIEL, { titel: 'Zweite', endISO: '2027-04-30' }])]) {
      const stapel: string[] = []
      for (const l of zeilen(ics)) {
        if (l.startsWith('BEGIN:')) stapel.push(l.slice(6))
        else if (l.startsWith('END:')) expect(stapel.pop(), `END:${l.slice(4)} schliesst den offenen Block`).toBe(l.slice(4))
      }
      expect(stapel, 'kein Block bleibt offen').toEqual([])
    }
  })

  it('jede Zeile trägt einen Namen mit Doppelpunkt und bleibt ≤ 75 Oktette', () => {
    const enc = new TextEncoder()
    for (const roh of icsFuerFrist(BEISPIEL).split('\r\n')) {
      if (roh === '') continue
      expect(enc.encode(roh).length, `Zeile ≤ 75 Oktette (RFC 5545 §3.1): ${roh}`).toBeLessThanOrEqual(75)
    }
    for (const l of zeilen(icsFuerFrist(BEISPIEL))) {
      expect(l, `Eigenschaftszeile hat einen Namen: ${l}`).toMatch(/^[A-Z][A-Z0-9-]*[;:]/)
    }
    // Der Kalender endet mit CRLF (RFC 5545 §3.1).
    expect(icsFuerFrist(BEISPIEL).endsWith('\r\n')).toBe(true)
  })

  it('schreibt Ganztages-DATE-Werte statt zeitzonenabhängiger Zeitstempel', () => {
    const z = zeilen(icsFuerFrist(BEISPIEL))
    const start = z.find((l) => l.startsWith('DTSTART'))!
    const ende = z.find((l) => l.startsWith('DTEND'))!
    expect(start, 'DTSTART ist ein DATE (kein TZID, keine Uhrzeit)').toBe('DTSTART;VALUE=DATE:20270331')
    expect(ende, 'DTEND ist der Folgetag (RFC 5545: exklusiv)').toBe('DTEND;VALUE=DATE:20270401')
    // Ein DATE trägt keine Zeitzone — es darf folglich auch keine VTIMEZONE
    // und kein TZID im Kalender stehen (sonst wäre die Semantik zweideutig).
    expect(icsFuerFrist(BEISPIEL)).not.toContain('TZID')
    expect(icsFuerFrist(BEISPIEL)).not.toContain('BEGIN:VTIMEZONE')
  })

  it('leitet DTSTAMP aus dem Fristdatum ab — kein Date.now (§2)', () => {
    const dtstamp = (ics: string) => zeilen(ics).find((l) => l.startsWith('DTSTAMP:'))!
    expect(dtstamp(icsFuerFrist(BEISPIEL))).toBe('DTSTAMP:20270331T000000Z')
    // Der harte Beweis: dieselbe Eingabe zu einem ANDEREN Zeitpunkt ergibt
    // byte-gleiche Ausgabe. Die Systemzeit wird dafür verstellt.
    const a = icsFuerFrist(BEISPIEL)
    const echt = Date.now
    try {
      Date.now = () => 0
      const b = icsFuerFrist(BEISPIEL)
      Date.now = () => 4_102_444_800_000 // 1.1.2100
      const c = icsFuerFrist(BEISPIEL)
      expect(b, 'Ausgabe hängt nicht an der Systemzeit').toBe(a)
      expect(c, 'Ausgabe hängt nicht an der Systemzeit').toBe(a)
    } finally {
      Date.now = echt
    }
  })

  it('Golden-artig: gleiche Eingabe → byte-gleiche Datei, auch im Sammel-Export', () => {
    expect(icsFuerFrist(BEISPIEL)).toBe(icsFuerFrist({ ...BEISPIEL }))
    const menge = [BEISPIEL, { titel: 'Klagefrist', endISO: '2027-04-30', vorfristTage: 0 }]
    expect(icsSammel(menge)).toBe(icsSammel(menge.map((e) => ({ ...e }))))
  })

  it('maskiert Sonderzeichen im TEXT, nicht in der URI', () => {
    const z = zeilen(icsFuerFrist({ titel: 'Frist; mit, Zeichen', endISO: '2027-03-31', url: 'https://x.test/a?b=1,2' }))
    expect(z.find((l) => l.startsWith('SUMMARY:'))).toContain('Frist\\; mit\\, Zeichen')
    // URL ist Value-Typ URI (RFC 5545 §3.8.4.6) — Kommas bleiben unmaskiert.
    expect(z.find((l) => l.startsWith('URL:'))).toBe('URL:https://x.test/a?b=1,2')
  })

  it('Sammel-Export: n Events in EINEM Kalender, UIDs paarweise verschieden', () => {
    const ics = icsSammel([
      { titel: 'Erste', endISO: '2027-03-31' },
      { titel: 'Zweite', endISO: '2027-03-31' },
      { titel: 'ohne gültiges Datum', endISO: 'kein-iso' },
    ])
    const z = zeilen(ics)
    expect(z.filter((l) => l === 'BEGIN:VCALENDAR')).toHaveLength(1)
    expect(z.filter((l) => l === 'BEGIN:VEVENT'), 'ungültiger Eintrag wird übersprungen').toHaveLength(2)
    const uids = z.filter((l) => l.startsWith('UID:'))
    expect(new Set(uids).size, 'UIDs sind eindeutig (RFC 5545 §3.8.4.7)').toBe(uids.length)
  })

  // ── §9-Bug-Check M-1 (mittel, §1/§5) ──────────────────────────────────────
  // Der Schnell-/Tagerechner führt kein Aktenzeichen-Feld. Trug er einen
  // KONSTANTEN Titel («Fristende»), hing die UID allein am Enddatum — zwei
  // fachlich verschiedene Fristen mit demselben Endtag kollidierten, und der
  // Kalender überschrieb den ersten Eintrag beim Import des zweiten stumm.
  // Der Prüfer-Fall: dieselbe Dauer, einmal ohne Ferien, einmal unter
  // ZPO-Gerichtsferien. Der e2e-Zwilling in `e2e/ics-export-z1.e2e.ts` belegt,
  // dass beide Regimes hier tatsächlich denselben Endtag liefern.
  describe('M-1 — der Titel des Schnellrechners diskriminiert', () => {
    const uid = (ics: string) => zeilen(ics).find((z) => z.startsWith('UID:'))!
    const AM_GLEICHEN_TAG = '2026-06-11'

    it('Prüfer-Fall: Regime-Wechsel ⇒ verschiedene UIDs', () => {
      const ohne = icsFuerFrist({ titel: icsTitelSchnellrechner('2026-06-01', 10, 'tage', 'keine'), endISO: AM_GLEICHEN_TAG })
      const zpo = icsFuerFrist({ titel: icsTitelSchnellrechner('2026-06-01', 10, 'tage', 'zpo'), endISO: AM_GLEICHEN_TAG })
      expect(uid(zpo), `UID kollidiert: ${uid(ohne)}`).not.toBe(uid(ohne))
    })

    it('auch Dauer, Einheit und Startdatum trennen', () => {
      const uids = [
        icsTitelSchnellrechner('2026-06-01', 10, 'tage', 'zpo'),
        icsTitelSchnellrechner('2026-06-01', 20, 'tage', 'zpo'),
        icsTitelSchnellrechner('2026-06-01', 10, 'wochen', 'zpo'),
        icsTitelSchnellrechner('2026-05-01', 10, 'tage', 'zpo'),
        icsTitelSchnellrechner('2026-06-01', 10, 'tage', 'schkg'),
        icsTitelSchnellrechner('2026-06-01', 10, 'tage', 'vwvg'),
        icsTitelSchnellrechner('2026-06-01', 10, 'tage', 'bgg'),
      ].map((titel) => uid(icsFuerFrist({ titel, endISO: AM_GLEICHEN_TAG })))
      expect(new Set(uids).size, 'jede Eingabe-Variante bekommt ihre eigene UID').toBe(uids.length)
    })

    it('bleibt deterministisch und lesbar', () => {
      expect(icsTitelSchnellrechner('2026-06-01', 10, 'tage', 'zpo'))
        .toBe('Fristende – 10 Tage ab 01.06.2026 · Gerichtsferien (ZPO)')
      // Zweimal derselbe Aufruf, byte-gleich (§2).
      expect(icsTitelSchnellrechner('2026-06-01', 10, 'tage', 'zpo')).toBe(icsTitelSchnellrechner('2026-06-01', 10, 'tage', 'zpo'))
    })
  })

  it('Vorfrist-Alarm nur wenn verlangt, mit RFC-Dauer', () => {
    expect(icsFuerFrist({ titel: 'Ohne', endISO: '2027-03-31', vorfristTage: 0 })).not.toContain('BEGIN:VALARM')
    const z = zeilen(icsFuerFrist({ titel: 'Mit', endISO: '2027-03-31', vorfristTage: 5 }))
    expect(z).toContain('BEGIN:VALARM')
    expect(z).toContain('ACTION:DISPLAY')
    expect(z).toContain('TRIGGER:-P5D')
  })
})
