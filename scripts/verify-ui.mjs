// Revisión automática de la landing en Chrome (móvil, tableta y escritorio), según el diseño de
// Claude Design «Diseño dinámico Natures Wayco».
//
// Levanta `vite preview` sobre dist/ (ejecuta antes `npm run build`) y revisa: desbordamiento,
// anclas, enlaces de WhatsApp (sin abrirlos), imágenes, correspondencia producto–precio–envase,
// teclado, video de portada, movimiento (entradas, precio, línea) y movimiento reducido.
// Guarda capturas en docs/reports/capturas/<CAPTURAS>/.
//
// Uso: npm run build && npm run verify
//      CAPTURAS=fase-04 npm run verify   (otra carpeta de capturas)
//      BASE_URL=http://localhost:8080/ npm run verify   (contra un servidor ya en marcha, p. ej. el contenedor)
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SHOTS = path.join(root, 'docs', 'reports', 'capturas', process.env.CAPTURAS ?? 'fase-04')
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const PORT = 4179
const URL_BASE = process.env.BASE_URL ?? `http://localhost:${PORT}/`

const EXPECTED = {
  number: '573124475525',
  instagram: 'https://instagram.com/natures_wayco',
  products: [
    { id: 'detox', name: 'DetoxPlus', price: '$70.000', jar: 'detox-jar', text: 'Hola, quiero pedir DetoxPlus ($70.000 COP)' },
    { id: 'colagen', name: 'ColagenPlus', price: '$130.000', jar: 'colagen-jar', text: 'Hola, quiero pedir ColagenPlus ($130.000 COP)' },
  ],
}

// Los cinco primeros mantienen sus índices (se usan más abajo); el resto amplía la cobertura.
const VIEWPORTS = [
  { name: 'movil-320', width: 320, height: 640, mobile: true },
  { name: 'movil-375', width: 375, height: 812, mobile: true },
  { name: 'tableta-768', width: 768, height: 1024, mobile: true },
  { name: 'escritorio-1440', width: 1440, height: 900, mobile: false },
  { name: 'escritorio-2560', width: 2560, height: 1440, mobile: false },
  { name: 'movil-390', width: 390, height: 844, mobile: true },
  { name: 'movil-430', width: 430, height: 932, mobile: true },
  { name: 'escritorio-1024', width: 1024, height: 768, mobile: false },
  { name: 'escritorio-1280', width: 1280, height: 800, mobile: false },
  { name: 'movil-horizontal-844x390', width: 844, height: 390, mobile: true },
  // Zoom al 200 % de una ventana de 1440 × 900: 720 × 450 px CSS a densidad 2.
  { name: 'zoom-200', width: 720, height: 450, mobile: false, dpr: 2 },
]

