// scripts/betrieb/prod-smoke.ts — B-11 Prod-Watchdog (Synthetic Smoke)
//
// FAHRPLAN-BASIS-AUSBAU §A5 (B-11): `normen-monitor.yml` überwacht die QUELLEN,
// niemand überwacht die eigene PROD. Dieser Smoke prüft die Kernrouten der
// Live-Site (200 + korrekter Inhalts-Typ), den ehrlichen JSON-503/200 der
// Edge-Suche, die Sitemap, statische Assets und die CSP-Kopfzeile. Läuft als
// GitHub-Cron (`.github/workflows/prod-smoke.yml`) — bei Rot ein sichtbarer
// Issue (Muster wie normen-monitor). Lokal: `npm run smoke:prod`.
//
// Abgrenzung (§14, nicht daneben bauen): `normen-monitor.yml` bleibt der
// QUELLEN-Wächter (Fedlex/LexWork/Materialien). Dieser Job ist der PROD-Wächter.
//
// WARN-MECHANIK ZURÜCKGEBAUT (15.8.2026, §17-Gegengewicht/§6.7). Zwei Prüfungen
// liefen als `weich()`-WARN, weil PR #244 (QS-OPT O-1.1 CSP-connect-src /
// O-1.4 Soft-404) bei ihrem Bau noch offen war. Ein WARN macht den Job per
// Konstruktion NIE rot — beide Prüfungen konnten also nicht scheitern, und ihr
// Anlass war seit dem Merge von #244 entfallen. Gemessen am 15.8.2026 gegen
// die Live-Site (nicht behauptet): `/normtext/existiert-nicht-*.json` → HTTP
// 404, und die CSP-Kopfzeile trägt `connect-src … https://entscheidsuche.ch`.
// Beide sind darum jetzt HART. Damit fällt die gesamte WARN-Maschinerie
// (`weich()`, `Befund.warn`, gelb-Zähler, WARN-Symbol) ersatzlos weg — was
// nicht scheitern kann, wird gestrichen statt bewacht.
//
// Reine Betriebs-Prüfung, kein Rechts-/Rechen-/Norm-Pfad. Kein Import aus src/.

const BASE = (process.env.SMOKE_BASE_URL || 'https://lexmetrik.vercel.app').replace(/\/$/, '');
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS || 20000);

interface Befund {
  ok: boolean;
  name: string;
  detail: string;
}

const befunde: Befund[] = [];
function hart(ok: boolean, name: string, detail: string) {
  befunde.push({ ok, name, detail });
}

