import { test, expect } from '@playwright/test';

// E4/A32 + E4-Korrektur (David-Feedback 25.7.2026, wörtlich): «also das
// kontextfenster soll gliederung nicht abschneiden. sie soll einfach unten an
// der gliederung stehen. aktuell schneidet es gliederung ab.»
//
// DEKLARIERTE ANPASSUNG dieses Specs ans neue Soll: die frühere Fassung pinnte
// die 33vh-Slot-Geometrie (fixer Geschwister-Slot, Slot-Höhe unverändert,
// Baum > Slot) — genau dieses Layout klemmte das Gliederungs-Sichtfenster ein
// (ZGB@1440: 444px statt ~740px) und ist durch das David-Zitat oben überholt.
// Neues Soll: das Panel steht IM FLUSS INNERHALB des [data-toc]-Scrollers,
// unterhalb des Baums; die Gliederung behält ihr volles Spalten-Sichtfenster.
//
// A9-DoD-Querschnitt bleibt: die Panel-Einblendung darf unter CPU-Drossel KEIN
// Layout-Springen erzeugen. Neuer CLS-Mechanismus: unter dem Panel steht im
// Scroller nichts — das Einwachsen vergrössert nur die Scrollhöhe, verschiebt
// aber kein sichtbares Element. Kontext-Feeds werden per Route angehalten, bis
// der CLS-Beobachter steht (deterministisches Messfenster).
// ── DEKLARIERTE ERWEITERUNG W2·19-GLIEDERUNG/S7 (9.8.2026) ────────────────────
// Freigabe David 8.8.2026 (Bau-Spec §10, Entscheid (a) «e2e-Anpassungen in
// deklarierten Commits erlaubt»), NEBEN dem 25.7.-Zitat oben — beide gelten:
//   25.7.2026: «also das kontextfenster soll gliederung nicht abschneiden. sie
//              soll einfach unten an der gliederung stehen.»  → LAYOUT-Verdikt
//   8.8.2026:  «Kontext = Erlass-Übersicht UND Artikel-Kontext»  → INHALT
// Die LAYOUT-Assertions (a)–(f) sind UNVERÄNDERT geblieben; hinzugekommen ist
// ausschliesslich ein zweiter Prüfschritt (g) für den neuen, scrollgetriebenen
// Inhalt: die «Zu Art. X»-Gruppe wechselt ihren Inhalt, WÄHREND man liest — also
// ohne Nutzer-Input, also CLS-pflichtig (§15.2). Ein solcher Wechsel ist der
// einzige Weg, wie die neue Gruppe Schaden anrichten kann, und genau deshalb
// steht die Assertion hier und nicht in einer eigenen Spec: sie gehört an das
// bestehende CLS-Messfenster des Kontext-Fensters.
//
// Drossel wie leser-kopf-a9: CI = 4× (2-Kern-Runner), lokal 6× (Auftrag E4).
const DROSSEL = process.env.CI ? 4 : 6;