const results = []
function check(name, ok, detail = '') {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'OK  ' : 'FALLA'} ${name}${detail ? ` — ${detail}` : ''}`)
}

async function startPreview() {
  if (process.env.BASE_URL) return null
  const proc = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: root, stdio: 'ignore' })
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(URL_BASE)).ok) return proc
    } catch {
      /* aún no responde */
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  proc.kill()
  throw new Error('vite preview no respondió')
}

async function waitScrollSettled(page) {
  let last = -1
  for (let i = 0; i < 40; i++) {
    const y = await page.evaluate(() => window.scrollY)
    if (y === last) return
    last = y
    await page.waitForTimeout(150)
  }
}

// Recorre la página para cargar imágenes diferidas y disparar las entradas del diseño.
async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.4
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 200))
    }
    const settle = (img) =>
      img.complete
        ? null
        : new Promise((r) => {
            img.addEventListener('load', r, { once: true })
            img.addEventListener('error', r, { once: true })
            setTimeout(r, 5000)
          })
    await Promise.all([...document.images].map(settle))
  })
  await page.waitForTimeout(1600) // las entradas duran hasta 1,1 s más su retardo
}

async function newPage(browser, vp, extra = {}) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dpr ?? (vp.mobile ? 2 : 1),
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    locale: 'es-CO',
    ...extra,
  })
  // Nunca salir del sitio: se bloquea cualquier solicitud externa.
  const external = []
  await context.route(/^https?:\/\/(?!localhost)/, (route) => {
    external.push(route.request().url())
    route.abort()
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  return { context, page, errors, external }
}

async function checkViewport(browser, vp) {
  const { context, page, errors, external } = await newPage(browser, vp)
  await page.goto(URL_BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: path.join(SHOTS, `${vp.name}-portada.png`) })
  await scrollThrough(page)

  const overflow = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    vw: document.documentElement.clientWidth,
  }))
  check(`[${vp.name}] sin desbordamiento horizontal`, overflow.scroll <= overflow.vw, `scrollWidth=${overflow.scroll}, ancho=${overflow.vw}`)

  const layout = await page.evaluate(() => {
    const hidden = (el) => el.closest('.visually-hidden, [aria-hidden="true"]')
    const visible = (el) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'
    }
    // Áreas táctiles: todo enlace y botón visible de al menos 44 × 44 px.
    const small = [...document.querySelectorAll('a, button')]
      .filter((el) => visible(el) && !hidden(el))
      .filter((el) => {
        const r = el.getBoundingClientRect()
        return r.width < 44 - 0.5 || r.height < 44 - 0.5
      })
      .map((el) => `${(el.getAttribute('aria-label') || el.textContent).trim().slice(0, 20)} ${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)}`)
    // Texto recortado por un contenedor con overflow oculto.
    const clipped = [...document.querySelectorAll('h1, h2, h3, h1 *, h2 *, h3 *, p, a, button')]
      .filter((el) => !hidden(el) && /(hidden|clip)/.test(getComputedStyle(el).overflowX) && el.scrollWidth > el.clientWidth + 1)
      .map((el) => el.textContent.trim().slice(0, 24))
    // Título: tres bloques, cada uno en una sola línea.
    const lines = [...document.querySelectorAll('.hero__line')].map((l) => {
      const inner = l.firstElementChild
      const lh = parseFloat(getComputedStyle(inner).lineHeight)
      return Math.round(inner.getBoundingClientRect().height / lh)
    })
    const title = document.querySelector('h1')
    // CTA de la portada: completos dentro de la portada.
    const hero = document.querySelector('header#top').getBoundingClientRect()
    const ctas = [...document.querySelectorAll('.hero__actions a')].map((a) => a.getBoundingClientRect())
    const ctasInside = ctas.every((r) => r.top >= hero.top && r.bottom <= hero.bottom && r.left >= 0 && r.right <= document.documentElement.clientWidth)
    return {
      small,
      clipped,
      lines,
      fontSize: getComputedStyle(title).fontSize,
      titleText: title.textContent.replace(/\s+/g, ' ').trim(),
      ctasInside,
      heroH: Math.round(hero.height),
    }
  })
  check(`[${vp.name}] áreas táctiles de al menos 44 × 44 px`, layout.small.length === 0, layout.small.join(', '))
  check(`[${vp.name}] sin texto recortado`, layout.clipped.length === 0, layout.clipped.join(' | '))
  check(
    `[${vp.name}] título en tres líneas («Bienestar» / «que se integra» / «a tu día»)`,
    layout.lines.length === 3 && layout.lines.every((n) => n === 1) && layout.titleText === 'Bienestar que se integra a tu día',
    `${layout.fontSize}, líneas ${layout.lines.join('/')}, «${layout.titleText}»`,
  )
  check(`[${vp.name}] CTA de portada completos y sin recortes`, layout.ctasInside, `portada ${layout.heroH} px`)

  const images = await page.evaluate(() =>
    [...document.images].map((img) => ({
      src: img.currentSrc.split('/').pop(),
      alt: img.getAttribute('alt'),
      w: img.getAttribute('width'),
      h: img.getAttribute('height'),
      loaded: img.complete && img.naturalWidth > 0,
    })),
  )
  const bad = images.filter((i) => !i.alt || !i.w || !i.h || !i.loaded)
  check(`[${vp.name}] imágenes con alt, dimensiones y carga correcta (${images.length})`, bad.length === 0, bad.map((i) => i.src).join(', '))
  if (vp.name === 'movil-375' || vp.name === 'escritorio-1440') {
    console.log(`     imágenes servidas: ${images.map((i) => i.src).join(', ')}`)
  }

  // Ningún elemento con entrada queda oculto tras recorrer la página.
  const stuck = await page.evaluate(() =>
    [...document.querySelectorAll('[data-r]')]
      .filter((el) => getComputedStyle(el).opacity !== '1' || el.style.transform !== 'none')
      .map((el) => el.textContent.trim().slice(0, 30)),
  )
  check(`[${vp.name}] todas las entradas terminan visibles`, stuck.length === 0, stuck.join(' | '))

  const rolled = await page.evaluate(() =>
    [...document.querySelectorAll('[data-count]')].map(
      (el) => 'rolled' in el.dataset && getComputedStyle(el.firstElementChild).transform === 'none',
    ),
  )
  check(`[${vp.name}] los precios terminan su animación`, rolled.length === 2 && rolled.every(Boolean))

  const line = await page.evaluate(() => {
    const l = document.querySelector('[data-line]')
    return { drawn: 'drawn' in l.dataset, transform: getComputedStyle(l).transform }
  })
  check(`[${vp.name}] la línea de la rutina se dibuja`, line.drawn && line.transform === 'none', JSON.stringify(line))

  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(SHOTS, `${vp.name}-final.png`) })
  for (const id of ['movil-375', 'escritorio-1440'].includes(vp.name) ? ['detox', 'colagen', 'rutina', 'esencia'] : []) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await page.locator(`#${id}`).screenshot({ path: path.join(SHOTS, `${vp.name}-${id}.png`) })
  }
  check(`[${vp.name}] sin errores en consola`, errors.length === 0, errors.join(' | '))
  check(`[${vp.name}] sin solicitudes externas`, external.length === 0, external.join(', '))
  await context.close()

  // Página completa a densidad 1× (a 2× se supera el límite de captura de Chrome).
  const full = await newPage(browser, vp, { deviceScaleFactor: 1 })
  await full.page.goto(URL_BASE, { waitUntil: 'networkidle' })
  await scrollThrough(full.page)
  await full.page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await full.page.waitForTimeout(500)
  await full.page.screenshot({ path: path.join(SHOTS, `${vp.name}-pagina.png`), fullPage: true })
  await full.context.close()
}

