/**
 * G-AUFH-ART Runde 2 (Gegenprüfung 27.7.2026) — echte, gekürzte xhtml_tol-
 * Ausschnitte zu den vier vom Gegenprüfungs-Verdikt widerlegten Fehlklassen.
 *
 * ECHTE Quell-Belege (abgerufen 27.7.2026):
 *   - BS_212410_S34: GET .../api/de/texts_of_law/212.410, § 34 — der Kopf trägt
 *     KEINEN AGS-Stern, aber der einzige Absatz besteht aus der LexWork-eigenen
 *     Klasse 'abrogation_ellip' («…»). Falsch-Negativ in Runde 1 (bloecke.length
 *     war 1, nicht 0) — Runde 2 erkennt die Ellipse als eigenständiges Signal.
 *   - BS_786310_ZIFFER_2_1: GET .../api/de/texts_of_law/786.310, Ziffer 2.1 —
 *     Container-Überschrift («Verfahren») OHNE eigenen Body; die Kinder 2.1.1/
 *     2.1.2 tragen den echten Wortlaut. Runde 1 markierte 2.1 fälschlich
 *     (Fehlklasse 1); hier trägt der Container ohnehin KEINEN Stern — die
 *     synthetische Variante unten (KONSTRUIERT_CONTAINER_MIT_STERN) beweist,
 *     dass der Container-Ausschluss selbst load-bearing ist.
 *   - BS_685340_S46: GET .../api/de/texts_of_law/685.340, § 46 «Gebührentarif»
 *     — leerer Body, Inhalt lebt im Anhang (annex_documents: [{title:
 *     'Gebührentarif zu § 46', abrogated: false}]). Kein Stern im Kopf → wird
 *     bereits von der Kern-Regel ausgeschlossen; die synthetische Variante
 *     unten (KONSTRUIERT_ANNEX_MIT_STERN) beweist den Anhang-Ausschluss isoliert.
 *
 * KONSTRUIERT (klar benannt, kein Live-Beleg): zwei Minimal-Fixtures, die
 * beweisen, dass Container-/Anhang-Ausschluss selbst load-bearing sind (§6.7)
 * — im Bestand kommt die Kombination «Container/Anhang UND eigener Stern»
 * nicht vor (der Stern allein reicht dort schon nicht), aber die Regel darf
 * sich nicht auf diesen Zufall verlassen.
 */

export const LEXWORK_BS_212410_S34_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>34</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Bericht und Rechnung</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='abrogation_ellip'>&hellip;&nbsp;<strong>*</strong></span>
    </p>
  </div>
  <div class='paragraph_post'></div>
  <div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>35</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Anlage und Sicherung von Verm&ouml;genswerten</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Gest&uuml;tzt auf das Inventar und das Budget.</span>
    </p>
  </div>`;

export const LEXWORK_BS_786310_ZIFFER_2_1_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>Ziffer</span> <span class='number'>2.1</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Verfahren</span>
    </div>
  </div>
  <div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>Ziffer</span> <span class='number'>2.1.1</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>&nbsp;</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Gem&auml;ss Ziffer 5.3 der Vereinbarung zwischen dem Kanton Basel-Stadt und dem Kanton Basel-Landschaft vom 5. Februar 2019 wird eine Plattform geschaffen.</span>
    </p>
  </div>
  <div class='paragraph_post'></div>
  <div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>Ziffer</span> <span class='number'>2.1.2</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>&nbsp;</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Zu Anpassungen der garantierten Liefermengen wird Konsens unter allen Partnern angestrebt.</span>
    </p>
  </div>
  <div class='paragraph_post'></div>`;

export const LEXWORK_BS_685340_S46_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>46</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Geb&uuml;hrentarif<a class="footnote" name="articletitle_text_fn_782520_2_5" href="#articletitle_text_fn_782520_2_5_c" id="articletitle_text_fn_782520_2_5">[5]</a></span>
    </div>
  </div>
  <div class='level_1 title'>
    <span class='number'>7. Teil:</span> <span class='title_text'>Schlussbestimmung</span>
  </div>`;

// ── KONSTRUIERT (kein Live-Beleg) — beweist den Container-Ausschluss isoliert:
// eine Container-Ziffer, die (hypothetisch) SELBST einen AGS-Stern trägt, aber
// deren Kind den echten Wortlaut hat. Ohne den Ausschluss würde die Kern-Regel
// (Stern + kein Body) den Container fälschlich markieren.
export const LEXWORK_KONSTRUIERT_CONTAINER_MIT_STERN_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>Ziffer</span> <span class='number'>9.1&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Container-Test</span>
    </div>
  </div>
  <div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>Ziffer</span> <span class='number'>9.1.1</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>&nbsp;</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Echter Wortlaut im Kind-Artikel.</span>
    </p>
  </div>`;

// ── KONSTRUIERT (kein Live-Beleg) — beweist den Anhang-Ausschluss isoliert:
// ein Artikel mit AGS-Stern + leerem Body, dessen Inhalt laut annex_documents
// (abrogated:false) in einem Anhang lebt.
export const LEXWORK_KONSTRUIERT_ANNEX_MIT_STERN_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>50&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Anhang-Test</span>
    </div>
  </div>`;