test('E4-Korrektur: Panel im Fluss unter der vollen Gliederung — kein Abschneiden, CLS 0', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate: DROSSEL });

  // Kontext-Feeds anhalten (Seiten-kritische Fetches — Snapshot/Struktur/
  // Currency unter /normtext/ ohne «revisionen» — laufen ungebremst durch).
  let freigeben: (() => void) | null = null;
  const tor = new Promise<void>((r) => { freigeben = r; });
  await page.route(/\/(rechtsprechung|materialien|verzahnung)\/|\/normtext\/revisionen\//, async (route) => {
    await tor;
    await route.continue();
  });

  await page.goto('/gesetze/bund/BV');
  const toc = page.locator('[data-toc]');
  await expect(toc).toBeVisible({ timeout: 20000 });
  const slot = page.locator('[data-toc-kontext]');
  await expect(slot).toBeAttached({ timeout: 20000 });
  await expect(slot).toContainText('Kontext');
  await expect(slot).toContainText('wird geladen');

  // (a) Panel liegt IM FLUSS des [data-toc]-Scrollers (kein Geschwister-Slot).
  const struktur = await page.evaluate(() => {
    const t = document.querySelector('[data-toc]');
    const s = document.querySelector('[data-toc-kontext]');
    const aside = t?.closest('aside') ?? null;
    return {
      imScroller: !!(t && s && t.contains(s)),
      tocClient: t?.clientHeight ?? 0,
      tocScroll: t?.scrollHeight ?? 0,
      asideHoehe: aside ? Math.round(aside.getBoundingClientRect().height) : 0,
    };
  });
  expect(struktur.imScroller, 'Panel muss IM [data-toc]-Scroller liegen').toBe(true);
  // (b) Gliederung nicht abgeschnitten: der Scroller füllt die TOC-Spalte im
  // Wesentlichen ganz (>85% der Aside-Höhe) — der alte 33vh-Slot drückte ihn
  // auf ~56%. Identische Messgrösse wie die Ist-Erhebung (clientHeight).
  expect(struktur.tocClient, 'Gliederungs-Sichtfenster eingeklemmt').toBeGreaterThan(struktur.asideHoehe * 0.85);

  const tocClientVorher = struktur.tocClient;
  const ersterEintragVorher = await page.locator('[data-toc] button').first().boundingBox();

  // CLS-Beobachter installieren, DANN die Feeds freigeben.
  await page.evaluate(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries() as PerformanceEntry[]) {
        const s = e as unknown as { value: number; hadRecentInput: boolean };
        if (!s.hadRecentInput) (window as unknown as { __cls: number }).__cls += s.value;
      }
    }).observe({ type: 'layout-shift' });
  });
  freigeben!();

  // Panel vollständig eingeblendet (Gating: alles auf einmal, Platzhalter weg).
  await expect(slot).not.toContainText('wird geladen', { timeout: 30000 });
  await page.waitForTimeout(800); // Layout unter Drossel ausschwingen lassen

  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  // (c) Kein unerwarteter Layout-Shift durch die Einblendung.
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
  expect(cls, 'CLS der Panel-Einblendung muss 0 sein').toBe(0);

  // (d) Sichtfenster der Gliederung unverändert; das Einwachsen hat nur die
  // SCROLLhöhe des Scrollers vergrössert (Fluss-Beweis), nichts eingeklemmt.
  const nachher = await page.evaluate(() => {
    const t = document.querySelector('[data-toc]');
    return { tocClient: t?.clientHeight ?? 0, tocScroll: t?.scrollHeight ?? 0 };
  });
  expect(Math.abs(nachher.tocClient - tocClientVorher), 'Gliederungs-Sichtfenster verändert').toBeLessThan(2);
  expect(nachher.tocScroll, 'Panel muss die Scrollhöhe im Fluss vergrössern').toBeGreaterThan(struktur.tocScroll);
  // (e) Der erste sichtbare Gliederungs-Eintrag steht exakt an seinem Platz.
  const ersterEintragNachher = await page.locator('[data-toc] button').first().boundingBox();
  expect(Math.abs((ersterEintragNachher?.y ?? 0) - (ersterEintragVorher?.y ?? -1))).toBeLessThan(1);

  // (f) «einfach unten an der gliederung»: erst die Seite in die 2-Spalten-Zone
  // bringen (bei Scroll 0 liegt die sticky TOC-Spalte noch unter Kopf/Präambel),
  // dann den Gliederungs-Scroller ans Ende — das Panel wird sichtbar (Scrollen
  // ist kein Layout-Shift, CLS bleibt unberührt).
  await page.evaluate(() => document.getElementById('art-3')?.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    // Zum PANEL-ANFANG scrollen (der Panel-Inhalt selbst ist länger als das
    // Spalten-Sichtfenster — «Scroller ganz ans Ende» stünde am Panel-ENDE).
    const t = document.querySelector('[data-toc]');
    const k = document.getElementById('kontext-titel');
    if (t && k) t.scrollTop += k.getBoundingClientRect().top - t.getBoundingClientRect().top - 20;
  });
  await expect(page.locator('#kontext-titel')).toBeInViewport();
});

