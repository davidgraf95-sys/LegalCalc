// scripts/normtext/definitionen-generieren-run.ts
// Dünner CLI-Runner des Legaldefinitionen-Generators (R6, FAHRPLAN-KANTONE §5).
// Getrennt vom reinen Modul `definitionen-generieren.ts`, damit dieses
// seiteneffektfrei importierbar bleibt (Tests + check:definitionen) —
// Repo-Muster revisionen-generieren(-run).
//
// §2: --datum aus der Shell, kein Date.now. Reiner Offline-Lauf über die
// liegenden Snapshots, kein Netz.
//
// Aufruf:  npm run gen:definitionen -- --datum=$(date +%F)
//          npm run gen:definitionen -- --bericht     (nur messen, nicht schreiben)
import { main } from './definitionen-generieren';

main();