async function checkContentAndLinks(browser) {
  const { context, page } = await newPage(browser, VIEWPORTS[1])
  await page.goto(URL_BASE, { waitUntil: 'networkidle' })

  const anchors = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="#"]')].map((a) => ({
      href: a.getAttribute('href'),
      exists: !!document.getElementById(a.getAttribute('href').slice(1)),
    })),
  )
  const broken = anchors.filter((a) => !a.exists)
  check(`anclas internas válidas (${anchors.length})`, broken.length === 0, broken.map((b) => b.href).join(', '))

  const wa = await page.evaluate(() =>
    [...document.querySelectorAll('a[href*="wa.me"]')].map((a) => ({
      href: a.href,
      raw: a.getAttribute('href'),
      text: a.textContent.trim().replace(/\s+/g, ' '),
      target: a.target,
      rel: a.rel,
      section: a.closest('section')?.id ?? null,
    })),
  )
  for (const link of wa) {
    const url = new URL(link.href)
    const text = url.searchParams.get('text')
    const okNumber = url.hostname === 'wa.me' && url.pathname === `/${EXPECTED.number}`
    const product = EXPECTED.products.find((p) => p.id === link.section)
    const okText = product
      ? text === product.text && link.raw === `https://wa.me/${EXPECTED.number}?text=${encodeURIComponent(product.text)}`
      : text === null
    check(
      `WhatsApp «${link.text}»${product ? ` en #${product.id}` : ''}`,
      okNumber && okText && link.target === '_blank' && link.rel.includes('noopener'),
      product ? `mensaje: "${text}"` : 'sin mensaje precargado',
    )
  }
  const ig = await page.evaluate(() => [...document.querySelectorAll('a[href*="instagram"]')].map((a) => a.getAttribute('href')))
  check('enlaces de Instagram', ig.length === 2 && ig.every((h) => h === EXPECTED.instagram), ig.join(', '))

  for (const p of EXPECTED.products) {
    const info = await page.locator(`#${p.id}`).evaluate((el) => ({
      name: el.querySelector('h3')?.textContent,
      price: el.querySelector('[data-count]')?.textContent,
      jar: el.querySelector('img')?.getAttribute('src'),
    }))
    check(
      `${p.name}: nombre, precio y envase corresponden`,
      info.name === p.name && info.price === p.price && info.jar.includes(p.jar),
      `${info.name} | ${info.price} | ${info.jar}`,
    )
  }
  const order = await page.evaluate(() => [...document.querySelectorAll('section.product')].map((s) => s.id))
  check('DetoxPlus aparece antes que ColagenPlus', order.join(',') === 'detox,colagen', order.join(', '))

  const headings = await page.evaluate(() => [...document.querySelectorAll('h1, h2, h3')].map((h) => `${h.tagName}:${h.textContent.trim()}`))
  check('un solo h1', headings.filter((h) => h.startsWith('H1')).length === 1)
  console.log(`     títulos: ${headings.join(' / ')}`)
  await context.close()
}

