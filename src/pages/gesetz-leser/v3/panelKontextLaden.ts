import { useEffect, useState } from 'react';
import { revisionenFuerNorm, type RevisionAnsicht } from '../../../lib/normtext/revisionen';
import { botschaftenFuer, type BotschaftBezug } from '../../../lib/materialien/botschaften';
import { vernehmlassungenFuer, type VernehmlassungBezug } from '../../../lib/materialien/vernehmlassungen';

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