async function hole(pfad: string, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${BASE}${pfad}`, {
      ...init,
      signal: ctrl.signal,
      headers: { 'user-agent': 'lexmetrik-prod-smoke', ...(init?.headers ?? {}) },
    });
  } finally {
    clearTimeout(t);
  }
}

/** HTML-Kernroute: 200 + text/html + trägt den App-Marker (nicht bloss eine leere Shell). */
async function pruefeHtmlRoute(pfad: string, marker = 'LexMetrik') {
  try {
    const res = await hole(pfad);
    const ct = res.headers.get('content-type') || '';
    if (res.status !== 200) return hart(false, `HTML ${pfad}`, `Status ${res.status} (erwartet 200)`);
    if (!ct.includes('text/html')) return hart(false, `HTML ${pfad}`, `Content-Type «${ct}» (erwartet text/html)`);
    const body = await res.text();
    if (!body.includes(marker)) return hart(false, `HTML ${pfad}`, `Marker «${marker}» fehlt im Body`);
    if (!body.includes('id="root"')) return hart(false, `HTML ${pfad}`, 'App-Root <div id="root"> fehlt');
    hart(true, `HTML ${pfad}`, `200 · ${ct.split(';')[0]} · Marker ok`);
  } catch (e) {
    hart(false, `HTML ${pfad}`, `Netz-/Timeout-Fehler: ${(e as Error).message}`);
  }
}

/** Alt-Route mit Link-Erbe: permanenter Redirect (308/301) auf das Ziel — nicht gefolgt,
 *  damit Status UND Location beweisbar sind (IA-6 Stufe 2, vercel.json). */
async function pruefeRedirect(pfad: string, ziel: string) {
  try {
    const res = await hole(pfad, { redirect: 'manual' });
    if (res.status !== 308 && res.status !== 301) {
      return hart(false, `Redirect ${pfad}`, `Status ${res.status} (erwartet 308/301)`);
    }
    const loc = res.headers.get('location') || '';
    if (new URL(loc, BASE).pathname + new URL(loc, BASE).search !== ziel) {
      return hart(false, `Redirect ${pfad}`, `Location «${loc}» (erwartet ${ziel})`);
    }
    hart(true, `Redirect ${pfad}`, `${res.status} → ${ziel}`);
  } catch (e) {
    hart(false, `Redirect ${pfad}`, `Netz-/Timeout-Fehler: ${(e as Error).message}`);
  }
}

async function pruefeApiSuche() {
  const pfad = '/api/suche?q=miete';
  try {
    const res = await hole(pfad);
    const ct = res.headers.get('content-type') || '';
    // Vertrag §8: 200 (Turso live) ODER 503 (Env-Vars fehlen) — NIE eine HTML-Soft-404-Shell.
    if (res.status !== 200 && res.status !== 503) {
      return hart(false, `API ${pfad}`, `Status ${res.status} (erwartet 200 oder ehrlicher 503)`);
    }
    if (!ct.includes('application/json')) {
      return hart(false, `API ${pfad}`, `Content-Type «${ct}» — HTML statt JSON = Route verschluckt (Soft-404-Signal)`);
    }
    hart(true, `API ${pfad}`, `${res.status} · application/json`);
  } catch (e) {
    hart(false, `API ${pfad}`, `Netz-/Timeout-Fehler: ${(e as Error).message}`);
  }
}

async function pruefeSitemap() {
  try {
    const res = await hole('/sitemap.xml');
    const body = res.status === 200 ? await res.text() : '';
    const ok = res.status === 200 && /<sitemapindex|<urlset/.test(body);
    hart(ok, 'Sitemap /sitemap.xml', ok ? '200 · XML-Sitemap-Index' : `Status ${res.status} / kein Sitemap-XML`);
  } catch (e) {
    hart(false, 'Sitemap /sitemap.xml', `Netz-/Timeout-Fehler: ${(e as Error).message}`);
  }
}

async function pruefeAsset(pfad: string, typPrefix: string) {
  try {
    const res = await hole(pfad, { method: 'GET' });
    const ct = res.headers.get('content-type') || '';
    const ok = res.status === 200 && ct.startsWith(typPrefix);
    hart(ok, `Asset ${pfad}`, ok ? `200 · ${ct.split(';')[0]}` : `Status ${res.status} · ${ct || 'kein Content-Type'}`);
  } catch (e) {
    hart(false, `Asset ${pfad}`, `Netz-/Timeout-Fehler: ${(e as Error).message}`);
  }
}

async function pruefeCsp() {
  try {
    const res = await hole('/');
    const csp = res.headers.get('content-security-policy') || '';
    hart(csp.includes("default-src 'self'"), 'CSP-Kopfzeile', csp ? "vorhanden · default-src 'self'" : 'FEHLT');
    // HART seit 15.8.2026 (vorher WARN, Anlass PR #244 entfallen): fehlt der
    // Host, blockt die CSP den LiveSuche-POST — ein totes Feature in Prod.
    hart(
      csp.includes('entscheidsuche.ch'),
      'CSP connect-src entscheidsuche.ch',
      csp.includes('entscheidsuche.ch')
        ? 'gedeckt'
        : 'FEHLT — LiveSuche-POST wird von der CSP geblockt',
    );
  } catch (e) {
    hart(false, 'CSP-Kopfzeile', `Netz-/Timeout-Fehler: ${(e as Error).message}`);
  }
}

async function pruefeSoft404() {
  const pfad = `/normtext/existiert-nicht-${Date.now()}.json`;
  try {
    const res = await hole(pfad);
    const ct = res.headers.get('content-type') || '';
    const echt404 = res.status === 404;
    // HART seit 15.8.2026 (vorher WARN, Anlass PR #244 entfallen): eine
    // 200-HTML-Shell auf fehlende Datenassets maskiert jeden Datenfehler.
    hart(
      echt404,
      'Soft-404-Signal',
      echt404
        ? 'fehlende .json-Assets geben echte 404'
        : `fehlendes Asset gibt Status ${res.status} (${ct.split(';')[0]}) statt 404 — Soft-404 zurück`,
    );
  } catch (e) {
    hart(false, 'Soft-404-Signal', `Netz-/Timeout-Fehler: ${(e as Error).message}`);
  }
}

async function main() {
  console.log(`Prod-Smoke gegen ${BASE}\n`);
  // Kernrouten (prerendered, öffentlich) — Reihenfolge stabil für lesbare Logs.
  for (const pfad of ['/', '/gesetze', '/rechtsprechung', '/materialien', '/methodik', '/datenschutz']) {
    await pruefeHtmlRoute(pfad);
  }
  // IA-6 Stufe 2 (§11.8 Y-C, 3.8.2026): /international ist keine Seite mehr,
  // sondern ein permanenter Redirect auf die Säule. Genau DAS wird hier geprüft —
  // die vercel-Redirect-Ebene ist die einzige Schicht, die kein Repo-Tor sieht.
  await pruefeRedirect('/international', '/gesetze?ebene=international');
  await pruefeApiSuche();
  await pruefeSitemap();
  await pruefeAsset('/og.png', 'image/');
  await pruefeAsset('/robots.txt', 'text/plain');
  await pruefeCsp();
  await pruefeSoft404();

  let rot = 0;
  for (const b of befunde) {
    if (!b.ok) rot++;
    console.log(`${b.ok ? '  ok  ' : ' ROT  '} ${b.name} — ${b.detail}`);
  }
  console.log(`\n${befunde.length} Prüfungen · ${rot} rot`);
  if (rot > 0) {
    console.error('\nPROD-SMOKE ROT — Live-Site verletzt einen harten Vertrag.');
    process.exit(1);
  }
  console.log('\nPROD-SMOKE GRÜN.');
  // fetch/undici hält Keep-Alive-Sockets offen → expliziter Exit, sonst hängt
  // der Prozess ~Timeout lang nach dem letzten Log (CI-Job liefe unnötig lange).
  process.exit(0);
}

main().catch((e) => {
  console.error(`PROD-SMOKE ABBRUCH — ${(e as Error).message}`);
  process.exit(1);
});
