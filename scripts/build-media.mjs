// Genera los derivados web de los materiales originales.
//
// Lee de visual-pieces/ (originales, nunca se modifican) y escribe en public/media/.
// Requisitos locales: ImageMagick 7 (`magick`, con AVIF y WebP), Google Chrome
// (para extraer fotogramas de video; ruta configurable con CHROME_PATH) y, para el
// video de portada, Swift con AVFoundation (macOS).
//
// Uso: npm run media
//      npm run media -- --solo-recortes   (solo los recortes de producto con transparencia)
//      npm run media -- --solo-portada    (solo el video de portada y su póster)
//      npm run media -- --solo-diseno     (recursos del diseño de Claude Design y video de portada)
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(root, 'visual-pieces')
const OUT = path.join(root, 'public', 'media')
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nw-media-'))

// Fotogramas reales del video de DetoxPlus (no hay foto individual del producto).
const FRAMES = [
  { video: 'video_detox.mp4', time: 9.0, name: 'frame-detox-final.png' },
  { video: 'video_detox.mp4', time: 3.4, name: 'frame-detox-servir.png' },
]

// Video de fondo de la portada: copia sin audio (sin recodificar) y póster del primer cuadro.
// El primer cuadro permite que el bucle se funda sobre el póster sin salto al reiniciar.
const HERO_VIDEO = { src: 'video/home-background-v2-original.mp4', out: 'home-background.mp4' }
const HERO_FRAMES = [{ video: HERO_VIDEO.src, time: 0, name: 'frame-portada-inicio.png', w: 1024, h: 576 }]
const HERO_POSTER = { frame: 'frame-portada-inicio.png', crop: null, widths: [640, 1024], out: 'portada-video-poster' }

// crop: WxH+X+Y sobre el original (solo recorte y escala; sin deformar).
const PHOTOS = [
  { src: 'detox_y_colageno.jpeg', crop: '1200x1500+0+0', widths: [480, 800, 1200], out: 'hero-productos' },
  { src: 'colageno_img.jpeg', crop: '1200x1500+0+50', widths: [480, 800, 1200], out: 'colagenplus-vaso' },
  { src: 'detox_colageno_nature.jpeg', crop: null, widths: [480, 960], out: 'esencia-lago' },
  { frame: 'frame-detox-final.png', crop: '576x720+0+170', widths: [576], out: 'detoxplus-vaso' },
  { frame: 'frame-detox-servir.png', crop: null, widths: [576], out: 'rutina-poster' },
]

const VIDEOS = [{ src: 'video_detox.mp4', out: 'detoxplus-preparacion.mp4' }]

// Recortes frontales con fondo transparente para las fichas de producto.
// Solo se quita el margen transparente y se escala: la imagen no se retoca.
const CUTOUTS = [
  { src: 'recortes/detoxplus-frente-recorte-v1.png', widths: [440, 640, 860], out: 'detoxplus-recorte' },
  { src: 'recortes/colagenplus-frente-recorte-v1.png', widths: [500, 740, 980], out: 'colagenplus-recorte' },
]

function magick(args) {
  execFileSync('magick', args, { stdio: ['ignore', 'ignore', 'inherit'] })
}

async function extractFrames(frames = FRAMES) {
  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'content-type': 'text/html' })
      res.end('<!doctype html><body style="margin:0">')
      return
    }
    const file = path.join(SRC, path.normalize(decodeURIComponent(req.url)).replace(/^(\.\.[/\\])+/, ''))
    if (!file.startsWith(SRC) || !file.endsWith('.mp4') || !fs.existsSync(file)) {
      res.writeHead(404)
      res.end()
      return
    }
    const size = fs.statSync(file).size
    const range = req.headers.range?.replace('bytes=', '').split('-')
    const start = range ? Number(range[0]) : 0
    const end = range?.[1] ? Number(range[1]) : size - 1
    res.writeHead(range ? 206 : 200, {
      'content-type': 'video/mp4',
      'accept-ranges': 'bytes',
      'content-length': end - start + 1,
      ...(range ? { 'content-range': `bytes ${start}-${end}/${size}` } : {}),
    })
    fs.createReadStream(file, { start, end }).pipe(res)
  })
  await new Promise((resolve) => server.listen(0, resolve))
  const base = `http://localhost:${server.address().port}`

  const browser = await chromium.launch({ executablePath: CHROME, headless: true })
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } })
  await page.goto(base)
  for (const f of frames) {
    await page.evaluate(
      async ({ src, time, w, h }) => {
        document.body.innerHTML = ''
        const v = document.createElement('video')
        v.id = 'v'
        v.muted = true
        v.src = src
        v.style.cssText = `display:block;width:${w}px;height:${h}px`
        document.body.append(v)
        await new Promise((resolve) => v.addEventListener('loadeddata', resolve, { once: true }))
        await new Promise((resolve) => {
          v.addEventListener('seeked', resolve, { once: true })
          v.currentTime = time
        })
      },
      { src: `/${f.video}`, time: f.time, w: f.w ?? 576, h: f.h ?? 1024 },
    )
    await page.waitForTimeout(200)
    await page.locator('#v').screenshot({ path: path.join(tmp, f.name) })
  }
  await browser.close()
  server.close()
}

