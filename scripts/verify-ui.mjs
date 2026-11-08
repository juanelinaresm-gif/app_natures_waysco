// Revisión automática de la landing en Chrome (móvil, tableta y escritorio), según el diseño de
// Claude Design «Diseño dinámico Natures Wayco».
//
// Levanta `vite preview` sobre dist/ (ejecuta antes `npm run build`) y revisa: desbordamiento,
// anclas y desplazamiento suave bajo la barra, enlaces de WhatsApp con su mensaje (sin abrirlos),
// imágenes, correspondencia producto–precio–envase, teclado, video de portada, movimiento
// (entradas, precio, línea) y movimiento reducido.
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
    { id: 'detox', name: 'DetoxPlus', price: '$70.000', jar: 'detox-jar', text: 'Hola, quiero pedir DetoxPlus ($70.000 COP). ¿Me confirman disponibilidad y envío?' },
    { id: 'colagen', name: 'ColagenPlus', price: '$103.000', jar: 'colagen-jar', text: 'Hola, quiero pedir ColagenPlus ($103.000 COP). ¿Me confirman disponibilidad y envío?' },
  ],
  // Accesos generales a WhatsApp, por lugar de la página.
  messages: {
    barra: 'Hola, me gustaría conocer más sobre los productos de Nature’s Wayco.',
    menú: 'Hola, me gustaría conocer más sobre los productos de Nature’s Wayco.',
    flotante: 'Hola, me gustaría recibir información sobre Nature’s Wayco.',
    contacto: 'Hola, me gustaría recibir orientación para elegir entre DetoxPlus y ColagenPlus.',
    pie: 'Hola, me gustaría recibir información sobre Nature’s Wayco.',
  },
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
    const lines = [...document.querySelectorAll('.hero__line')].filter((l) => l.getClientRects().length).map((l) => {
      const inner = l.firstElementChild
      const lh = parseFloat(getComputedStyle(inner).lineHeight)
      return Math.round(inner.getBoundingClientRect().height / lh)
    })
    const title = document.querySelector('h1')
    // CTA de la portada: completos dentro de la portada.
    const hero = document.querySelector('header#top').getBoundingClientRect()
    const ctas = [...document.querySelectorAll('.hero__actions a')].map((a) => a.getBoundingClientRect())
    const ctasInside = ctas.every((r) => r.top >= hero.top && r.bottom <= hero.bottom && r.left >= 0 && r.right <= document.documentElement.clientWidth)
    // Composición: título, texto, CTA y control de video dentro de la portada y sin solaparse;
    // el contenido sin opacidad parcial; el video como capa absoluta, fuera del flujo.
    const rect = (sel) => document.querySelector(sel).getBoundingClientRect()
    const parts = [
      ['título', rect('.hero__title')],
      ['texto', rect('.hero__lead')],
      ...ctas.map((r, i) => [`CTA ${i + 1}`, r]),
      ['control', rect('.hero__toggle')],
    ].filter(([, r]) => r.width > 0)
    const meets = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5
    const overlaps = []
    for (let i = 0; i < parts.length; i++)
      for (let j = i + 1; j < parts.length; j++) if (meets(parts[i][1], parts[j][1])) overlaps.push(`${parts[i][0]}/${parts[j][0]}`)
    const outside = parts.filter(([, r]) => r.top < hero.top - 0.5 || r.bottom > hero.bottom + 0.5).map(([n]) => n)
    const faded = []
    for (let el = document.querySelector('.hero__lead'); el && el !== document.body; el = el.parentElement)
      if (getComputedStyle(el).opacity !== '1') faded.push(el.className || el.tagName)
    const visual = getComputedStyle(document.querySelector('.hero__visual')).position
    return {
      overlaps,
      outside,
      faded,
      visual,
      small,
      clipped,
      lines,
      fontSize: getComputedStyle(title).fontSize,
      titleText: title.innerText.replace(/\s+/g, ' ').trim(),
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
  check(
    `[${vp.name}] portada: título, texto, CTA y control dentro y sin solaparse`,
    layout.overlaps.length === 0 && layout.outside.length === 0,
    [...layout.overlaps.map((o) => `solapa ${o}`), ...layout.outside.map((o) => `fuera ${o}`)].join(', '),
  )
  check(
    `[${vp.name}] portada: contenido opaco y video como capa absoluta`,
    layout.faded.length === 0 && layout.visual === 'absolute',
    JSON.stringify({ opacidad: layout.faded, video: layout.visual }),
  )

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
      .filter((el) => el.getClientRects().length)
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
      place: a.closest('.nav')
        ? 'barra'
        : a.closest('.menu')
          ? 'menú'
          : a.closest('.wa-bar')
            ? 'flotante'
            : a.closest('.hablamos')
              ? 'contacto'
              : a.closest('footer')
                ? 'pie'
                : (a.closest('section')?.id ?? null),
    })),
  )
  check(
    'siete accesos a WhatsApp (barra, menú móvil, barra flotante, dos productos, contacto y pie)',
    wa.length === 7,
    wa.map((l) => l.place).join(', '),
  )
  for (const link of wa) {
    const url = new URL(link.href)
    const text = url.searchParams.get('text')
    const okNumber = url.hostname === 'wa.me' && url.pathname === `/${EXPECTED.number}`
    const product = EXPECTED.products.find((p) => p.id === link.place)
    const expected = product ? product.text : EXPECTED.messages[link.place]
    const okText = !!expected && text === expected && link.raw === `https://wa.me/${EXPECTED.number}?text=${encodeURIComponent(expected)}`
    check(
      `WhatsApp «${link.text}» en ${product ? `#${product.id}` : link.place}`,
      okNumber && okText && link.target === '_blank' && link.rel.includes('noopener'),
      `mensaje: "${text}"`,
    )
  }
  // El precio de cada mensaje de pedido coincide con el visible en su ficha (misma fuente).
  for (const p of EXPECTED.products) {
    const shown = await page.locator(`#${p.id} .visually-hidden`).first().textContent()
    const link = wa.find((l) => l.place === p.id)
    const text = link ? new URL(link.href).searchParams.get('text') : ''
    check(`${p.name}: el precio del mensaje es el de la ficha`, shown.includes(`${p.price} COP`) && text.includes(`(${p.price} COP)`), `ficha «${shown}»`)
  }
  const faq = await page.evaluate(() => document.querySelector('#preguntas').textContent)
  check('preguntas frecuentes con los precios vigentes', faq.includes('$70.000 COP') && faq.includes('$103.000 COP') && !faq.includes('130.000'))
  const ig = await page.evaluate(() => [...document.querySelectorAll('a[href*="instagram"]')].map((a) => a.getAttribute('href')))
  check('enlaces de Instagram (contacto, pie y menú móvil)', ig.length === 3 && ig.every((h) => h === EXPECTED.instagram), ig.join(', '))

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
          // Foco no tapado por la barra flotante de WhatsApp (salvo sus propios elementos).
          covered: (() => {
            const bar = document.querySelector('.wa-bar.is-shown')
            if (!bar || bar.contains(el)) return false
            const b = bar.getBoundingClientRect()
            return r.bottom > b.top + 1 && r.top < b.bottom && r.right > b.left && r.left < b.right
          })(),
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
    const covered = stops.filter((s) => s.covered)
    check(`[${vp.name}] el foco no queda tapado por la barra flotante`, covered.length === 0, covered.map((s) => s.label).join(', '))
    check(`[${vp.name}] el video no recibe foco`, !stops.some((s) => s.tag === 'video'))
    if (vp.name === 'movil-375') console.log(`     orden de foco: ${stops.slice(0, 12).map((s) => s.label).join(' → ')} …`)

    await page.goto(URL_BASE, { waitUntil: 'networkidle' })
    const mobileMenu = await page.locator('.nav__menu').isVisible()
    if (mobileMenu) {
      await page.locator('.nav__menu').focus()
      await page.keyboard.press('Enter')
      await page.waitForTimeout(900)
    }
    await page.locator(`${mobileMenu ? '.menu__link' : '.nav__link'}[href="#preguntas"]`).focus()
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

