// scripts/dispatch-agents-cli.ts — CLI-Einstieg für `npm run dispatch:agents`.
//
// Eigene Datei aus demselben Grund wie dispatch-cli.ts: ein argv-Guard in der
// Bibliothek ist unter vite-node IMMER falsch (argv[1] = vite-node-Bin) und
// macht den Generator zum stillen No-op — beim Erstbau dieses Generators am
// 4.8.2026 prompt reproduziert. Eine Datei, die nur CLI ist, muss nicht raten.
// check:dispatch-klausel (C) beweist den Weg End-to-End über die Datei-Inhalte.
import { agentenSchreiben } from './dispatch-agents';

for (const pfad of agentenSchreiben()) console.log(`geschrieben: ${pfad}`);
