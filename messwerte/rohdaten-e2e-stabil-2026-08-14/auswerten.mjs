// Auswertung: node auswerten.mjs <label-praefix>
import { readdirSync, readFileSync } from 'node:fs'
const DIR = '/private/tmp/claude-501/-Users-david-Developer-LexMetrik/2a54d3fc-d9a9-4d79-a3d6-e8c4e08838f9/scratchpad/mess'
const praefix = process.argv[2]
const dateien = readdirSync(DIR).filter((d) => d.startsWith(praefix) && d.endsWith('.json')).sort()
const proTest = new Map()
for (const d of dateien) {
  let j
  try { j = JSON.parse(readFileSync(`${DIR}/${d}`, 'utf8')) } catch { console.log(`!! ${d} unlesbar`); continue }
  const geh = (suiten, pfad = []) => {
    for (const s of suiten ?? []) {
      for (const sp of s.specs ?? []) {
        for (const t of sp.tests ?? []) {
          for (const r of t.results ?? []) {
            const key = `${sp.file ?? ''} › ${sp.title}`
            if (!proTest.has(key)) proTest.set(key, [])
            proTest.get(key).push({ ms: r.duration, status: r.status })
          }
        }
      }
      geh(s.suites, [...pfad, s.title])
    }
  }
  geh(j.suites)
}
const stat = (xs) => {
  const m = xs.reduce((a, b) => a + b, 0) / xs.length
  const sd = Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, xs.length - 1))
  return { n: xs.length, min: Math.min(...xs), max: Math.max(...xs), mittel: Math.round(m), sd: Math.round(sd) }
}
for (const [k, v] of [...proTest].sort((a, b) => Math.max(...b[1].map((x) => x.ms)) - Math.max(...a[1].map((x) => x.ms)))) {
  const ms = v.map((x) => x.ms)
  const s = stat(ms)
  const rot = v.filter((x) => x.status !== 'passed').length
  console.log(`${k}\n   n=${s.n} min=${s.min} max=${s.max} mittel=${s.mittel} sd=${s.sd} nicht-grün=${rot}  roh=[${ms.join(', ')}]`)
}