// Menú móvil a pantalla completa, con teclado: el foco entra al abrir, Tab no sale del menú,
// Escape lo cierra y devuelve el foco al botón, la página no se desplaza debajo y, cerrado, queda
// inerte (fuera del foco y del árbol de accesibilidad).
async function checkMobileMenu(browser) {
  for (const vp of [VIEWPORTS[0], VIEWPORTS[1]]) {
    const { context, page } = await newPage(browser, { ...vp, mobile: false })
    await page.goto(URL_BASE, { waitUntil: 'networkidle' })
    const state = () =>
      page.evaluate(() => {
        const b = document.querySelector('.nav__menu')
        const menu = document.getElementById(b.getAttribute('aria-controls'))
        const a = document.activeElement
        return {
          expanded: b.getAttribute('aria-expanded'),
          inert: menu.inert,
          dialog: `${menu.getAttribute('role')}/${menu.getAttribute('aria-modal')}`,
          focus: a === b ? 'botón' : menu.contains(a) ? `menú: ${(a.getAttribute('aria-label') || a.textContent).trim().slice(0, 24)}` : a.tagName,
          locked: getComputedStyle(document.documentElement).overflow === 'hidden',
          navH: Math.round(document.querySelector('.nav').getBoundingClientRect().height),
        }
      })
    const closed = await state()
    await page.locator('.nav__menu').focus()
    await page.keyboard.press('Enter')
    await page.waitForTimeout(100)
    const opened = await state()
    await page.keyboard.press('Tab')
    const firstLink = (await state()).focus
    await page.keyboard.press('Shift+Tab')
    await page.keyboard.press('Shift+Tab')
    const wrapped = (await state()).focus
    await page.waitForTimeout(1300)
    await page.screenshot({ path: path.join(SHOTS, `${vp.name}-menu-abierto.png`) })
    await page.keyboard.press('Escape')
    const escaped = await state()
    await page.waitForTimeout(900)
    const settled = await state()
    check(
      `[${vp.name}] menú móvil: diálogo con foco dentro, Tab sin salir, Escape cierra y devuelve el foco; página fija mientras está abierto`,
      closed.expanded === 'false' && closed.inert && opened.expanded === 'true' && !opened.inert && opened.dialog === 'dialog/true' &&
        opened.focus === 'menú: Cerrar menú' && opened.locked && firstLink.includes('Productos') && wrapped.includes('Instagram') &&
        escaped.expanded === 'false' && escaped.focus === 'botón' && !escaped.locked && settled.inert,
      JSON.stringify({ barra: `${closed.navH} px`, abierto: opened, primerEnlace: firstLink, alVolver: wrapped, trasEscape: escaped.focus, inerte: settled.inert }),
    )
    await page.click('.nav__menu')
    await page.waitForTimeout(1300)
    await page.click('.menu__link[href="#rutina"]')
    await page.waitForTimeout(300)
    await waitScrollSettled(page)
    const after = await state()
    const hash = await page.evaluate(() => location.hash)
    check(
      `[${vp.name}] menú móvil: un enlace cierra el menú, libera la página y navega`,
      hash === '#rutina' && after.expanded === 'false' && !after.locked,
      `${hash}, ${after.expanded}`,
    )
    await context.close()
  }
}

