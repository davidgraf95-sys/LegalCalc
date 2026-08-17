// TEMPORÄRE MESS-SONDE S2 — wird nach der Messung gelöscht (kein Tor).
import { test, expect } from '@playwright/test'
import { clsBeobachtenInstallieren, clsAuslesen } from './helpers/cls'

const FAELLE = [
  { name: 'STPO', pfad: '/gesetze/bund/STPO' },
  { name: 'OR', pfad: '/gesetze/bund/OR' },
  { name: 'BS-640.100', pfad: '/gesetze/kanton/BS-640.100' },
]

test('S2-Sonde: Zone, Toggle-Sprung, CLS', async ({ page }) => {
  test.slow()
  for (const f of FAELLE) {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(f.pfad)
    await clsBeobachtenInstallieren(page, true)
    await page.waitForTimeout(4000)
    const { cls } = await clsAuslesen(page)
    const mass = await page.evaluate(() => {
      const arts = [...document.querySelectorAll('article.nt-art-cv')]
      const h = (el: Element) => Math.round(el.getBoundingClientRect().height * 100) / 100
      const eins = document.querySelector('article.nt-art-cv [data-lese]') as HTMLElement | null
      const st = eins ? getComputedStyle(eins) : null
      let ch: number | null = null
      if (eins && st) {
        const c = document.createElement('canvas').getContext('2d')!
        c.font = `${st.fontStyle} ${st.fontWeight} ${st.fontSize}/${st.lineHeight} ${st.fontFamily}`
        const probe = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ '
        ch = Math.round(eins.getBoundingClientRect().width / (c.measureText(probe).width / probe.length))
      }
      const slots = [...document.querySelectorAll('[data-hist-slot]')]
      const zone = [...document.querySelectorAll('[data-beiwerk]')]
      return {
        artikel: arts.length,
        text: st ? { px: st.fontSize, lh: st.lineHeight, spalte: Math.round(eins!.getBoundingClientRect().width), ch } : null,
        seitenHoehe: Math.round(document.documentElement.scrollHeight),
        histSlots: slots.length,
        histLeer: slots.filter((e) => e.textContent!.trim() === '').length,
        zonen: zone.length,
        zonenHoehen: zone.slice(0, 10).map(h),
        zonenLeer: zone.filter((e) => e.textContent!.trim() === '').length,
        apparate: document.querySelectorAll('[data-fn-apparat]').length,
        leitfall: document.querySelectorAll('[data-leitfall-zeile]').length,
      }
    })
    console.log(`### ${f.name} @1440 · CLS ${cls} ###`, JSON.stringify(mass))

    const yVor = await page.evaluate(() =>
      [...document.querySelectorAll('article.nt-art-cv')].map((e) => Math.round((e as HTMLElement).offsetTop)))
    for (const [attr, wert] of [['data-fussnoten', 'aus'], ['data-histansicht', 'aus'], ['data-leitfaelle', 'aus']] as const) {
      await page.evaluate(([a, w]) => document.documentElement.setAttribute(a, w), [attr, wert] as [string, string])
      await page.waitForTimeout(300)
      const yNach = await page.evaluate(() =>
        [...document.querySelectorAll('article.nt-art-cv')].map((e) => Math.round((e as HTMLElement).offsetTop)))
      const abw = yVor.map((v, i) => Math.abs(v - yNach[i])).filter((d) => d > 0)
      console.log(`  ${f.name} ${attr}=aus → verschoben ${abw.length}/${yVor.length}, max Δ ${abw.length ? Math.max(...abw) : 0} px`)
      await page.evaluate((a) => document.documentElement.setAttribute(a, 'an'), attr)
      await page.waitForTimeout(150)
    }
  }
  expect(true).toBe(true)
})
