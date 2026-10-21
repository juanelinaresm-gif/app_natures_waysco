import { useLayoutEffect, type RefObject } from 'react'

// Movimiento del diseño de Claude Design, portado sin cambios de valores. Se activa con atributos:
// - data-r="up|fade|scale|pop|row" (+ data-d en ms): entrada al aparecer en pantalla.
//   En «up» se observa el padre, que recorta el texto mientras sube.
// - data-count: el precio rueda carácter por carácter cuando aparece su fila.
// - data-p (imagen) y data-x (texto de fondo): paralaje con el desplazamiento.
// - data-jar: además del paralaje, el envase gira levemente.
// - data-tilt: inclinación 3D con el puntero.
// - data-line: la línea de la rutina se dibuja al aparecer.
// - data-nav: la barra muestra su borde inferior al desplazarse.
// Con prefers-reduced-motion se usa el modo «apagado» del diseño: sin entradas, paralaje ni inclinación.

const EASE = 'cubic-bezier(.16,1,.3,1)'
const INITIAL: Record<string, string> = {
  up: 'translateY(110%) rotate(3deg)',
  fade: 'translateY(36px)',
  scale: 'scale(.88) translateY(40px)',
  pop: 'scale(0) rotate(-20deg)',
  row: 'translateX(-30px)',
}

// El <picture> usa display: contents; el contenedor real del paralaje es su padre.
function box(el: HTMLElement) {
  const parent = el.parentElement!
  return parent.tagName === 'PICTURE' ? parent.parentElement! : parent
}

export function useDesignMotion(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    // Modo «completo» del diseño (k = 1) o «apagado» con movimiento reducido (k = 0).
    const k = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1
    const cleanups: (() => void)[] = []
    const timers: number[] = []

    // Precio: los caracteres suben uno a uno (el marcado vive en ProductSection).
    const roll = (el: HTMLElement) => {
      requestAnimationFrame(() => requestAnimationFrame(() => (el.dataset.rolled = '')))
    }

    if (k > 0) {
      root.dataset.motion = 'on'
      const els = [...root.querySelectorAll<HTMLElement>('[data-r]')]
      els.forEach((el) => {
        const t = el.dataset.r!
        el.style.transform = INITIAL[t]
        if (t !== 'up') el.style.opacity = '0'
        el.style.transition = `transform ${t === 'pop' ? 900 : 1100}ms ${t === 'pop' ? 'cubic-bezier(.34,1.56,.64,1)' : EASE}, opacity 800ms ${EASE}`
      })
      let rowIdx = 0
      const targets = new Map<Element, HTMLElement>()
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return
            const el = targets.get(e.target)!
            io.unobserve(e.target)
            let d = Number(el.dataset.d || 0)
            if (el.dataset.r === 'row') d += (rowIdx++ % 4) * 90
            el.style.transitionDelay = `${d}ms`
            el.style.transform = 'none'
            el.style.opacity = '1'
            const c = el.querySelector<HTMLElement>('[data-count]') ?? (el.dataset.count !== undefined ? el : null)
            if (c) timers.push(window.setTimeout(() => roll(c), d + 200))
          })
        },
        { threshold: 0.01 },
      )
      els.forEach((el) => {
        const target = el.dataset.r === 'up' ? el.parentElement! : el
        targets.set(target, el)
        io.observe(target)
      })
      cleanups.push(() => {
        io.disconnect()
        delete root.dataset.motion
        els.forEach((el) => {
          el.style.transform = ''
          el.style.opacity = ''
          el.style.transition = ''
          el.style.transitionDelay = ''
        })
      })
    }

    // Línea de la rutina.
    const lines = [...root.querySelectorAll<HTMLElement>('[data-line]')]
    if (k === 0) {
      lines.forEach((l) => {
        l.style.transition = 'none'
        l.style.transform = 'scaleX(1)'
      })
    } else {
      const lineIO = new IntersectionObserver(
        (es) => es.forEach((e) => e.isIntersecting && ((e.target as HTMLElement).style.transform = 'scaleX(1)')),
        { threshold: 0.5 },
      )
      lines.forEach((l) => lineIO.observe(l))
      cleanups.push(() => lineIO.disconnect())
    }

    // Paralaje y borde de la barra.
    const par = [...root.querySelectorAll<HTMLElement>('[data-p]')]
    const xs = [...root.querySelectorAll<HTMLElement>('[data-x]')]
    const nav = root.querySelector<HTMLElement>('[data-nav]')
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const vh = window.innerHeight
        par.forEach((el) => {
          const r = box(el).getBoundingClientRect()
          const o = r.top + r.height / 2 - vh / 2
          el.style.transform =
            `translateY(${o * Number(el.dataset.p) * k}px)` + (el.dataset.jar !== undefined ? ` rotate(${o * 0.025 * k}deg)` : '')
        })
        xs.forEach((el) => {
          const r = el.parentElement!.getBoundingClientRect()
          el.style.transform = `translateX(${(r.top - vh / 2) * Number(el.dataset.x) * k}px)`
        })
        const y = window.scrollY || document.documentElement.scrollTop
        if (nav) nav.style.borderColor = y > 10 ? 'rgba(28,43,34,.1)' : 'transparent'
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    cleanups.push(() => {
      window.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    })

    // Inclinación con el puntero.
    if (k > 0) {
      root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
        const move = (ev: PointerEvent) => {
          const r = el.getBoundingClientRect()
          const x = (ev.clientX - r.left) / r.width - 0.5
          const y = (ev.clientY - r.top) / r.height - 0.5
          el.style.transform = `perspective(900px) rotateY(${x * 8 * k}deg) rotateX(${-y * 8 * k}deg) scale(1.02)`
        }
        const leave = () => (el.style.transform = 'none')
        el.addEventListener('pointermove', move)
        el.addEventListener('pointerleave', leave)
        cleanups.push(() => {
          el.removeEventListener('pointermove', move)
          el.removeEventListener('pointerleave', leave)
        })
      })
    }

    return () => {
      timers.forEach(clearTimeout)
      cleanups.forEach((fn) => fn())
    }
  }, [rootRef])
}