async function checkKeyboard(browser) {
  for (const vp of [VIEWPORTS[1], VIEWPORTS[3]]) {
    const { context, page } = await newPage(browser, { ...vp, mobile: false })
    await page.goto(URL_BASE, { waitUntil: 'networkidle' })
    const stops = []
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab')
      await waitScrollSettled(page)
      await page.waitForTimeout(80)
      const info = await page.evaluate(() => {
        const el = document.activeElement
        if (el === document.body) return null
        const s = getComputedStyle(el)
        const r = el.getBoundingClientRect()
        return {
          label: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40),
          outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2,
          inViewport: r.bottom > 0 && r.top < window.innerHeight,
          tag: el.tagName.toLowerCase(),
        }
      })
      if (!info) break
      stops.push(info)
    }
    check(`[${vp.name}] primer Tab: enlace para saltar al contenido`, stops[0]?.label === 'Saltar al contenido')
    const noOutline = stops.filter((s) => !s.outline)
    check(`[${vp.name}] foco visible en ${stops.length} paradas de Tab`, noOutline.length === 0, noOutline.map((s) => s.label).join(', '))
    const offscreen = stops.filter((s) => !s.inViewport)
    check(`[${vp.name}] el elemento enfocado queda en pantalla`, offscreen.length === 0, offscreen.map((s) => s.label).join(', '))
    check(`[${vp.name}] el video no recibe foco`, !stops.some((s) => s.tag === 'video'))
    if (vp.name === 'movil-375') console.log(`     orden de foco: ${stops.slice(0, 12).map((s) => s.label).join(' → ')} …`)

    await page.goto(URL_BASE, { waitUntil: 'networkidle' })
    if (await page.locator('.nav__menu').isVisible()) {
      await page.locator('.nav__menu').focus()
      await page.keyboard.press('Enter')
    }
    await page.locator('.nav__link[href="#preguntas"]').focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(200)
    await waitScrollSettled(page)
    const nav = await page.evaluate(() => ({
      top: Math.round(document.getElementById('preguntas').getBoundingClientRect().top),
      hash: location.hash,
    }))
    check(`[${vp.name}] Enter en «Preguntas» lleva a la sección`, nav.hash === '#preguntas' && nav.top >= 0 && nav.top < 200, `top=${nav.top}`)

    const q = page.locator('.faq__question').nth(1)
    await q.focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(600)
    const faq = await page.evaluate(() => {
      const b = document.querySelectorAll('.faq__question')
      const p = document.getElementById(b[1].getAttribute('aria-controls'))
      return { first: b[0].getAttribute('aria-expanded'), second: b[1].getAttribute('aria-expanded'), h: Math.round(p.getBoundingClientRect().height) }
    })
    check(
      `[${vp.name}] pregunta frecuente se abre con teclado y cierra la anterior`,
      faq.second === 'true' && faq.first === 'false' && faq.h > 20,
      JSON.stringify(faq),
    )
    await context.close()
  }
}