// ── (g) S7 · Artikel-Kontext: CLS 0 AUCH beim Artikelwechsel ─────────────────
// Der neue «Zu Art. X»-Block ist der erste Panel-Inhalt, der sich beim blossen
// SCROLLEN ändert — vier Rollen-Zeilen, deren Text je Artikel wechselt (Praxis,
// Verweise, letzte Änderung, Werkzeuge). Ohne feste Höhe wäre jeder gelesene
// Artikel ein kleiner Layout-Sprung im sichtbaren Panel; `hadRecentInput` greift
// nicht, weil kein Klick beteiligt ist. Diese Prüfung ist damit die
// Abnahme-Bedingung der Höhenfestigkeit (§15.2, Bau-Spec §5.2 «höhenfester
// Block»), und sie ist scheiterns-fähig: nimmt man `lc-artikelkontext` weg,
// misst sie den Sprung sofort.
test('S7: Artikel-Kontext wechselt beim Lesen den Inhalt — Höhe und CLS bleiben', async ({ page }) => {
  // Zeitbudget: der OR-Reader lädt gedrosselt lange, und die drei Lese-Schritte
  // warten je 900 ms aus. Reine INFRASTRUKTUR (§6.3) — kein `expect` berührt.
  test.setTimeout(process.env.CI ? 120_000 : 60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const client = await page.context().newCDPSession(page);

  // OR: viele Artikel mit sehr unterschiedlich dichtem Kontext (Art. 41 trägt
  // Praxis und Werkzeuge, die Nachbarn deutlich weniger) — genau die Spreizung,
  // die einen höhenvariablen Block auffliegen liesse.
  // Die Drossel greift BEWUSST erst nach dem Laden: gemessen wird der Wechsel
  // beim Lesen, nicht der Seitenaufbau (den deckt der erste Test dieser Datei
  // gedrosselt ab). Ungedrosselt zu laden macht den Test schnell, ohne die
  // Prüfaussage zu verwässern.
  await page.goto('/gesetze/bund/OR#art-41');
  const block = page.locator('[data-artikel-kontext]');
  await expect(block).toBeAttached({ timeout: 30000 });
  // ── VORBEDINGUNG der Messung, nicht die Messung selbst ─────────────────────
  // Gemessen wird gleich, ob der Block beim Lesen SEINE HÖHE hält und im
  // Kontextfenster nichts verrutscht. Dafür muss er sichtbar sein — ein Shift
  // ausserhalb des Sichtfelds zählt nicht als CLS. Genau diese Vorbedingung war
  // zweimal brüchig: erst eine Rechnung mit fester 240-px-Marge auf den
  // Panel-Anfang (traf nicht mehr, seit der Wegweiser VOR dem Lade-Gating
  // rendert), dann ein einmaliges `scrollIntoViewIfNeeded` (die sticky
  // Aside-Spalte und der innere [data-toc]-Scroller brauchen beide eine
  // Bewegung, und die Seite schwingt nach dem Hash-Sprung noch nach).
  //
  // Dieselbe Lehre wie beim Popover-Wurzelfix (§17): nicht prüfen-dann-handeln,
  // sondern die HANDLUNG wiederholen, bis die Bedingung hält. Jede Runde rückt
  // beide Scroller nach; die Assertions darunter sind unverändert.
  // WER DEN SCROLLER BESITZT: nicht der Test, sondern der Scroll-Spy. Er führt
  // `[data-toc]` dem aktiven Baumknoten nach (Mitscroll/Nudge, gemessen von
  // a33-F1) und zieht damit alles zurück, was weiter unten im selben Scroller
  // steht — auch diesen Block. Genau daran scheiterte die Vorbedingung im
  // Shard-Kontext deterministisch (3/3 Läufe erster Versuch), während sie
  // isoliert immer hielt: dort war die Seite längst ausgeschwungen, bevor der
  // Test scrollte.
  // Der Reader hat für diesen Konflikt eine eigene Regel — `tocTouchRef`: eine
  // NUTZER-Bedienung des Scrollers (wheel/pointerdown/touchstart) pausiert das
  // automatische Nachführen. Der Test bedient sich derselben Mechanik, statt
  // gegen sie anzuscrollen; a33 armiert den Guard für seine F2/V1-Messung
  // genauso. Kein Produkt-Eingriff, keine abgeschwächte Assertion — nur die
  // Vorbedingung wird auf die Art hergestellt, die der Reader vorsieht.
  await expect.poll(async () => {
    await page.evaluate(() => {
      const t = document.querySelector('[data-toc]');
      if (!t) return;
      t.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 1 }));
      const b = document.querySelector('[data-artikel-kontext]');
      if (b) t.scrollTop += b.getBoundingClientRect().top - t.getBoundingClientRect().top - 8;
    });
    // Ausschwingen lassen UND danach prüfen: nur was den Nachlauf überlebt,
    // ist wirklich sichtbar (Handlung wiederholen statt prüfen-dann-handeln).
    await page.waitForTimeout(700);
    return page.evaluate(() => {
      const b = document.querySelector('[data-artikel-kontext]');
      if (!b) return false;
      const r = b.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
    });
  }, { timeout: 45_000, message: 'Artikel-Kontext nie im Sichtfeld — CLS wäre nicht messbar' }).toBe(true);
  await page.waitForTimeout(600);
  await expect(block).toBeInViewport();

  const hoehe = () => page.evaluate(() => {
    const b = document.querySelector('[data-artikel-kontext]');
    return b ? Math.round(b.getBoundingClientRect().height) : -1;
  });
  const gruppe = () => page.evaluate(() => {
    const b = document.querySelector('[data-artikel-kontext]');
    return b?.parentElement?.querySelector('h3')?.textContent ?? '';
  });
  const hoeheVorher = await hoehe();
  const gruppeVorher = await gruppe();
  expect(hoeheVorher, 'Artikel-Kontext-Block nicht gerendert').toBeGreaterThan(0);

  // Ab hier gedrosselt messen (2-Kern-Runner-Nähe, wie der erste Test).
  await client.send('Emulation.setCPUThrottlingRate', { rate: DROSSEL });

  // CLS-Beobachter NACH dem Einschwingen installieren, und AUF DAS KONTEXTFENSTER
  // GESCOPT. Begründung (gemessen 9.8.2026, Quellen-Sonde über `sources[].node`):
  // beim Durchscrollen von OR verschieben sich zwei Dinge, die NICHTS mit dieser
  // Slice zu tun haben — die Lesespalte selbst (`#lc-lesespalte section`, das
  // bekannte content-visibility-/Höhenschätzungs-Verhalten) und die Baumzeilen im
  // `<aside>` (das Auto-Akkordeon des Scroll-Spys, dessen Budget a33 F1/F2 misst,
  // nicht diese Spec). Eine ungescopte Summe misst also fremde Budgets mit und
  // wäre entweder dauerhaft rot oder müsste auf einen Deckel aufgeweicht werden —
  // beides schlechter als eine SCHARFE Aussage über das, was S7 neu einführt:
  // im `[data-toc-kontext]`-Fenster darf sich beim Lesen NICHTS verschieben.
  await page.evaluate(() => {
    (window as unknown as { __clsKontext: number }).__clsKontext = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries() as PerformanceEntry[]) {
        const s = e as unknown as {
          value: number; hadRecentInput: boolean;
          sources?: Array<{ node?: Node | null }>;
        };
        if (s.hadRecentInput) continue;
        const imKontext = (s.sources ?? []).some((q) => {
          const n = q.node as Element | null | undefined;
          return !!(n && n.nodeType === 1 && n.closest('[data-toc-kontext]'));
        });
        if (imKontext) (window as unknown as { __clsKontext: number }).__clsKontext += s.value;
      }
    }).observe({ type: 'layout-shift' });
  });

  // Durch mehrere Artikel scrollen (kein Klick — der Scroll-Spy führt den Block
  // nach). `mouse.wheel` erzeugt keinen `hadRecentInput`-Ausschluss für Shifts
  // ausserhalb des 500-ms-Fensters; wir warten darum je Schritt lange genug.
  for (const ziel of ['art-52', 'art-62', 'art-97']) {
    await page.evaluate((id) => {
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
      // Guard nachziehen (s. o.) und den Block im Blick behalten — gemessen wird
      // seine HÖHE, und die ist nur an einem sichtbaren Element aussagekräftig.
      const t = document.querySelector('[data-toc]');
      const b = document.querySelector('[data-artikel-kontext]');
      if (t) {
        t.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 1 }));
        if (b) t.scrollTop += b.getBoundingClientRect().top - t.getBoundingClientRect().top - 8;
      }
    }, ziel);
    await page.waitForTimeout(900);
    expect(await hoehe(), `Höhe des Artikel-Kontexts wandert bei ${ziel}`).toBe(hoeheVorher);
  }

  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const cls = await page.evaluate(() => (window as unknown as { __clsKontext: number }).__clsKontext);
  expect(cls, 'CLS im Kontextfenster beim Artikelwechsel muss 0 sein').toBe(0);
  // Und der Block hat wirklich MITGEFÜHRT (sonst wäre die Höhen-Aussage wertlos).
  expect(await gruppe(), 'Artikel-Kontext ist dem Lesen nicht gefolgt').not.toBe(gruppeVorher);
});

