import { useLayoutEffect, type RefObject } from 'react'

// Movimiento del diseño de Claude Design. Se activa con atributos:
// - data-r="up|fade|scale|pop|row" (+ data-d en ms): entrada al aparecer en pantalla.
//   En «up» se observa el padre, que recorta el texto mientras sube.
// - data-count: el precio rueda carácter por carácter cuando aparece su fila.
// - data-p (imagen) y data-x (texto de fondo): paralaje con el desplazamiento.
// - data-jar: además del paralaje, el envase gira levemente.
// - data-tilt: inclinación 3D con el puntero (solo con ratón o trackpad).
// - data-line: la línea de la rutina se dibuja al aparecer (marca data-drawn).
// - data-nav: la barra muestra su borde inferior al desplazarse.
//
// Criterios: solo transform y opacity; entradas breves (0,7 s, retardos comprimidos) para no
// demorar la lectura; el paralaje se calcula solo para lo que está en pantalla y con recorrido
// acotado; si algo falla, todo el contenido queda visible. Con prefers-reduced-motion se usa el
// modo «apagado» del diseño: sin entradas, paralaje ni inclinación.

const EASE = 'cubic-bezier(.16,1,.3,1)'
const INITIAL: Record<string, string> = {
  up: 'translateY(110%) rotate(3deg)',
  fade: 'translateY(24px)',
  scale: 'scale(.94) translateY(24px)',
  pop: 'scale(0) rotate(-20deg)',
  row: 'translateX(-20px)',
}
/** Los retardos del diseño (hasta 500 ms) se comprimen para no demorar la lectura. */
const DELAY_SCALE = 0.6
/** Recorrido máximo del paralaje de imágenes, como fracción del alto de su caja. */
const MAX_SHIFT = 0.055

// El <picture> usa display: contents; el contenedor real del paralaje es su padre.
function box(el: HTMLElement) {
  const parent = el.parentElement!
  return parent.tagName === 'PICTURE' ? parent.parentElement! : parent
}

function clamp(v: number, limit: number) {
  return Math.max(-limit, Math.min(limit, v))
}

export function useDesignMotion(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const supported = 'IntersectionObserver' in window
    // Modo «completo» del diseño (k = 1) o «apagado» (k = 0).
    const k = reduced || !supported ? 0 : 1
    const cleanups: (() => void)[] = []
    const timers: number[] = []
    const revealed = [...root.querySelectorAll<HTMLElement>('[data-r]')]

    const revealAll = () => {
      delete root.dataset.motion
      revealed.forEach((el) => {
        el.style.transform = ''
        el.style.opacity = ''
        el.style.transition = ''
        el.style.transitionDelay = ''
      })
      root.querySelectorAll<HTMLElement>('[data-line]').forEach((l) => (l.dataset.drawn = ''))
    }

    try {
      if (k > 0) {
        root.dataset.motion = 'on'
        revealed.forEach((el) => {
          const t = el.dataset.r!
          el.style.transform = INITIAL[t]
          if (t !== 'up') el.style.opacity = '0'
          el.style.transition = `transform ${t === 'pop' ? 600 : 700}ms ${t === 'pop' ? 'cubic-bezier(.34,1.56,.64,1)' : EASE}, opacity 450ms ${EASE}`
        })
        let rowIdx = 0
        const targets = new Map<Element, HTMLElement>()
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (!e.isIntersecting) return
              const el = targets.get(e.target)!
              io.unobserve(e.target)
              let d = Number(el.dataset.d || 0) * DELAY_SCALE
              if (el.dataset.r === 'row') d += (rowIdx++ % 4) * 60
              el.style.transitionDelay = `${d}ms`
              el.style.transform = 'none'
              el.style.opacity = '1'
              const c = el.querySelector<HTMLElement>('[data-count]') ?? (el.dataset.count !== undefined ? el : null)
              if (c) timers.push(window.setTimeout(() => (c.dataset.rolled = ''), d + 120))
            })
          },
          { threshold: 0.01 },
        )
        revealed.forEach((el) => {
          const target = el.dataset.r === 'up' ? el.parentElement! : el
          targets.set(target, el)
          io.observe(target)
        })
        cleanups.push(() => io.disconnect())

        const lineIO = new IntersectionObserver(
          (es) =>
            es.forEach((e) => {
              if (!e.isIntersecting) return
              ;(e.target as HTMLElement).dataset.drawn = ''
              lineIO.unobserve(e.target)
            }),
          { threshold: 0.3 },
        )
        root.querySelectorAll('[data-line]').forEach((l) => lineIO.observe(l))
        cleanups.push(() => lineIO.disconnect())
      } else {
        revealAll()
      }

      // Paralaje: solo para los elementos cuya caja está cerca de la pantalla.
      const par = [...root.querySelectorAll<HTMLElement>('[data-p]')]
      const xs = [...root.querySelectorAll<HTMLElement>('[data-x]')]
      const nav = root.querySelector<HTMLElement>('[data-nav]')
      const visible = new Set<HTMLElement>()
      const owner = new Map<Element, HTMLElement[]>()
      const watch = (el: HTMLElement, container: Element) => {
        owner.set(container, [...(owner.get(container) ?? []), el])
      }
      par.forEach((el) => watch(el, box(el)))
      xs.forEach((el) => watch(el, el.parentElement!))
      let visIO: IntersectionObserver | null = null
      if (k > 0) {
        visIO = new IntersectionObserver(
          (es) =>
            es.forEach((e) =>
              owner.get(e.target)!.forEach((el) => (e.isIntersecting ? visible.add(el) : visible.delete(el))),
            ),
          { rootMargin: '20% 0px' },
        )
        owner.forEach((_, container) => visIO!.observe(container))
      }

      let raf = 0
      const update = () => {
        raf = 0
        const vh = window.innerHeight
        visible.forEach((el) => {
          if (el.dataset.p !== undefined) {
            const r = box(el).getBoundingClientRect()
            const o = clamp(r.top + r.height / 2 - vh / 2, vh * 0.6)
            const y = clamp(o * Number(el.dataset.p), r.height * MAX_SHIFT)
            el.style.transform = `translateY(${y}px)` + (el.dataset.jar !== undefined ? ` rotate(${o * 0.025}deg)` : '')
          } else {
            const r = el.parentElement!.getBoundingClientRect()
            el.style.transform = `translateX(${(r.top - vh / 2) * Number(el.dataset.x)}px)`
          }
        })
        if (nav) nav.style.borderColor = window.scrollY > 10 ? 'rgba(28,43,34,.1)' : 'transparent'
      }
      const onScroll = () => {
        if (!raf) raf = requestAnimationFrame(update)
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll, { passive: true })
      onScroll()
      cleanups.push(() => {
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
        cancelAnimationFrame(raf)
        visIO?.disconnect()
      })

      // Inclinación con el puntero: solo en dispositivos con hover real.
      if (k > 0 && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
          const move = (ev: PointerEvent) => {
            const r = el.getBoundingClientRect()
            const x = (ev.clientX - r.left) / r.width - 0.5
            const y = (ev.clientY - r.top) / r.height - 0.5
            el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`
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
    } catch (error) {
      // Si el movimiento falla, el contenido no puede quedar oculto.
      revealAll()
      console.error(error)
    }

    return () => {
      timers.forEach(clearTimeout)
      cleanups.forEach((fn) => fn())
      revealAll()
    }
  }, [rootRef])
}