async function checkMobileMenu(browser) {
  for (const vp of [VIEWPORTS[0], VIEWPORTS[1]]) {
    const { context, page } = await newPage(browser, { ...vp, mobile: false })
    await page.goto(URL_BASE, { waitUntil: 'networkidle' })
    const state = () =>
      page.evaluate(() => {
        const b = document.querySelector('.nav__menu')
        const panel = document.getElementById(b.getAttribute('aria-controls'))
        return {
          expanded: b.getAttribute('aria-expanded'),
          panel: getComputedStyle(panel).display,
          focus: document.activeElement === b ? 'botón' : document.activeElement.textContent.trim().slice(0, 20),
          navH: Math.round(document.querySelector('.nav').getBoundingClientRect().height),
        }
      })
    const closed = await state()
    await page.locator('.nav__menu').focus()
    await page.keyboard.press('Enter')
    const opened = await state()
    await page.keyboard.press('Tab')
    const firstLink = await page.evaluate(() => document.activeElement.textContent.trim())
    await page.screenshot({ path: path.join(SHOTS, `${vp.name}-menu-abierto.png`) })
    await page.keyboard.press('Escape')
    const escaped = await state()
    check(
      `[${vp.name}] menú móvil: abre con teclado, recorre enlaces y cierra con Escape devolviendo el foco`,
      closed.expanded === 'false' && closed.panel === 'none' && opened.expanded === 'true' && opened.panel === 'flex' &&
        firstLink === 'Productos' && escaped.expanded === 'false' && escaped.panel === 'none' && escaped.focus === 'botón',
      JSON.stringify({ barra: `${closed.navH} px`, abierto: opened.expanded, primerEnlace: firstLink, trasEscape: escaped }),
    )
    await page.click('.nav__menu')
    await page.click('.nav__link[href="#rutina"]')
    await page.waitForTimeout(300)
    await waitScrollSettled(page)
    const after = await state()
    const hash = await page.evaluate(() => location.hash)
    check(`[${vp.name}] menú móvil: un enlace navega y cierra el menú`, hash === '#rutina' && after.expanded === 'false', `${hash}, ${after.expanded}`)
    await page.click('.nav__menu')
    await page.mouse.click(vp.width / 2, vp.height - 40)
    const outside = await state()
    check(`[${vp.name}] menú móvil: se cierra al tocar fuera`, outside.expanded === 'false')
    await context.close()
  }
}

