// scripts/normtext/kanton-manifest-run.ts — dünner CLI-Runner für
// `schreibeKantonManifest()` (kanton-manifest.ts). Getrennt, damit der Import der
// Bibliotheks-Funktion `baueManifest` nirgends mehr nach public/ schreibt
// (QS-EFFIZIENZ 15.8.2026). Aufruf: npx vite-node scripts/normtext/kanton-manifest-run.ts
import { schreibeKantonManifest } from './kanton-manifest.ts';

schreibeKantonManifest();
