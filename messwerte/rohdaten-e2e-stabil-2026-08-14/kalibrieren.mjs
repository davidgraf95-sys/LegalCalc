// Kalibrierung nach QS-PERF Ziff. 5: Deckel = Ist + max(3 sd, 25 %).
// node kalibrieren.mjs <label-praefix> [regex-filter]
import { readdirSync, readFileSync } from 'node:fs'
const DIR = '/private/tmp/claude-501/-Users-david-Developer-LexMetrik/2a54d3fc-d9a9-4d79-a3d6-e8c4e08838f9/scratchpad/mess'
const praefix = process.argv[2]
const filter = process.argv[3] ? new RegExp(process.argv[3]) : null
const dateien = readdirSync(DIR).filter((d) => d.startsWith(praefix + '-') && d.endsWith('.json')).sort()
const proTest = new Map()
for (const d of dateien) {
  let j
  try { j = JSON.parse(readFileSync(`${DIR}/${d}`, 'utf8')) } catch { console.log(`!! ${d} unlesbar`); continue }
  const geh = (suiten) => {
    for (const s of suiten ?? []) {
      for (const sp of s.specs ?? []) for (const t of sp.tests ?? []) for (const r of t.results ?? []) {
        const key = `${sp.file} › ${sp.title}`
        if (filter && !filter.test(key)) continue
        if (!proTest.has(key)) proTest.set(key, [])
        proTest.get(key).push({ ms: r.duration, status: r.status, lauf: d })
      }
      geh(s.suites)
    }
  }
  geh(j.suites)
}
console.log(`Läufe: ${dateien.length} (${dateien.join(', ')})\n`)
const zeilen = [...proTest].map(([k, v]) => {
  const ms = v.map((x) => x.ms)
  const m = ms.reduce((a, b) => a + b, 0) / ms.length
  const sd = Math.sqrt(ms.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, ms.length - 1))
  const ist = Math.max(...ms)
  const deckel = ist + Math.max(3 * sd, 0.25 * ist)
  const rot = v.filter((x) => x.status !== 'passed')
  return { k, n: ms.length, min: Math.min(...ms), max: ist, mittel: Math.round(m), sd: Math.round(sd), deckel: Math.ceil(deckel / 1000) * 1000, ms, rot }
}).sort((a, b) => b.max - a.max)
for (const z of zeilen.slice(0, Number(process.env.TOP ?? 25))) {
  console.log(`${z.k}`)
  console.log(`   n=${z.n} min=${z.min} max=${z.max} mittel=${z.mittel} sd=${z.sd}  → Deckel(Ist+max(3sd,25%)) ≈ ${z.deckel} ms`)
  console.log(`   roh=[${z.ms.join(', ')}]${z.rot.length ? '  NICHT-GRÜN: ' + z.rot.map((r) => r.status + '@' + r.lauf).join(', ') : ''}`)
}