// Saltos de diseño durante la carga (CLS) con fuentes, imágenes y video.
async function checkLayoutShift(browser) {
  for (const vp of [VIEWPORTS[1], VIEWPORTS[3]]) {
    const { context, page } = await newPage(browser, vp)
    await page.addInitScript(() => {
      window.__cls = 0
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await page.goto(URL_BASE, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    const cls = await page.evaluate(() => +window.__cls.toFixed(4))
    check(`[${vp.name}] sin saltos de diseño al cargar (CLS < 0,1)`, cls < 0.1, `CLS ${cls}`)
    await context.close()
  }
}

async function checkHeroVideo(browser) {
  const { context, page, errors } = await newPage(browser, VIEWPORTS[1])
  await page.goto(URL_BASE, { waitUntil: 'networkidle' })
  const st = await page.evaluate(async () => {
    const v = document.querySelector('.hero__video')
    const t0 = v.currentTime
    await new Promise((r) => setTimeout(r, 1200))
    const s = getComputedStyle(v)
    return {
      paused: v.paused,
      advanced: +(v.currentTime - t0).toFixed(2),
      autoplay: v.autoplay,
      loop: v.loop,
      muted: v.muted,
      playsInline: v.playsInline,
      controls: v.controls,
      audioBytes: v.webkitAudioDecodedByteCount,
      size: `${v.videoWidth}×${v.videoHeight}`,
      fit: s.objectFit,
      transform: s.transform,
      ratio: +(v.getBoundingClientRect().width / v.getBoundingClientRect().height).toFixed(3),
      inside: v.getBoundingClientRect().left >= 0 && v.getBoundingClientRect().right <= document.documentElement.clientWidth + 0.5,
      hidden: v.getAttribute('aria-hidden'),
      tabIndex: v.tabIndex,
      poster: v.poster.split('/').pop(),
    }
  })
  check(
    'portada: video automático, en bucle, silenciado y en línea',
    !st.paused && st.advanced > 0.8 && st.autoplay && st.loop && st.muted && st.playsInline && !st.controls,
    `avanzó ${st.advanced} s en 1,2 s, ${st.size}`,
  )
  check('portada: sin sonido (0 bytes de audio decodificados)', st.audioBytes === 0, String(st.audioBytes))
  check(
    'portada: video completo (16:9, contain, sin escala ni recorte) y decorativo',
    st.fit === 'contain' && st.transform === 'none' && Math.abs(st.ratio - 16 / 9) < 0.01 && st.inside && st.hidden === 'true' && st.tabIndex === -1,
    JSON.stringify({ fit: st.fit, transform: st.transform, ratio: st.ratio, poster: st.poster }),
  )

  const state = () =>
    page.evaluate(() => ({
      paused: document.querySelector('.hero__video').paused,
      label: document.querySelector('.hero__toggle').getAttribute('aria-label'),
      icon: document.querySelector('.hero__toggle').textContent,
    }))
  const scrollTo = async (y) => {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
    await page.waitForTimeout(600)
  }
  await scrollTo(3000)
  const away = await state()
  await scrollTo(0)
  const back = await state()
  check('portada: se pausa fuera de pantalla y reanuda al volver', away.paused && !back.paused, JSON.stringify({ away: away.paused, back: back.paused }))

  await page.click('.hero__toggle')
  await page.waitForTimeout(300)
  const manual = await state()
  await scrollTo(3000)
  await scrollTo(0)
  const manualBack = await state()
  await page.click('.hero__toggle')
  await page.waitForTimeout(600)
  const resumed = await state()
  check(
    'portada: control de pausa (▶ / ❚❚), pausa manual respetada al volver',
    manual.paused && manual.label === 'Reproducir video' && manual.icon === '▶' && manualBack.paused &&
      !resumed.paused && resumed.label === 'Pausar video' && resumed.icon === '❚❚',
    JSON.stringify({ manual, manualBack: manualBack.paused, resumed }),
  )

  const tab = await page.evaluate(async () => {
    const setHidden = (hidden) => {
      Object.defineProperty(document, 'hidden', { value: hidden, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    }
    const v = document.querySelector('.hero__video')
    setHidden(true)
    await new Promise((r) => setTimeout(r, 300))
    const hiddenPaused = v.paused
    setHidden(false)
    await new Promise((r) => setTimeout(r, 600))
    return { hiddenPaused, visiblePlaying: !v.paused }
  })
  check('portada: se pausa con la pestaña oculta y reanuda al volver', tab.hiddenPaused && tab.visiblePlaying, JSON.stringify(tab))

  for (const [text, hash] of [['Conoce DetoxPlus', '#detox'], ['Ver productos', '#productos']]) {
    await scrollTo(0)
    await page.waitForTimeout(600)
    await page.click(`.hero__actions a:has-text("${text}")`)
    await page.waitForTimeout(600)
    const h = await page.evaluate(() => location.hash)
    check(`portada: «${text}» lleva a ${hash}`, h === hash, h)
  }
  check('portada: sin errores en consola', errors.length === 0, errors.join(' | '))
  await context.close()

  // Fallo de carga: queda el fondo y el texto, sin errores sin manejar.
  {
    const { context, page } = await newPage(browser, VIEWPORTS[1])
    const pageErrors = []
    page.on('pageerror', (e) => pageErrors.push(e.message))
    await page.route('**/home-background.mp4', (route) => route.abort())
    await page.goto(URL_BASE, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    const fail = await page.evaluate(() => ({
      label: document.querySelector('.hero__toggle').getAttribute('aria-label'),
      title: getComputedStyle(document.querySelector('.hero__line > span')).opacity,
    }))
    await page.screenshot({ path: path.join(SHOTS, 'movil-375-portada-sin-video.png') })
    check(
      'portada: si el video falla quedan el fondo y el texto, sin errores',
      pageErrors.length === 0 && fail.title === '1',
      JSON.stringify({ ...fail, errores: pageErrors.length }),
    )
    await context.close()
  }
}

async function checkReducedMotion(browser) {
  const { context, page } = await newPage(browser, VIEWPORTS[1], { reducedMotion: 'reduce' })
  await page.goto(URL_BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const st = await page.evaluate(() => {
    const v = document.querySelector('.hero__video')
    const hiddenEls = [...document.querySelectorAll('[data-r]')].filter(
      (el) => getComputedStyle(el).opacity !== '1' || el.style.transform,
    )
    return {
      paused: v.paused,
      autoplay: v.autoplay,
      label: document.querySelector('.hero__toggle').getAttribute('aria-label'),
      entradasOcultas: hiddenEls.length,
      cinta: getComputedStyle(document.querySelector('.ticker__track')).animationName,
      linea: getComputedStyle(document.querySelector('[data-line]')).transform,
      motion: document.querySelector('.page').dataset.motion ?? 'off',
    }
  })
  check(
    'movimiento reducido: sin entradas, cinta ni paralaje; línea completa; video en pausa con su póster',
    st.paused && !st.autoplay && st.label === 'Reproducir video' && st.entradasOcultas === 0 && st.cinta === 'none' &&
      st.linea === 'none' && st.motion === 'off',
    JSON.stringify(st),
  )
  await page.click('.hero__toggle')
  await page.waitForTimeout(1200)
  const after = await page.evaluate(() => ({
    paused: document.querySelector('.hero__video').paused,
    label: document.querySelector('.hero__toggle').getAttribute('aria-label'),
  }))
  check('movimiento reducido: el video se reproduce solo al pedirlo', !after.paused && after.label === 'Pausar video', JSON.stringify(after))
  await page.screenshot({ path: path.join(SHOTS, 'movil-375-movimiento-reducido.png') })
  await context.close()
}

// Contraste del texto oscuro de la portada sobre los píxeles reales (video + degradados), con el
// texto oculto, al inicio, a la mitad y al final del clip. Las palabras en verde y ámbar del
// titular son colores del diseño y se reportan aparte.
async function checkHeroContrast(browser) {
  for (const vp of [VIEWPORTS[1], VIEWPORTS[2], VIEWPORTS[3], VIEWPORTS[4]]) {
    const { context, page } = await newPage(browser, { ...vp, mobile: false }, { deviceScaleFactor: 1 })
    await page.goto(URL_BASE, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    const duration = await page.evaluate(() => document.querySelector('.hero__video').duration)
    for (const [label, t] of [['inicio', 0.1], ['mitad', duration / 2], ['final', duration - 0.15]]) {
      await page.evaluate(async (time) => {
        const v = document.querySelector('.hero__video')
        v.pause()
        await new Promise((r) => {
          v.addEventListener('seeked', r, { once: true })
          v.currentTime = time
        })
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      }, t)
      await page.locator('header#top').screenshot({ path: path.join(SHOTS, `${vp.name}-portada-${label}.png`) })
      await page.evaluate(() => {
        for (const el of document.querySelectorAll('.hero__title, .hero__lead, .hero__green, .hero__amber')) el.style.color = 'transparent'
      })
      const shot = (await page.locator('header#top').screenshot()).toString('base64')
      const ratios = await page.evaluate(async (b64) => {
        const img = new Image()
        img.src = `data:image/png;base64,${b64}`
        await img.decode()
        const c = document.createElement('canvas')
        c.width = img.width
        c.height = img.height
        const ctx = c.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const lin = (x) => ((x /= 255) <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
        const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
        const hero = document.querySelector('header#top').getBoundingClientRect()
        const out = {}
        for (const [key, sel, color] of [
          ['titular', '.hero__line', [28, 43, 34]],
          ['texto', '.hero__lead', [51, 67, 58]],
        ]) {
          const r = document.querySelector(sel).getBoundingClientRect()
          const d = ctx.getImageData(Math.round(r.left - hero.left), Math.round(r.top - hero.top), Math.round(r.width), Math.round(r.height)).data
          const v = []
          for (let i = 0; i < d.length; i += 4) v.push(lum(d[i], d[i + 1], d[i + 2]))
          v.sort((a, b) => a - b)
          const bg = v[Math.floor(v.length * 0.01)]
          const fg = lum(...color)
          out[key] = +((Math.max(bg, fg) + 0.05) / (Math.min(bg, fg) + 0.05)).toFixed(2)
        }
        return out
      }, shot)
      await page.evaluate(() => {
        for (const el of document.querySelectorAll('.hero__title, .hero__lead, .hero__green, .hero__amber')) el.style.color = ''
      })
      check(
        `[${vp.name}] contraste del texto oscuro de portada ${label === 'mitad' ? 'a la mitad' : `al ${label}`} del clip`,
        ratios.titular >= 3 && ratios.texto >= 4.5,
        `titular ${ratios.titular}:1 (mín. 3), texto ${ratios.texto}:1 (mín. 4,5)`,
      )
    }
    await context.close()
  }
}

fs.mkdirSync(SHOTS, { recursive: true })
const server = await startPreview()
const browser = await chromium.launch({ executablePath: CHROME, headless: true })
try {
  for (const vp of VIEWPORTS) await checkViewport(browser, vp)
  await checkContentAndLinks(browser)
  await checkKeyboard(browser)
  await checkMobileMenu(browser)
  await checkLayoutShift(browser)
  await checkHeroVideo(browser)
  await checkReducedMotion(browser)
  await checkHeroContrast(browser)
} finally {
  await browser.close()
  server?.kill()
}
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} verificaciones correctas`)
process.exit(failed.length ? 1 : 0)
