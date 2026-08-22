import type { ReactNode } from 'react';
import type { ZuletztEintrag } from '../../lib/zuletztVerwendet';
import { VerlaufIcon } from '../layout/VerlaufIcon';
import { suchOptionId } from './suchOptionId';
import { EINSTIEGE } from './SucheLeerzustandKontext';

// ─── Leerzustand der Suche (⌘K / Fokus ohne Eingabe) — UI-NAV O1, Schritt 2 ──
//
// Erscheint, wenn das Suchfeld fokussiert, aber leer ist: die zuletzt geöffneten
// Inhalte (aus DERSELBEN Verlauf-Quelle wie Startseiten-Chips und Topbar-Verlauf,
// §5) plus einige kuratierte Einstiege. Reine Darstellung/Navigation (§3).
//
// Synchron/CLS-frei: das Panel erscheint nur auf Fokus (Nutzer-Interaktion, nie im
// ersten Paint) → keine localStorage-/Hydration-Divergenz im Prerender (§15.2).
// `verlauf` kommt als Prop vom Aufrufer (EIN `useZuletzt()`-Aufruf, geteilt mit
// der Tastatur-Navigation — Cowork-Befund 38, 21.8.2026, s. unten).
//
// `EINSTIEGE` (kuratierte Übersichts-Routen) und `leerOptionen` (flache
// Options-Liste für die Tastatur-Navigation) stehen in
// `SucheLeerzustandKontext.ts` (react-refresh/only-export-components — Muster
// wie `InhaltsKopfKontext.ts` neben `InhaltsKopf.tsx`).

const ZEILE_CLS = 'group/z flex items-center gap-2.5 px-4 py-2 text-body-s text-ink-700 transition-colors hover:bg-brass-100/40 hover:text-brass-800 cursor-pointer';

export function SucheLeerzustand({ verlauf, listboxId, aktivId, onNavigate }: {
  /** Verlauf-Einträge (bereits auf 5 gekappt) — EIN geteilter useZuletzt()-Aufruf
   *  beim Aufrufer, damit Anzeige und Tastatur-Navigation (leerOptionen) exakt
   *  dieselbe Liste sehen. */
  verlauf: ZuletztEintrag[];
  /** ARIA-Listbox-ID des steuernden Felds (wie SuchResultate) — macht jede Zeile
   *  zu einer role=option statt eines eigenen Tab-Stopps (Befund 38). */
  listboxId: string;
  /** Options-ID des per Pfeiltasten hervorgehobenen Eintrags. */
  aktivId?: string;
  /** Maus/Touch-Navigation (Optionen sind keine `<a>` mehr, s. SuchResultate). */
  onNavigate: (href: string) => void;
}) {
  const zeile = (oid: string, href: string, inhalt: ReactNode) => (
    <li key={oid} role="option" id={oid} aria-selected={oid === aktivId}
      onClick={() => onNavigate(href)}
      className={`${ZEILE_CLS}${oid === aktivId ? ' bg-brass-100/40' : ''}`}>
      {inhalt}
    </li>
  );

  return (
    <div className="lc-card overflow-hidden" role="listbox" id={listboxId} aria-label="Suche — Verlauf und Einstiege">
      {verlauf.length > 0 && (
        <div role="group" aria-label="Zuletzt geöffnet" className="border-b border-line">
          <p className="lc-overline px-4 pt-3 pb-1">Zuletzt geöffnet</p>
          <ul role="none" className="pb-1.5">
            {verlauf.map((e) => zeile(suchOptionId(listboxId, 'verlauf', e.route), e.route, (
              <>
                <VerlaufIcon typ={e.typ} className="shrink-0 text-ink-500" />
                <span className="min-w-0 flex-1 truncate">{e.titel}</span>
                <span aria-hidden className="text-ink-300 transition-all group-hover/z:translate-x-0.5 group-hover/z:text-brass-500">→</span>
              </>
            )))}
          </ul>
          {/* §8: der Verlauf liegt nur lokal. */}
          <p className="px-4 pb-2 text-micro leading-snug text-ink-500">Nur auf diesem Gerät</p>
        </div>
      )}

      <div role="group" aria-label="Einstieg">
        <p className="lc-overline px-4 pt-3 pb-1">Einstieg</p>
        <ul role="none" className="pb-1.5">
          {EINSTIEGE.map((e) => zeile(suchOptionId(listboxId, 'einstieg', e.route), e.route, (
            <>
              <span className="min-w-0 flex-1 truncate">{e.label}</span>
              <span aria-hidden className="text-ink-300 transition-all group-hover/z:translate-x-0.5 group-hover/z:text-brass-500">→</span>
            </>
          )))}
        </ul>
      </div>
    </div>
  );
}
