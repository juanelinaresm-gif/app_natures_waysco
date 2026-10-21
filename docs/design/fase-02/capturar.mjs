// Capturas y mediciones de las alternativas de portada (prototipos de diseño).
// Uso, desde la raíz del proyecto: node docs/design/fase-02/capturar.mjs
// Requiere Google Chrome (CHROME_PATH para otra ruta) y playwright-core del proyecto.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(here, 'capturas')
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const ALTS = [
  { id: 'a', file: 'portadas/alternativa-a.html', foto: '.hA__foto img', cta: '.btn--pedir' },
  { id: 'b', file: 'portadas/alternativa-b.html', foto: '.duo__campo--detox img', cta: '.btn--explorar' },
]
const VIEWS = [
  { name: 'movil-390x844', w: 390, h: 844, dpr: 3, mobile: true, shot: true },
  { name: 'movil-390x664-safari', w: 390, h: 664, dpr: 3, mobile: true, shot: true },
  { name: 'movil-320x640', w: 320, h: 640, dpr: 2, mobile: true, shot: true },
  { name: 'tableta-768x1024', w: 768, h: 1024, dpr: 2, mobile: true, shot: true },
  { name: 'escritorio-1024x768', w: 1024, h: 768, dpr: 1, mobile: false, shot: true },
  { name: 'escritorio-1440x900', w: 1440, h: 900, dpr: 1, mobile: false, shot: true },
  { name: 'escritorio-1920x1080', w: 1920, h: 1080, dpr: 1, mobile: false, shot: false },
]

fs.mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const rows = []
for (const alt of ALTS) {
  for (const v of VIEWS) {
    const ctx = await browser.newContext({
      viewport: { width: v.w, height: v.h },
      deviceScaleFactor: v.dpr,
      isMobile: v.mobile,
      hasTouch: v.mobile,
      reducedMotion: 'reduce', // capturas en estado final, sin animación
    })
    await ctx.route(/^https?:/, (r) => r.abort()) // nada sale del equipo
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto(pathToFileURL(path.join(here, alt.file)).href)
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(250)
    const m = await page.evaluate(
      ({ foto, cta }) => {
        const vh = window.innerHeight
        const r = (s) => document.querySelector(s).getBoundingClientRect()
        const h1 = document.querySelector('h1')
        const lh = parseFloat(getComputedStyle(h1).lineHeight)
        const f = r(foto)
        const visibleFoto = Math.max(0, Math.min(f.bottom, vh) - Math.max(f.top, 0)) / f.height
        return {
          header: Math.round(r('.hdr').height),
          h1Bottom: Math.round(r('h1').bottom),
          h1Lines: Math.round(h1.getBoundingClientRect().height / lh),
          h1Size: getComputedStyle(h1).fontSize,
          fotoTop: Math.round(f.top),
          fotoVisible: Math.round(visibleFoto * 100),
          ctaBottom: Math.round(r(cta).bottom),
          ctaVisible: r(cta).bottom <= vh,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        }
      },
      { foto: alt.foto, cta: alt.cta },
    )
    rows.push({ alt: alt.id.toUpperCase(), vista: v.name, ...m, errores: errors.length })
    if (v.shot) await page.screenshot({ path: path.join(OUT, `${alt.id}-${v.name}.png`) })
    if (v.name === 'movil-390x844') {
      // Encabezado fijo al desplazarse: nada flotante sobre el contenido.
      await page.evaluate(() => window.scrollTo(0, 700))
      await page.waitForTimeout(100)
      await page.screenshot({ path: path.join(OUT, `${alt.id}-movil-390x844-desplazado.png`) })
      if (alt.id === 'a') {
        await page.evaluate(() => window.scrollTo(0, 0))
        await page.click('.hdr__menu')
        await page.screenshot({ path: path.join(OUT, 'a-movil-390x844-menu.png') })
      }
    }
    await ctx.close()
  }
}
await browser.close()
console.table(rows)
fs.writeFileSync(path.join(OUT, 'mediciones.json'), JSON.stringify(rows, null, 2))