// ── S7/B1 · Werkzeug-Sprung: VERHALTEN, nicht String-Präsenz ────────────────
// Bug-Check 9.8.2026: die Werkzeug-Zeile war ein nacktes `<a href="#kontext-
// werkzeuge">`. Das wirkte dreifach — (a) jeder Klick pushte browsernativ einen
// Verlaufseintrag (exakt das als LM-209 behobene Muster), (b) der
// Fragment-Wechsel überschrieb den `#art-…`-Deeplink, den LM-202 als teilbare
// Adresse schützt, (c) im Split-View löst der Browser das Fragment DOKUMENTWEIT
// auf und sprang damit ins falsche Pane.
// Der S7-Unit-Test prüfte nur, dass die Zeichenkette `#kontext-werkzeuge` im
// Markup steht — genau die Sorte Assertion, die den Defekt gar nicht sehen
// KANN. Hier wird darum das Verhalten gemessen: Verlaufslänge, Adresse, Ziel.
test('S7/B1: Werkzeug-Sprung ohne Verlaufseintrag und ohne den #art-Deeplink zu zerstören', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  // OR Art. 127 trägt eine artikelscharfe Werkzeug-Gruppe (Verjährung).
  await page.goto('/gesetze/bund/OR#art-127');
  // Der Knopf erscheint erst, wenn sein Sprungziel wirklich im DOM steht (das
  // Panel gibt die Affordanz erst dann frei — CI-Befund 9.8.2026). Auf einem
  // langsamen Runner kann das dauern; die Wartezeit ist Infrastruktur, die
  // Prüfaussage unverändert.
  await expect(page.locator('#kontext-werkzeuge')).toBeAttached({ timeout: 60000 });
  const knopf = page.getByRole('button', { name: /Rechner\/Vorlagen zu/ });
  await expect(knopf).toBeVisible({ timeout: 30000 });

  const vorher = await page.evaluate(() => ({ len: history.length, hash: location.hash }));
  expect(vorher.hash, 'Deeplink nicht gesetzt — Testvoraussetzung').toContain('art-127');

  await knopf.click();
  await page.waitForTimeout(500);

  const nachher = await page.evaluate(() => ({ len: history.length, hash: location.hash }));
  // (a) LM-209: kein Verlaufseintrag je Klick.
  expect(nachher.len, 'Werkzeug-Sprung flutet den Verlauf').toBe(vorher.len);
  // (b) LM-202: der teilbare Artikel-Anker überlebt den Sprung.
  expect(nachher.hash, '#art-Deeplink vom Werkzeug-Sprung überschrieben').toBe(vorher.hash);
  // (c) Und der Sprung hat trotzdem stattgefunden — sonst wären (a) und (b)
  // trivial durch «Knopf tut gar nichts» erfüllt.
  await expect(page.locator('#kontext-werkzeuge')).toBeInViewport();
});
