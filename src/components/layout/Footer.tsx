import { Link } from 'react-router-dom';
import { LexMetrikSiegel, LexMetrikWortmarke } from './Logo';
import { SAMMLUNG_BESTAND, SITE_KURZFORM } from '../../lib/seo';

// Footer (ausgebaut): dreispaltig – Marke + Kurzbeschrieb, Navigation,
// Hinweise; darunter Mono-Feinschriftzeile. Paper-Grund, obere Hairline.

const NAVIGATION = [
  // Free/Pro-Zweiteilung aufgehoben (FAHRPLAN-EINE-HAUPTSEITE; Bug-Check
  // 7.6.2026 M-2: die alten zwei Einträge zeigten auf dieselbe Seite).
  // W2·10-UI-NAV/N0a: der eine «Rechner & Vorlagen»-Eintrag zeigte auf «/»
  // (Startseite), nicht auf die Übersichten, die das Label verspricht — die tote
  // Verbindung ist zu zwei ehrlichen Zielen aufgelöst (/rechner · /vorlagen).
  { to: '/rechner', label: 'Rechner' },
  { to: '/vorlagen', label: 'Vorlagen' },
  { to: '/methodik', label: 'Methodik' },
  { to: '/ueber', label: 'Über LexMetrik' },
  { to: '/kontakt', label: 'Kontakt' },
  { to: '/datenschutz', label: 'Datenschutzerklärung' },
];

export function Footer() {
  return (
    <footer className="border-t-2 border-rule bg-paper mt-16">
      <div className="max-w-content mx-auto px-5 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr] gap-x-12 gap-y-8">
        {/* Marke */}
        <div className="space-y-3">
          <Link to="/" className="inline-flex items-center gap-2 no-underline" aria-label="LexMetrik – Startseite">
            <LexMetrikSiegel size={26} />
            <LexMetrikWortmarke />
          </Link>
          {/* Marken-Kurzbeschrieb aus der I2-SSoT (seo.ts, §5) — Bestands-
              Aufzählung + Methodik-Kurzform statt einer zweitgepflegten
              Marketing-Zeile. W2·24-R3 (Sprach-Diät, Fahrplan §6 (h)): hier stand
              `HERO_TITEL` = «Schweizer Recht an einem Ort»; die Konstante ist
              mit dem Slogan gestrichen, der Fuss nennt jetzt den Bestand. */}
          <p className="text-body-s text-ink-500 leading-relaxed max-w-[34ch]">
            {SAMMLUNG_BESTAND} {SITE_KURZFORM}
          </p>
        </div>

        {/* ── LM-139 / LM-145 (W2·17-UI-BEFUNDE/B16) · SPALTENHÖHEN AUSGLEICHEN ──
            Die sechs Links standen in EINER Kolonne (`space-y-2` über je
            `min-h-11`), also 6 × 44 px + 5 × 8 px. Gemessen 4.9.2026 @1440 auf /
            und /materialien/ESTV-KS-DBG-5A (Preview von origin/main): rund 52 px
            Zeilenabstand gegenüber der eng gesetzten Hinweis-Spalte daneben, und
            unter der Marken-Spalte blieb eine grosse leere Fläche. LM-139 und
            LM-145 sind derselbe Defekt auf zwei Routen — ein Posten.

            DIE 44 PX BLEIBEN. Das weite Zeilenmass ist kein Zierrat, sondern das
            Ergebnis des Responsive-Audit-Fixes D2 (Fuss-Tap-Ziele 44 px, WCAG
            2.5.8 / FAHRPLAN-UI-NAVIGATION §4 R6). Zusammendrücken nähme genau den
            zurück; der zulässige Weg ist der Ausgleich der HÖHEN ohne
            Verkleinerung der Trefferflächen. Darum stehen die Links ab `sm` in
            zwei Kolonnen: gleiche Tap-Fläche je Link, halbe Spaltenhöhe. Unter
            `sm` bleibt es einspaltig — dort ist der Fuss ohnehin gestapelt. */}
        <nav aria-label="Footer-Navigation">
          <p className="lc-overline mb-3">Navigation</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            {NAVIGATION.map((n) => (
              <Link key={n.label} to={n.to}
                className="flex items-center min-h-11 text-body-s text-ink-600 hover:text-ink-900 underline underline-offset-2 decoration-rule-soft hover:decoration-ink-900 transition-colors">
                {n.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Hinweise */}
        <div className="space-y-2">
          <p className="lc-overline mb-3">Hinweise</p>
          <p className="text-body-s text-ink-500 leading-relaxed">
            Orientierung, keine Rechtsberatung. Ergebnisse und Entwürfe sind im
            Einzelfall fachlich zu prüfen.
          </p>
          <p className="text-body-s text-ink-500 leading-relaxed">
            Normverweise führen auf die amtliche Sammlung:{' '}
            <a href="https://www.fedlex.admin.ch" target="_blank" rel="noopener noreferrer"
              className="text-ink-900 underline underline-offset-2">fedlex.admin.ch</a>
          </p>
          {/* Präzisiert (Cowork-Befund 31, 18.8.2026): der Pauschalsatz «Ihre
              Eingaben verlassen den Browser nicht» stand im Widerspruch zur
              Online-Volltextsuche, deren Fusszeile ehrlich sagt, dass
              Suchbegriffe den Browser dafür verlassen (§8). Der Satz nennt
              jetzt seinen Geltungsbereich; die Ausnahme steht dort, wo sie
              anfällt — an der Online-Suche selbst. */}
          <p className="text-body-s text-ink-500 leading-relaxed">
            Eingaben in Rechnern und Vorlagen verlassen den Browser nicht; nur
            Online-Suchen senden die Suchbegriffe an den jeweiligen Suchdienst.
          </p>
        </div>
      </div>

      {/* Feinschriftzeile */}
      <div className="border-t border-rule-soft">
        <div className="max-w-content mx-auto px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="lc-fineprint">© 2026 LexMetrik</p>
          <p className="lc-fineprint sm:text-right">
            Orientierungsrechner · keine Rechtsberatung · läuft vollständig im Browser
          </p>
        </div>
      </div>
    </footer>
  );
}