// Navegación interna (barra, menú móvil, portada, pie y logo). Se registra scrollY en cada cuadro
// desde el clic: con movimiento normal debe haber varios cuadros intermedios (desplazamiento suave)
// y con movimiento reducido el primer cuadro ya está en el destino. Al terminar: hash actualizado,
// la sección empieza justo bajo la barra y su título queda visible. En móvil, el menú está cerrado
// desde el primer cuadro y ni la barra ni la página cambian de alto (sin saltos).
async function checkSmoothScroll(browser, reduced = false) {
  const tag = reduced ? 'movimiento reducido' : 'navegación suave'
  const viewports = reduced ? [VIEWPORTS[1], VIEWPORTS[3]] : [VIEWPORTS[0], VIEWPORTS[1], VIEWPORTS[2], VIEWPORTS[3]]
  for (const vp of viewports) {
    const { context, page, errors } = await newPage(browser, vp, reduced ? { reducedMotion: 'reduce' } : {})
    await page.goto(URL_BASE, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    const behavior = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)
    check(`[${vp.name}] ${tag}: scroll-behavior ${reduced ? 'auto' : 'smooth'}`, behavior === (reduced ? 'auto' : 'smooth'), behavior)
    const menu = await page.locator('.nav__menu').isVisible()
    const ids = ['#productos', '#rutina', '#esencia', '#preguntas']
    const cases = [
      ...ids.map((href) => ({
        group: menu ? 'menú' : 'barra',
        from: 'top',
        sel: `${menu ? '.menu__link' : '.nav__link'}[href="${href}"]`,
        href,
        openMenu: menu,
      })),
      { group: 'portada', from: 'top', sel: '.hero__cta', href: '#detox' },
      { group: 'portada', from: 'top', sel: '.hero__ghost', href: '#productos' },
      ...ids.map((href) => ({ group: 'pie', from: 'end', sel: `.footer__link[href="${href}"]`, href })),
      { group: 'logo', from: 'mid', sel: '.nav__logo', href: '#top' },
    ]
    const bad = []
    let frames = []
    for (const c of reduced ? cases.filter((_, i) => i === 0 || i === 4 || i === 9) : cases) {
      await page.evaluate((from) => {
        const max = document.documentElement.scrollHeight - innerHeight
        window.scrollTo({ top: from === 'end' ? max : from === 'mid' ? max / 2 : 0, behavior: 'instant' })
      }, c.from)
      await page.waitForTimeout(300)
      if (c.openMenu) {
        await page.click('.nav__menu')
        await page.waitForTimeout(reduced ? 200 : 1300)
      }
      await page.evaluate(() => {
        const s = (window.__frames = [])
        const btn = document.querySelector('.nav__menu')
        const mobileMenu = getComputedStyle(btn).display !== 'none'
        const nav = document.querySelector('.nav')
        const tick = (t0) => () => {
          s.push({
            y: Math.round(scrollY),
            open: mobileMenu && btn.getAttribute('aria-expanded') === 'true',
            navH: Math.round(nav.getBoundingClientRect().height),
            docH: document.documentElement.scrollHeight,
          })
          if (performance.now() - t0 < 2500) requestAnimationFrame(tick(t0))
        }
        // Fase de captura: corre antes que React y antes de que el navegador siga el enlace.
        document.addEventListener('click', () => {
          window.__startY = Math.round(scrollY)
          requestAnimationFrame(tick(performance.now()))
        }, { once: true, capture: true })
      })
      if (vp.mobile) await page.tap(c.sel)
      else await page.click(c.sel)
      await page.waitForTimeout(400)
      await waitScrollSettled(page)
      await page.waitForTimeout(2200)
      const r = await page.evaluate((href) => {
        const t = document.getElementById(href.slice(1))
        const nav = document.querySelector('.nav').getBoundingClientRect()
        const h = t.querySelector('h1, h2, h3').getBoundingClientRect()
        const max = document.documentElement.scrollHeight - innerHeight
        return {
          hash: location.hash,
          top: Math.round(t.getBoundingClientRect().top),
          navBottom: Math.round(nav.bottom),
          headTop: Math.round(h.top),
          atEnd: Math.abs(scrollY - max) < 2,
          vh: innerHeight,
          start: window.__startY,
          end: Math.round(scrollY),
          frames: window.__frames,
        }
      }, c.href)
      const ys = r.frames.map((f) => f.y)
      const between = new Set(ys.filter((y) => y !== r.start && y !== r.end)).size
      const problems = []
      if (r.hash !== c.href) problems.push(`hash ${r.hash}`)
      if (!(Math.abs(r.top - r.navBottom) <= 2 || (r.atEnd && r.top >= r.navBottom - 2))) problems.push(`sección a ${r.top - r.navBottom} px de la barra`)
      if (!(r.headTop >= r.navBottom - 1 && r.headTop < r.vh)) problems.push(`título en ${r.headTop} (barra ${r.navBottom})`)
      if (r.start === r.end) problems.push('no se desplazó')
      else if (reduced ? ys[0] !== r.end : between < 4) problems.push(reduced ? `primer cuadro en ${ys[0]}, destino ${r.end}` : `solo ${between} cuadros intermedios`)
      if (c.openMenu) {
        if (r.frames.some((f) => f.open)) problems.push('menú abierto durante el desplazamiento')
        if (new Set(r.frames.map((f) => `${f.navH}/${f.docH}`)).size > 1) problems.push('cambió el alto de la barra o de la página')
      }
      if (problems.length) bad.push(`${c.group} ${c.href}: ${problems.join(', ')}`)
      if (c.group === 'portada' && c.href === '#detox') frames = ys
      if (!reduced && ['menú', 'barra'].includes(c.group) && ['movil-375', 'escritorio-1440'].includes(vp.name)) {
        await page.screenshot({ path: path.join(SHOTS, `${vp.name}-ancla-${c.href.slice(1)}.png`) })
      }
    }
    check(
      `[${vp.name}] ${tag}: ${menu ? 'menú' : 'barra'}, portada, pie y logo llegan a su sección con el título visible bajo la barra`,
      bad.length === 0,
      bad.length ? bad.join(' | ') : `«Conoce DetoxPlus»: ${frames.length} cuadros, ${frames[0]} → ${frames.at(-1)} px`,
    )
    if (!reduced && vp === VIEWPORTS[3]) {
      // El scroll manual no se intercepta: la rueda desplaza la página.
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await page.mouse.move(vp.width / 2, vp.height / 2)
      await page.mouse.wheel(0, 700)
      await page.waitForTimeout(800)
      const y = await page.evaluate(() => scrollY)
      check(`[${vp.name}] el scroll manual con la rueda sigue funcionando`, y > 500, `scrollY ${y}`)
    }
    check(`[${vp.name}] ${tag}: sin errores en consola`, errors.length === 0, errors.join(' | '))
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
  let { context, page, errors } = await newPage(browser, VIEWPORTS[1])
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
      // La caja del video ocupa el 70 % inferior de la portada, a todo el ancho; fracción del
      // ancho del cuadro que queda a la vista.
      box: (() => {
        const a = v.getBoundingClientRect()
        const b = document.querySelector('header#top').getBoundingClientRect()
        return {
          bottom: ['left', 'right', 'bottom'].every((k) => Math.abs(a[k] - b[k]) < 1),
          top: +((a.top - b.top) / b.height).toFixed(2),
          shown: +(a.width / ((a.height * 16) / 9)).toFixed(2),
        }
      })(),
      toggle: getComputedStyle(document.querySelector('.hero__toggle')).display,
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
    'portada móvil: video de fondo en el 70 % inferior (cover, sin escala, ≥ 38 % del ancho del cuadro) y decorativo',
    st.fit === 'cover' && st.transform === 'none' && st.box.bottom && st.box.top === 0.3 && st.box.shown >= 0.38 &&
      st.hidden === 'true' && st.tabIndex === -1,
    JSON.stringify({ fit: st.fit, ...st.box, poster: st.poster }),
  )
  check('portada móvil: sin control de pausa, el video queda en bucle', st.toggle === 'none' && st.loop, `control ${st.toggle}`)

  // El control de pausa solo existe en escritorio: el resto de pruebas del video se hacen ahí.
  await context.close()
  ;({ context, page, errors } = await newPage(browser, VIEWPORTS[3]))
  await page.goto(URL_BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)

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
  await page.screenshot({ path: path.join(SHOTS, 'movil-375-movimiento-reducido.png') })
  await context.close()

  // En escritorio, el control de pausa reproduce el video solo cuando se pide.
  const desk = await newPage(browser, VIEWPORTS[3], { reducedMotion: 'reduce' })
  await desk.page.goto(URL_BASE, { waitUntil: 'networkidle' })
  await desk.page.waitForTimeout(800)
  await desk.page.click('.hero__toggle')
  await desk.page.waitForTimeout(1200)
  const after = await desk.page.evaluate(() => ({
    paused: document.querySelector('.hero__video').paused,
    label: document.querySelector('.hero__toggle').getAttribute('aria-label'),
  }))
  check(
    '[escritorio-1440] movimiento reducido: el video se reproduce solo al pedirlo',
    !after.paused && after.label === 'Pausar video',
    JSON.stringify(after),
  )
  await desk.context.close()
}

