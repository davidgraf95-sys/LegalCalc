import { useEffect, useState } from 'react';
import { revisionenFuerNorm, type RevisionAnsicht } from '../../../lib/normtext/revisionen';
import { botschaftenFuer, type BotschaftBezug } from '../../../lib/materialien/botschaften';
import { vernehmlassungenFuer, type VernehmlassungBezug } from '../../../lib/materialien/vernehmlassungen';
import { ladeRevisionShard, type RevisionShard } from '../../../lib/verzahnung/artikel-revisionen';
import { kontextSoftLaw } from '../../../lib/kontext';
import type { MaterialBezug } from '../../../lib/normtext/werkzeuge';

// ─── Nachladen der Reiter «Änderungen» und «Materialien» (H3, Kap. 7) ────────
//
// DASSELBE PRINZIP WIE BEI DEN BEZÜGEN, an derselben Stelle entschieden: geladen
// wird, sobald das Panel EINMAL offen war (`laden`), nie beim Seitenaufruf. Die
// Ist-Hülle holt diese drei Sidecars heute unbedingt, sobald das `KontextPanel`
// in der Lesespalte steht.
//
// EIN LADEN JE ERLASS, NICHT JE REITER-WECHSEL: die Gate-Bedingung ist
// «Panel war offen», nicht «dieser Reiter ist aktiv». Wer zwischen den Reitern
// hin und her klickt, löst keinen neuen Fetch aus; wer das Panel schliesst,
// verliert die Daten nicht. Die Sidecar-Lader darunter haben ohnehin ihre
// eigenen Caches — die Gate-Bedingung schützt vor dem Fetch, nicht vor der
// Wiederholung.
//
// ── DREI ZUSTÄNDE, EHRLICH GETRENNT (§8) ────────────────────────────────────
// `null` aus den Lade-Funktionen heisst «Quelle nicht erreichbar» (Fetch-Fehler)
// und ist NICHT dasselbe wie eine leere Liste («nichts erfasst»). Beide wieder
// nicht dasselbe wie «lädt noch» (`fertig === false`). Die Reiter unterscheiden
// alle drei — ein gemeinsames «keine Daten» hätte einen Netzwerkfehler als
// Bestandsaussage ausgegeben.
//
// AN DEN ERLASS-KEY GEBUNDEN (Repo-Muster, vgl. `bezuegeLaden.ts`): ein
// Pane-/Erlass-Wechsel liefert nie die Änderungen des vorigen Erlasses.

export interface Geladen<T> {
  wert: T | null;
  fertig: boolean;
}

const NICHT_FERTIG = { wert: null, fertig: false } as const;

export function useRevisionen(erlassKey: string | undefined, laden: boolean): Geladen<RevisionAnsicht> {
  const [stand, setStand] = useState<{ key: string; wert: RevisionAnsicht | null } | null>(null);
  useEffect(() => {
    if (!laden || !erlassKey) return;
    let lebt = true;
    void revisionenFuerNorm([erlassKey]).then((a) => { if (lebt) setStand({ key: erlassKey, wert: a }); });
    return () => { lebt = false; };
  }, [erlassKey, laden]);
  if (!erlassKey || stand?.key !== erlassKey) return NICHT_FERTIG;
  return { wert: stand.wert, fertig: true };
}

