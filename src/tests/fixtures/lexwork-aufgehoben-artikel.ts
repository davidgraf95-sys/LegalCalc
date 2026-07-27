/**
 * G-AUFH-ART (W2·5j, BS-132.100-Audit 27.7.2026) — echte, gekürzte
 * xhtml_tol-Ausschnitte der LexWork-API für den ARTIKEL-genauen
 * Aufgehoben-Marker (Feld `aufgehoben` in LexArtikel/NormSnapshot).
 *
 * Empirisch verifiziert 27.7.2026:
 *   - BS_132100_S50_S55: GET https://www.gesetzessammlung.bs.ch/api/de/texts_of_law/132.100
 *     — §§ 51/55 sind Numerierungs-Slots mit article_title='…' (&hellip;) und
 *     KEINEM Body (kein paragraph/enumeration/paragraph_post). § 50 (Body
 *     vorhanden) bleibt ungemarkert.
 *   - BS_132100_S76_RANGE: dieselbe Quelle — §§ 76a/76b sind Numerierungs-Slots
 *     mit ECHTEM Randtitel («Zeitpunkt der Wahlvorschläge», «Relatives Mehr»)
 *     UND KEINEM Body — die zweite empirisch belegte Variante (Titel-Typ ist
 *     KEIN verlässliches Unterscheidungsmerkmal, nur die Body-Leere ist es).
 *     Die vorangehende `level_3 title`-Überschrift trägt zusätzlich die Quelle-
 *     eigene Markierung `class='abrogation_ellip'` (Beleg, dass LexWork
 *     Aufhebung selbst als Auszeichnungs-Konzept kennt) — § 76 (Body vorhanden)
 *     und § 76c (Body vorhanden, gleiche Sektion) bleiben ungemarkert: die
 *     Section-Markierung allein ist NICHT hinreichend, nur die eigene Body-Leere
 *     entscheidet je Artikel.
 *   - GL_IIIC1_ART1_4: GET https://gesetze.gl.ch/api/de/texts_of_law/III-C.1
 *     — Art. 3/4 sind Numerierungs-Slots mit article_title='…' und KEINEM Body;
 *     Art. 1/2 (Body vorhanden) bleiben ungemarkert.
 *   - GL_IIIC1_ART8_11_KOPF: derselbe Erlass — ein MEHRFACH-Bereichs-Token
 *     («8–11») trägt ebenfalls '…' + keinen Body (eine einzelne aufgehobene
 *     Platzhalter-Angabe für eine ganze Artikel-Spanne).
 */

export const LEXWORK_BS_132100_S50_S55_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>50&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Zuteilung der Sitze</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Die Verteilung der Sitze in einem Wahlkreis auf die einzelnen Listen erfolgt im Verh&auml;ltnis der Stimmenzahlen, die jede Liste in diesem Wahlkreis erhalten hat.</span>
    </p>
  </div>
  <div class='paragraph_post'></div>
  <div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>51&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      &hellip;
    </div>
  </div>
  <div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>55&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      &hellip;
    </div>
  </div>`;

export const LEXWORK_BS_132100_S76_RANGE_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>76&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Zeitpunkt</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Die Wahl des Regierungsrates und der Regierungspr&auml;sidentin oder des Regierungspr&auml;sidenten findet jeweils gleichzeitig mit der Wahl des Grossen Rates statt.</span>
    </p>
  </div>
  <div class='paragraph_post'></div>
  <div class='paragraph'>
    <span class='number'>2</span>
    <p>
      <span class='text_content'>Eine Ersatzwahl einzelner Mitglieder des Regierungsrates und der Regierungspr&auml;sidentin oder des Regierungspr&auml;sidenten findet innert n&uuml;tzlicher Frist statt.</span>
    </p>
  </div>
  <div class='paragraph_post'></div>
  <div class='level_3 title'>
    <span class='number'>4.C.II.I.<sup>bis</sup></span> <span class='abrogation_ellip'>&hellip;&nbsp;<strong>*</strong></span>
  </div>
  <div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>76a&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Zeitpunkt der Wahlvorschl&auml;ge</span>
    </div>
  </div>
  <div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>76b&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Relatives Mehr</span>
    </div>
  </div>
  <div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>&sect;</span> <span class='number'>76c&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Ersatzwahl des Regierungspr&auml;sidiums</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Scheidet die Regierungspr&auml;sidentin oder der Regierungspr&auml;sident w&auml;hrend der Amtsdauer aus, so findet eine Ersatzwahl statt.</span>
    </p>
  </div>
  <div class='paragraph_post'></div>
  <div class='paragraph'>
    <span class='number'>2</span>
    <p>
      <span class='text_content'>Tritt die Regierungspr&auml;sidentin oder der Regierungspr&auml;sident w&auml;hrend der Amtsdauer zur&uuml;ck, ohne gleichzeitig auch als Mitglied des Regierungsrates zur&uuml;ckzutreten, so ist nur ein bisheriges Mitglied des Regierungsrates als Regierungspr&auml;sidentin oder als Regierungspr&auml;sident w&auml;hlbar.</span>
    </p>
  </div>
  <div class='paragraph_post'></div>`;

export const LEXWORK_GL_IIIC1_ART1_4_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>Art.</span> <span class='number'>1</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Gegenstand</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Dieses Gesetz enth&auml;lt ausf&uuml;hrende Bestimmungen zur Schweizerischen Zivilprozessordnung (ZPO) sowie weitere Bestimmungen zu den Prozesskosten und Entsch&auml;digungen.</span>
    </p>
  </div>
  <div class='paragraph_post'></div>
  <div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>Art.</span> <span class='number'>2</span>
    </div>
    <div class='article_title'>
      <span class='title_text'>Kantonales Privatrecht</span>
    </div>
  </div>
  <div class='paragraph'>
    <span class='number'>1</span>
    <p>
      <span class='text_content'>Die ZPO ist auch anwendbar auf die Beurteilung des kantonalen Privatrechts. Das Gesetz regelt die Ausnahmen.</span>
    </p>
  </div>
  <div class='paragraph_post'></div>
  <div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>Art.</span> <span class='number'>3&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      &hellip;
    </div>
  </div>
  <div class='level_1 title'>
    <span class='number'>2.</span> <span class='title_text'>Besondere Zust&auml;ndigkeiten</span>
  </div>
  <div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>Art.</span> <span class='number'>4&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      &hellip;
    </div>
  </div>`;

export const LEXWORK_GL_IIIC1_ART8_11_XHTML = `<div class='article'>
    <div class='article_number'>
      <span class='article_symbol'>Art.</span> <span class='number'>8&ndash;11&nbsp;<strong>*</strong></span>
    </div>
    <div class='article_title'>
      &hellip;
    </div>
  </div>`;