// Contraste del texto de la portada sobre los píxeles reales (video + degradados), con el texto
// oculto, en varios cuadros del clip. Móvil y tableta: texto claro sobre el degradado verde, con
// sus palabras en lima y naranja, en ocho cuadros (incluidos los más claros). Escritorio: texto
// oscuro del diseño al inicio, a la mitad y al final (sus palabras de color se reportan aparte).
// El fondo de comparación es el píxel menos favorable (percentil 1 o 99) bajo cada texto.
async function checkHeroContrast(browser) {
  const MOBILE = ['movil-320', 'movil-375', 'movil-390', 'movil-430', 'tableta-768', 'movil-horizontal-844x390', 'zoom-200']
  const targets = (vp) =>
    MOBILE.includes(vp.name)
      ? [
          ['titular', '.hero__line', 3],
          ['«integra»', '.hero__green', 3],
          ['«día»', '.hero__amber', 3],
          ['texto', '.hero__lead', 4.5],
          ['«Ver productos»', '.hero__ghost', 4.5],
        ]
      : [
          ['titular', '.hero__line', 3],
          ['texto', '.hero__lead', 4.5],
        ]
  const hide = '.hero__title, .hero__lead, .hero__green, .hero__amber, .hero__ghost'
  const DESKTOP = ['escritorio-1440', 'escritorio-2560']
  for (const vp of VIEWPORTS.filter((v) => [...MOBILE, ...DESKTOP].includes(v.name))) {
    const { context, page } = await newPage(browser, { ...vp, mobile: false }, { deviceScaleFactor: 1 })
    await page.goto(URL_BASE, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    const duration = await page.evaluate(() => document.querySelector('.hero__video').duration)
    const times = Array.from({ length: 8 }, (_, i) => +(0.1 + ((duration - 0.25) * i) / 7).toFixed(2))
    const worst = {}
    for (const t of times) {
      await page.evaluate(async (time) => {
        const v = document.querySelector('.hero__video')
        v.pause()
        await new Promise((r) => {
          v.addEventListener('seeked', r, { once: true })
          v.currentTime = time
        })
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      }, t)
      await page.locator('header#top').screenshot({ path: path.join(SHOTS, `${vp.name}-portada-${t.toFixed(1)}s.png`) })
      const colors = await page.evaluate(
        ([list, sel]) => {
          const out = list.map(([, s]) => getComputedStyle(document.querySelector(s)).color.match(/\d+/g).slice(0, 3).map(Number))
          // Sin transición: «Ver productos» anima su color y la captura llegaría a mitad de camino.
          for (const el of document.querySelectorAll(sel)) Object.assign(el.style, { transition: 'none', color: 'transparent' })
          return out
        },
        [targets(vp), hide],
      )
      const shot = (await page.locator('header#top').screenshot()).toString('base64')
      const ratios = await page.evaluate(
        async ([b64, list, colors]) => {
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
          return list.map(([, sel], i) => {
            const r = document.querySelector(sel).getBoundingClientRect()
            const d = ctx.getImageData(Math.round(r.left - hero.left), Math.round(r.top - hero.top), Math.round(r.width), Math.round(r.height)).data
            const v = []
            for (let k = 0; k < d.length; k += 4) v.push(lum(d[k], d[k + 1], d[k + 2]))
            v.sort((a, b) => a - b)
            const fg = lum(...colors[i])
            const bg = fg > v[v.length >> 1] ? v[Math.floor(v.length * 0.99)] : v[Math.floor(v.length * 0.01)]
            return +((Math.max(bg, fg) + 0.05) / (Math.min(bg, fg) + 0.05)).toFixed(2)
          })
        },
        [shot, targets(vp), colors],
      )
      await page.evaluate((sel) => {
        for (const el of document.querySelectorAll(sel)) Object.assign(el.style, { transition: '', color: '' })
      }, hide)
      targets(vp).forEach(([key], i) => {
        if (!(key in worst) || ratios[i] < worst[key].ratio) worst[key] = { ratio: ratios[i], t }
      })
    }
    const list = targets(vp)
    check(
      `[${vp.name}] contraste del texto de portada en ${times.length} cuadros del clip`,
      list.every(([key, , min]) => worst[key].ratio >= min),
      list.map(([key, , min]) => `${key} ${worst[key].ratio}:1 en ${worst[key].t.toFixed(1)} s (mín. ${min})`).join(', '),
    )
    await context.close()
  }
}

// Vista móvil: barra flotante «¿Dudas? Te ayudamos» (oculta arriba e inerte, aparece al bajar más
// de un 55 % de la pantalla, se oculta con el menú abierto) y animación del menú (círculo que crece
// desde la esquina y enlaces que suben). Con movimiento reducido, ambos cambian sin transición.
// En escritorio no existen.
async function checkMobileExtras(browser, reduced = false) {
  const tag = reduced ? 'movimiento reducido' : 'vista móvil'
  const { context, page } = await newPage(browser, VIEWPORTS[1], reduced ? { reducedMotion: 'reduce' } : {})
  await page.goto(URL_BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  const bar = () =>
    page.evaluate(() => {
      const el = document.querySelector('.wa-bar')
      const r = el.getBoundingClientRect()
      return {
        shown: el.classList.contains('is-shown'),
        inert: el.inert,
        onScreen: r.top < innerHeight && r.bottom <= innerHeight - 11,
        text: new URL(el.querySelector('a').href).searchParams.get('text'),
        duration: getComputedStyle(el).transitionDuration,
      }
    })
  const top = await bar()
  await page.evaluate(() => window.scrollTo({ top: innerHeight * 0.7, behavior: 'instant' }))
  await page.waitForTimeout(900)
  const down = await bar()
  if (!reduced) await page.screenshot({ path: path.join(SHOTS, 'movil-375-barra-flotante.png') })
  await page.tap('.nav__menu')
  await page.waitForTimeout(100)
  const withMenu = await bar()
  check(
    `[movil-375] ${tag}: barra flotante oculta arriba, visible al bajar, oculta con el menú abierto`,
    !top.shown && top.inert && !top.onScreen && down.shown && !down.inert && down.onScreen && !withMenu.shown && withMenu.inert &&
      down.text === EXPECTED.messages.flotante && (reduced ? parseFloat(top.duration) < 0.01 : top.duration === '0.5s'),
    JSON.stringify({ arriba: top.shown, alBajar: down.shown, conMenu: withMenu.shown, transición: top.duration, mensaje: down.text }),
  )
  const menu = () =>
    page.evaluate(() => {
      const m = document.querySelector('.menu')
      const radius = parseFloat(getComputedStyle(m).clipPath.match(/circle\(([\d.]+)%/)?.[1] ?? 'NaN')
      return { radius, link: getComputedStyle(m.querySelector('.menu__link')).transform }
    })
  const align = await page.evaluate(() => {
    const c = (el) => {
      const r = el.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }
    }
    const a = c(document.querySelector('.nav__menu'))
    const b = c(document.querySelector('.menu__close'))
    // Origen del círculo: «calc(100% - Npx) Ypx» o «Xpx Ypx», según cómo lo devuelva el navegador.
    const clip = getComputedStyle(document.querySelector('.menu')).clipPath
    const m = clip.match(/at (?:calc\(100% - ([\d.]+)px\)|([\d.]+)px) ([\d.]+)px/)
    const ox = m ? (m[1] ? innerWidth - +m[1] : +m[2]) : NaN
    return {
      same: Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1 && Math.abs(a.w - b.w) < 1,
      origin: !!m && Math.abs(ox - a.x) < 1 && Math.abs(+m[3] - a.y) < 1,
      boton: a,
      cerrar: b,
      clip: getComputedStyle(document.querySelector('.menu')).clipPath,
    }
  })
  const early = await menu()
  if (!reduced) await page.screenshot({ path: path.join(SHOTS, 'movil-375-menu-animando.png') })
  await page.waitForTimeout(1500)
  const done = await menu()
  check(
    `[movil-375] ${tag}: «Cerrar» ocupa el lugar y el tamaño del botón del menú y el círculo nace de su centro`,
    align.same && align.origin,
    JSON.stringify(align),
  )
  check(
    `[movil-375] ${tag}: ${reduced ? 'el menú se abre sin animación' : 'el menú se abre en círculo y los enlaces suben'}`,
    reduced
      ? early.radius === 150 && early.link === 'none'
      : early.radius > 0 && early.radius < 150 && early.link !== 'none' && done.radius === 150 && done.link === 'none',
    JSON.stringify({ alInicio: early, alTerminar: done }),
  )
  await context.close()

  if (!reduced) {
    const desk = await newPage(browser, VIEWPORTS[3])
    await desk.page.goto(URL_BASE, { waitUntil: 'networkidle' })
    const d = await desk.page.evaluate(() => ({
      bar: getComputedStyle(document.querySelector('.wa-bar')).display,
      menu: getComputedStyle(document.querySelector('.menu')).display,
      button: getComputedStyle(document.querySelector('.nav__menu')).display,
    }))
    check('[escritorio-1440] sin barra flotante ni menú a pantalla completa', d.bar === 'none' && d.menu === 'none' && d.button === 'none', JSON.stringify(d))
    await desk.context.close()
  }
}

// Móvil y tableta: barra, portada y cinta como un solo fondo verde. Con el video en pausa se
// comparan píxeles reales justo encima y debajo del borde de la barra (mismo verde), en el borde
// inferior de la portada y en la cuña izquierda sobre la cinta inclinada (exactamente el verde de
// la cinta). La barra sigue opaca al desplazarse.
async function checkMobileSeams(browser) {
  const near = (a, b, tol = 3) => a.every((v, i) => Math.abs(v - b[i]) <= tol)
  for (const vp of VIEWPORTS.filter((v) => ['movil-320', 'movil-375', 'movil-390', 'movil-430', 'tableta-768'].includes(v.name))) {
    const { context, page } = await newPage(browser, vp, { deviceScaleFactor: 1 })
    await page.goto(URL_BASE, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    await page.evaluate(async () => {
      const v = document.querySelector('.hero__video')
      v.pause()
      await new Promise((r) => {
        v.addEventListener('seeked', r, { once: true })
        v.currentTime = 0.3
      })
    })
    const geo = await page.evaluate(() => {
      const nav = document.querySelector('.nav').getBoundingClientRect()
      const hero = document.querySelector('header#top').getBoundingClientRect()
      return { nav: nav.bottom + scrollY, hero: hero.bottom + scrollY, w: document.documentElement.clientWidth }
    })
    const b64 = (await page.screenshot({ fullPage: true })).toString('base64')
    const px = await page.evaluate(
      async ([b64, points]) => {
        const img = new Image()
        img.src = `data:image/png;base64,${b64}`
        await img.decode()
        const c = document.createElement('canvas')
        c.width = img.width
        c.height = img.height
        const ctx = c.getContext('2d')
        ctx.drawImage(img, 0, 0)
        return points.map(([x, y]) => [...ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data.slice(0, 3)])
      },
      [
        b64,
        [
          [geo.w / 2, geo.nav - 2],
          [geo.w / 2, geo.nav + 2],
          [geo.w - 4, geo.nav + 2],
          [4, geo.hero - 1],
          [geo.w / 2, geo.hero - 1],
          [2, geo.hero + 2],
        ],
      ],
    )
    const [navIn, heroTop, heroTopR, bottomL, bottomC, wedge] = px
    const forest = [14, 40, 27]
    const ink = [28, 43, 34]
    check(
      `[${vp.name}] barra y portada con el mismo verde, sin corte`,
      near(navIn, forest) && near(heroTop, forest) && near(heroTopR, forest),
      JSON.stringify({ barra: navIn, portada: heroTop, portadaDerecha: heroTopR }),
    )
    check(
      `[${vp.name}] la portada termina en el verde de la cinta, también en la cuña inclinada`,
      near(bottomL, ink) && near(bottomC, ink) && near(wedge, ink),
      JSON.stringify({ bordeIzquierdo: bottomL, bordeCentro: bottomC, cuña: wedge }),
    )
    const scrolled = await page.evaluate(async () => {
      window.scrollTo({ top: 1200, behavior: 'instant' })
      await new Promise((r) => setTimeout(r, 400))
      const s = getComputedStyle(document.querySelector('.nav'))
      return { bg: s.backgroundColor, border: s.borderBottomColor }
    })
    check(
      `[${vp.name}] la barra sigue verde y opaca al desplazarse, sin línea inferior`,
      scrolled.bg === 'rgb(14, 40, 27)' && /rgba\(.*, 0\)|transparent/.test(scrolled.border),
      JSON.stringify(scrolled),
    )
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
  await checkSmoothScroll(browser)
  await checkSmoothScroll(browser, true)
  await checkLayoutShift(browser)
  await checkHeroVideo(browser)
  await checkReducedMotion(browser)
  await checkHeroContrast(browser)
  await checkMobileExtras(browser)
  await checkMobileExtras(browser, true)
  await checkMobileSeams(browser)
} finally {
  await browser.close()
  server?.kill()
}
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} verificaciones correctas`)
process.exit(failed.length ? 1 : 0)