// ── §7b-DECKUNGSLÜCKE GESCHLOSSEN (21.8.2026, normrevision-badge.e2e.ts) ─────
// Derselbe Lade-/Gate-Rhythmus wie `useRevisionen` oben, andere Quelle: der
// erlass-lokale Revisions-Shard (`ladeRevisionShard`, seit V1c bestandsfest,
// bisher nur vom Ist-KontextPanel gemountet). `null` = Erlass ohne
// Revisions-Beleg (kein Fehler, §8 — `ladeRevisionShard` unterscheidet das
// bereits vom Fetch-Fehler, der dort ebenfalls `null` liefert und dafür den
// Promise-Cache NICHT setzt, also beim nächsten Aufruf erneut versucht).
export function useArtikelRevisionShard(erlassKey: string | undefined, laden: boolean): Geladen<RevisionShard | null> {
  const [stand, setStand] = useState<{ key: string; wert: RevisionShard | null } | null>(null);
  useEffect(() => {
    if (!laden || !erlassKey) return;
    let lebt = true;
    void ladeRevisionShard(erlassKey).then((s) => { if (lebt) setStand({ key: erlassKey, wert: s }); });
    return () => { lebt = false; };
  }, [erlassKey, laden]);
  if (!erlassKey || stand?.key !== erlassKey) return NICHT_FERTIG;
  return { wert: stand.wert, fertig: true };
}

// ── W2·7-VZUI (31.8.2026) · Behörden-Ressourcen für den Reiter «Anwendung» ───
// Derselbe Lade-/Gate-Rhythmus wie oben, dritte Quelle: `kontextSoftLaw` zieht
// die Material-Kanten-Shards und das Browse-Register und liefert die
// Behördenpublikationen zu diesem Erlass (Kreisschreiben, Wegleitungen,
// Leitfäden). Das ist der Bestand, den die V3-Hülle beim Ablösen des
// `KontextPanel` verloren hat — er war nie falsch, er hatte nur keinen Ort mehr
// (Dateikopf `PanelMaterialien.tsx`: «Soft Law bleibt draussen … offener Punkt
// im Vollzugsvermerk, nicht stillschweigend weggelassen»).
//
// `[]` und «Fetch fehlgeschlagen» sind hier NICHT unterscheidbar: `kontextSoftLaw`
// löst beides zur leeren Liste auf (`ladeMaterialManifest` → `null` ⇒ `return []`).
// Der Reiter darf darum «keine erfasst» NICHT behaupten, wo er in Wahrheit
// nichts weiss — er sagt es so, wie es ist (§8, Wortlaut in `PanelAnwendung`).
export function useSoftLaw(erlassKey: string | undefined, laden: boolean): Geladen<MaterialBezug[]> {
  const [stand, setStand] = useState<{ key: string; wert: MaterialBezug[] } | null>(null);
  useEffect(() => {
    if (!laden || !erlassKey) return;
    let lebt = true;
    void kontextSoftLaw('norm', [erlassKey]).then((r) => { if (lebt) setStand({ key: erlassKey, wert: r }); });
    return () => { lebt = false; };
  }, [erlassKey, laden]);
  if (!erlassKey || stand?.key !== erlassKey) return NICHT_FERTIG;
  return { wert: stand.wert, fertig: true };
}

export interface MaterialStand {
  botschaften: BotschaftBezug[] | null;
  vernehmlassungen: VernehmlassungBezug[] | null;
}

export function useMaterialien(erlassKey: string | undefined, laden: boolean): Geladen<MaterialStand> {
  const [stand, setStand] = useState<{ key: string; wert: MaterialStand } | null>(null);
  useEffect(() => {
    if (!laden || !erlassKey) return;
    let lebt = true;
    // EIN Promise.all, nicht zwei Effekte: beide ziehen dasselbe
    // Material-Manifest (`ladeMaterialManifest`, dort memoisiert), und der Reiter
    // soll in EINEM Schritt fertig werden statt in zwei sichtbaren Sprüngen
    // (§15/2 — jeder Teil-Resolve wäre ein eigenes Einwachsen).
    void Promise.all([botschaftenFuer([erlassKey]), vernehmlassungenFuer([erlassKey])])
      .then(([botschaften, vernehmlassungen]) => {
        if (lebt) setStand({ key: erlassKey, wert: { botschaften, vernehmlassungen } });
      });
    return () => { lebt = false; };
  }, [erlassKey, laden]);
  if (!erlassKey || stand?.key !== erlassKey) return NICHT_FERTIG;
  return { wert: stand.wert, fertig: true };
}
