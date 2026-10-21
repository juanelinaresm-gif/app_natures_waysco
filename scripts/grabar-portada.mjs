// Grabación breve de la portada (móvil y escritorio) como WebP animado.
//
// Usa el screencast de Chrome (CDP) sobre `vite preview` y arma la animación con ImageMagick.
// La grabación empieza cerca del final del clip para mostrar el cierre del bucle y el
// reinicio, y termina pulsando el control de pausa.
//
// Uso: npm run build && node scripts/grabar-portada.mjs
import { execFileSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(root, 'docs', 'reports', 'capturas', process.env.CAPTURAS ?? 'fase-04')
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 4180
const FPS = 12

const VIEWS = [
  { name: 'movil-375', width: 375, height: 812, mobile: true, resize: '375x' },
  { name: 'escritorio-1440', width: 1440, height: 900, mobile: false, resize: '960x' },
]

async function startPreview() {
  const proc = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'ignore' })
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(`http://localhost:${PORT}/`)).ok) return proc
    } catch {
      /* aún no responde */
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  proc.kill()
  throw new Error('vite preview no respondió')
}

async function record(browser, view) {
  const context = await browser.newContext({
    viewport: { width: view.width, height: view.height },
    deviceScaleFactor: 1,
    isMobile: view.mobile,
    hasTouch: view.mobile,
  })
  await context.route(/^https?:\/\/(?!localhost)/, (r) => r.abort())
  const page = await context.newPage()
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' })
  // Espera a que el video reproduzca y lo lleva cerca del final.
  await page.waitForFunction(() => !document.querySelector('.hero__video')?.paused)
  await page.evaluate(() => {
    const v = document.querySelector('.hero__video')
    v.currentTime = v.duration - 2.4
  })
  await page.waitForTimeout(150)

  const cdp = await context.newCDPSession(page)
  const frames = []
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    frames.push({ data, t: metadata.timestamp })
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
  })
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 85, everyNthFrame: 1 })
  await page.waitForTimeout(5200) // final del clip, fundido y reinicio
  await page.click('.hero__toggle') // pausa manual
  await page.waitForTimeout(1300)
  await cdp.send('Page.stopScreencast')
  await context.close()

  // Remuestreo a FPS constantes con los tiempos reales de cada cuadro.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nw-grabacion-'))
  const t0 = frames[0].t
  const total = frames[frames.length - 1].t - t0
  const files = []
  for (let i = 0, j = 0; i <= total * FPS; i++) {
    const target = t0 + i / FPS
    while (j + 1 < frames.length && frames[j + 1].t <= target) j++
    const file = path.join(dir, `f${String(i).padStart(4, '0')}.jpg`)
    fs.writeFileSync(file, Buffer.from(frames[j].data, 'base64'))
    files.push(file)
  }
  // El último cuadro (estado en pausa) puede quedar después del último instante muestreado:
  // se añade y se mantiene un segundo.
  for (let k = 0; k < FPS; k++) {
    const file = path.join(dir, `z${String(k).padStart(4, '0')}.jpg`)
    fs.writeFileSync(file, Buffer.from(frames[frames.length - 1].data, 'base64'))
    files.push(file)
  }
  const out = path.join(OUT, `grabacion-${view.name}.webp`)
  execFileSync('magick', ['-delay', String(100 / FPS), '-loop', '0', ...files, '-resize', view.resize, '-quality', '55', out])
  fs.rmSync(dir, { recursive: true, force: true })
  return { out, frames: frames.length, seconds: total.toFixed(1), size: `${Math.round(fs.statSync(out).size / 1024)} KB` }
}

fs.mkdirSync(OUT, { recursive: true })
const server = await startPreview()
const browser = await chromium.launch({ executablePath: CHROME, headless: true })
try {
  for (const view of VIEWS) console.log(view.name, JSON.stringify(await record(browser, view)))
} finally {
  await browser.close()
  server.kill()
}
