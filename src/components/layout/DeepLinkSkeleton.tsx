import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// ─── W2·10-UI-NAV/R7 · «Springe zu …» beim Deep-Link-Einsprung ───────────────
//
// PROD-RE-AUDIT (§0.1 Vintage-Regel, 3.8.2026, lexmetrik.vercel.app, Chromium
// 1280×800, CPU-Drossel 6×): Der Befund ist NICHT durch U-POSITION/A2 erledigt.
// Beim Einsprung über `…/gesetze/bund/OR#art-335c` bleibt der DOKUMENTANFANG
// 1.8 s / 2.4 s / 2.8 s sichtbar (drei Ziele, drei Läufe), das Ziel-Element
// erscheint erst nach 3.7–4.8 s im DOM. Der Leser sieht also mehrere Sekunden
// lang Art. 1 eines Gesetzes, das er wegen Art. 335c geöffnet hat — und hat
// keinen Hinweis, dass noch etwas kommt. Genau dafür ist dieses Overlay da.
//
// Was es NICHT tut: es greift nicht in die Sprung-Mechanik ein, wartet auf nichts
// und hält nichts auf. Es liest den Hash EINMAL beim Einsprung (kein URL-Sync,
// LM-202) und legt sich rein visuell darüber, bis der Sprung gelandet ist.
//
// §15/CLS: `position: fixed`, `pointer-events: none` ⇒ kein Layout-Anteil, kein
// Eingriff in Scroll/Klick. Rendert im Ruhezustand `null` ⇒ prerendertes Markup
// byte-gleich.

/** Der Hash muss dem BESTEHENDEN Ankerraum entsprechen (`#art-<token>`, K2/R8:
 *  überall derselbe, opake Token). Kein neuer Ankerraum, keine eigene Grammatik. */
const ART_HASH = /^#art-(.+)$/;
/** Takt der Landeprüfung. Bewusst Intervall statt MutationObserver: der Reader
 *  mutiert während der Hydration tausendfach — ein Subtree-Observer auf dem
 *  Dokument wäre genau in der Sekunde teuer, in der es auf Tempo ankommt (§15). */
const TAKT_MS = 120;
/** Harte Obergrenze. Was bis dahin nicht gelandet ist, landet nicht mehr (toter
 *  Anker, fremdes Dokument) — dann verschwindet das Overlay, statt zu behaupten,
 *  es käme noch etwas (§8). */
const KAPPE_MS = 6000;
/** Toleranz um die Leselinie (`--nt-stick` ≈ 4rem + 2.25rem), ab der der Sprung
 *  als gelandet gilt. Grosszügig: es geht um «ist er dort», nicht um Pixel. */
const LANDE_TOLERANZ_PX = 140;

export function DeepLinkSkeleton() {
  const { hash, pathname } = useLocation();
  const [aktiv, setAktiv] = useState(false);
  // Etikett des Ziels, sobald es lesbar ist. Bis dahin bleibt der Text neutral:
  // aus dem Token lässt es sich NICHT ableiten (der Token ist opak, K2/R8, und
  // die Etikett-Regel — Art./§, bis/ter-Suffixe — lebt in den Artikel-Daten,
  // §5). Lieber «die verlinkte Stelle» als eine erfundene Artikelnummer (§8).
  const [label, setLabel] = useState('');

  useEffect(() => {
    const m = ART_HASH.exec(hash);
    if (!m) return;
    const id = `art-${m[1]}`;
    // Liegt das Ziel schon im DOM, ist der Sprung eine Sofort-Bewegung (interne
    // Navigation im geladenen Gesetz) — dafür braucht niemand ein Overlay. Das
    // Overlay gehört dem EINSPRUNG von aussen, wo der Reader erst noch entsteht.
    if (document.getElementById(id)) return;
    setAktiv(true);
    setLabel('');

    // Nutzer-Übernahme beendet das Overlay sofort: wer selbst scrollt, tippt
    // oder klickt, navigiert nicht mehr «hin» — ein Schleier mit «Springe zu …»
    // über der eigenen Bewegung wäre schlicht falsch.
    const uebernahme = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
    let takt = 0;
    let kappe = 0;
    let weg = false;
    const schliesse = () => {
      if (weg) return;
      weg = true;
      window.clearInterval(takt);
      window.clearTimeout(kappe);
      for (const ev of uebernahme) window.removeEventListener(ev, schliesse);
      setAktiv(false);
    };
    for (const ev of uebernahme) window.addEventListener(ev, schliesse, { passive: true, once: true });

    takt = window.setInterval(() => {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      // Etikett nachziehen, sobald der Anker da ist (sein Textinhalt IST das
      // Label — der Fussnoten-Marker steht ausserhalb des <a>).
      const a = el.querySelector<HTMLElement>(`a[href="#${CSS.escape(id)}"]`);
      const txt = a?.textContent?.trim();
      if (txt) setLabel(txt);
      // Gelandet = das Ziel steht im oberen Lesebereich. Erst dann weg, sonst
      // bliebe der Dokumentanfang in der Lücke zwischen «Element da» und
      // «Sprung ausgeführt» doch wieder sichtbar (im Audit ~1 s).
      if (top >= -LANDE_TOLERANZ_PX && top <= LANDE_TOLERANZ_PX) schliesse();
    }, TAKT_MS);
    kappe = window.setTimeout(schliesse, KAPPE_MS);

    return schliesse;
    // Absichtlich an pathname UND hash: ein zweiter Einsprung in dasselbe
    // Dokument (anderer Artikel) ist ein neuer Fall.
  }, [hash, pathname]);

  if (!aktiv) return null;
  const ziel = label || 'die verlinkte Stelle';
  return (
    <div role="status" aria-live="polite"
      // Positioniert wird RELATIV zum Inhalts-Kopf (`top-full`), nicht über eine
      // addierte Pixelhöhe von Topbar + Leiste: dieser Baustein hängt im Kopf,
      // also kennt er dessen Unterkante ohne Rechnung — und keine Magic-Number
      // veraltet still, wenn eine der beiden Leisten ihre Höhe ändert (§0.5).
      // Die Leiste selbst bleibt sichtbar; sie beantwortet ja bereits «wo bin
      // ich». Verdeckt wird nur der Dokumentanfang, der hier nichts zu suchen hat.
      className="pointer-events-none absolute inset-x-0 top-full z-30 flex h-screen justify-center bg-paper px-5">
      <div className="w-full max-w-3xl pt-8">
        <p className="text-body-s text-ink-600">Springe zu <span className="font-medium text-ink-800">{ziel}</span> …</p>
        {/* Platzhalter-Zeilen: sie sagen «hier kommt Text», ohne Text zu
            behaupten. `aria-hidden`, die Ansage steckt im Satz darüber. */}
        <div aria-hidden className="mt-6 animate-pulse space-y-3">
          {['w-1/3', 'w-full', 'w-11/12', 'w-4/5', 'w-full', 'w-2/3'].map((b, i) => (
            <div key={i} className={`h-3 rounded bg-paper-sunken ${b}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