function buildPhotos(photos = PHOTOS) {
  for (const p of photos) {
    const input = p.src ? path.join(SRC, p.src) : path.join(tmp, p.frame)
    const crop = p.crop ? ['-crop', p.crop, '+repage'] : []
    for (const w of p.widths) {
      const base = path.join(OUT, `${p.out}-${w}`)
      const common = [input, ...crop, '-colorspace', 'sRGB', '-strip', '-resize', `${w}x>`]
      magick([...common, '-quality', '78', '-sampling-factor', '4:2:0', '-interlace', 'JPEG', `${base}.jpg`])
      magick([...common, '-quality', '74', `${base}.webp`])
      magick([...common, '-quality', '52', `${base}.avif`])
    }
  }
}

// Recursos del diseño (visual-pieces/diseno/, copiados sin cambios de Claude Design).
// Solo se escalan: se conserva el lienzo completo de cada imagen, como en el diseño.
const DESIGN_IMAGES = [
  { src: 'diseno/logo.png', widths: [420, 840], out: 'logo-diseno', formats: ['webp', 'png'] },
  { src: 'diseno/detox-jar.png', widths: [480, 820], out: 'detox-jar', formats: ['avif', 'webp', 'png'] },
  { src: 'diseno/colagen-jar.png', widths: [500, 1010], out: 'colagen-jar', formats: ['avif', 'webp', 'png'] },
  { src: 'diseno/esencia-bosque.png', widths: [480, 714], out: 'esencia-bosque', formats: ['avif', 'webp', 'jpg'] },
]
const QUALITY = { avif: ['-quality', '60'], webp: ['-quality', '82'], png: ['-define', 'png:compression-level=9'], jpg: ['-quality', '82', '-interlace', 'JPEG'] }

function buildDesignImages() {
  for (const d of DESIGN_IMAGES) {
    for (const w of d.widths) {
      for (const ext of d.formats) {
        magick([path.join(SRC, d.src), '-strip', '-resize', `${w}x`, ...QUALITY[ext], path.join(OUT, `${d.out}-${w}.${ext}`)])
      }
    }
  }
}

function buildCutouts() {
  for (const c of CUTOUTS) {
    const input = path.join(SRC, c.src)
    const trimmed = path.join(tmp, `${c.out}.png`)
    // Caja de los píxeles con opacidad ≥ 1 %: fuera de ella solo hay ruido invisible.
    const box = execFileSync('magick', [input, '-alpha', 'extract', '-threshold', '1%', '-format', '%@', 'info:'])
      .toString()
      .trim()
    magick([input, '-crop', box, '+repage', '-strip', trimmed])
    for (const w of c.widths) {
      const base = path.join(OUT, `${c.out}-${w}`)
      const common = [trimmed, '-resize', `${w}x`]
      magick([...common, '-quality', '80', '-define', 'webp:alpha-quality=100', `${base}.webp`])
      magick([...common, '-quality', '60', `${base}.avif`])
      magick([...common, '-define', 'png:compression-level=9', `${base}.png`])
    }
  }
}

function buildLogo() {
  const logo = path.join(SRC, 'logo.jpeg')
  // Recorte del logotipo completo (símbolo + nombre + lema) con margen blanco.
  for (const w of [300, 600]) {
    const base = path.join(OUT, `logo-${w}`)
    const common = [logo, '-crop', '860x352+111+364', '+repage', '-strip', '-resize', `${w}x`]
    magick([...common, '-quality', '88', '-interlace', 'JPEG', `${base}.jpg`])
    magick([...common, '-quality', '90', `${base}.webp`])
  }
  // Ícono del navegador: solo el símbolo, sobre blanco (mismo fondo del original).
  const symbol = path.join(tmp, 'symbol.png')
  magick([logo, '-crop', '280x300+100+360', '+repage', '-fuzz', '4%', '-trim', '+repage', symbol])
  for (const [size, name] of [[32, 'favicon-32.png'], [180, 'apple-touch-icon.png']]) {
    magick([
      symbol, '-background', 'white', '-gravity', 'center',
      '-resize', `${Math.round(size * 0.86)}x${Math.round(size * 0.86)}`,
      '-extent', `${size}x${size}`, '-strip', path.join(root, 'public', name),
    ])
  }
}

function buildHeroVideo() {
  fs.mkdirSync(path.join(OUT, 'video'), { recursive: true })
  execFileSync(
    'swift',
    [path.join(root, 'scripts', 'strip-audio.swift'), path.join(SRC, HERO_VIDEO.src), path.join(OUT, 'video', HERO_VIDEO.out)],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  )
}

function copyVideos() {
  fs.mkdirSync(path.join(OUT, 'video'), { recursive: true })
  // Sin recodificar: H.264/AAC con moov al inicio, ya apto para web.
  for (const v of VIDEOS) fs.copyFileSync(path.join(SRC, v.src), path.join(OUT, 'video', v.out))
}

fs.mkdirSync(OUT, { recursive: true })
if (process.argv.includes('--solo-recortes')) {
  buildCutouts()
} else if (process.argv.includes('--solo-portada')) {
  buildHeroVideo()
  await extractFrames(HERO_FRAMES)
  buildPhotos([HERO_POSTER])
} else if (process.argv.includes('--solo-diseno')) {
  buildDesignImages()
  buildHeroVideo()
  await extractFrames(HERO_FRAMES)
  buildPhotos([HERO_POSTER])
} else {
  await extractFrames([...FRAMES, ...HERO_FRAMES])
  buildPhotos([...PHOTOS, HERO_POSTER])
  buildCutouts()
  buildDesignImages()
  buildLogo()
  copyVideos()
  buildHeroVideo()
}
fs.rmSync(tmp, { recursive: true, force: true })
console.log('Derivados generados en public/media/')
