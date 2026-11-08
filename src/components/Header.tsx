import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react'
import { flushSync } from 'react-dom'
import { getContactAction } from '../commerce/order'
import { brandName, instagram, whatsapp } from '../data/contact'
import { ContactBar } from './ContactBar'
import { Logo } from './Logo'
import { sections } from './navigation'
import './Header.css'

// Ancho desde el que los enlaces caben en una sola fila (debe coincidir con Header.css).
const DESKTOP = '(min-width: 768px)'
// Duración del cierre del menú (clip-path en Header.css): al terminar, el panel queda inerte.
const CLOSE_MS = 800
// Color de cada enlace del menú, como en la vista móvil del diseño.
const COLORS = ['#9BCB3F', '#F2A422', '#7FC4D8', '#9BCB3F']

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Barra del diseño. Escritorio: variante «A · Actual», todo en una fila. Móvil (vista móvil del
// diseño): logo y botón redondo; el botón abre un menú a pantalla completa que se revela en círculo
// desde la esquina, con los enlaces subiendo escalonados. El menú es un diálogo: el foco entra en
// él, Tab no sale, Escape o «Cerrar» lo cierran (el foco vuelve al botón) y la página no se desplaza
// debajo. WhatsApp está en el menú y, al bajar, en la barra flotante (ContactBar).
//
// Las anclas usan la navegación nativa del navegador (hash, foco y teclado intactos); el
// desplazamiento suave y el margen bajo la barra viven en index.css. Aquí solo se publica el alto
// real de la barra en --nav-h para que ese margen sea exacto en cada ancho.
export function Header() {
  const contact = getContactAction('header', 'WhatsApp')
  const [open, setOpen] = useState(false)
  // El panel sigue accesible mientras se cierra; después queda inerte (fuera del foco y del árbol
  // de accesibilidad).
  const [visible, setVisible] = useState(false)
  const menuId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  // El foco se mueve al abrir y al cerrar; su anillo solo se muestra si se usó el teclado
  // (un clic de teclado llega con detail 0), no al tocar o hacer clic.
  const viaKeyboard = useRef(false)
  const focusTo = (el: HTMLElement | null) =>
    el?.focus({ focusVisible: viaKeyboard.current } as FocusOptions)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const root = document.documentElement
    const publish = () =>
      root.style.setProperty('--nav-h', `${nav.getBoundingClientRect().height}px`)
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(nav)
    return () => {
      ro.disconnect()
      root.style.removeProperty('--nav-h')
    }
  }, [])

  const openMenu = (e: MouseEvent) => {
    viaKeyboard.current = e.detail === 0
    setVisible(true)
    setOpen(true)
  }

  const closeAndFocus = (keyboard: boolean) => {
    viaKeyboard.current = keyboard
    setOpen(false)
    focusTo(buttonRef.current)
  }

  // Al elegir un enlace, el menú se cierra y la página se libera antes de que el navegador siga
  // el ancla, así el desplazamiento suave empieza sin saltos.
  const closeForLink = () => flushSync(() => setOpen(false))

  // Sin desplazamiento de la página mientras el menú está abierto (se libera en el mismo commit
  // que lo cierra, antes de seguir un enlace).
  useLayoutEffect(() => {
    if (!open) return
    const root = document.documentElement
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (open) {
      focusTo(closeRef.current)
      return
    }
    if (!visible) return
    const t = window.setTimeout(() => setVisible(false), prefersReducedMotion() ? 0 : CLOSE_MS)
    return () => window.clearTimeout(t)
  }, [open, visible])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAndFocus(true)
        return
      }
      if (e.key !== 'Tab' || !menuRef.current) return
      const items = [...menuRef.current.querySelectorAll<HTMLElement>('a, button')]
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    const mq = window.matchMedia(DESKTOP)
    const onMq = () => mq.matches && setOpen(false)
    document.addEventListener('keydown', onKey)
    mq.addEventListener('change', onMq)
    return () => {
      document.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onMq)
    }
  }, [open])

  return (
    <>
      <nav ref={navRef} className="nav" data-nav aria-label="Principal">
        <div className="nav__inner">
          <a className="nav__logo" href="#top" aria-label={`${brandName}, ir al inicio`}>
            <Logo className="nav__logo-img" sizes="117px" />
          </a>
          <button
            ref={buttonRef}
            type="button"
            className="nav__menu"
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={openMenu}
          >
            <span className="nav__burger" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
          <div className="nav__links">
            {sections.map((s) => (
              <a key={s.href} className="nav__link" href={s.href}>
                {s.label}
              </a>
            ))}
          </div>
          <a className="nav__wa" href={contact.href} target="_blank" rel="noopener noreferrer">
            <span className="nav__dot" aria-hidden="true" />
            {contact.label}
          </a>
        </div>
      </nav>

      {/* Fuera de la barra: su backdrop-filter haría que position: fixed se midiera contra ella. */}
      <div
        ref={menuRef}
        id={menuId}
        className={open ? 'menu is-open' : 'menu'}
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        inert={!open && !visible}
      >
        <div className="menu__top">
          <span className="menu__tag">Nutrition by nature</span>
          <button
            ref={closeRef}
            type="button"
            className="menu__close"
            aria-label="Cerrar menú"
            onClick={(e) => closeAndFocus(e.detail === 0)}
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>
        <div className="menu__links">
          {sections.map((s, i) => (
            <div key={s.href} className="menu__row">
              <a
                className="menu__link"
                href={s.href}
                onClick={closeForLink}
                style={{ '--c': COLORS[i], '--d': `${250 + i * 70}ms` } as CSSProperties}
              >
                <span className="menu__num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {s.label}
              </a>
            </div>
          ))}
        </div>
        <div className="menu__foot">
          <a
            className="menu__contact menu__contact--wa"
            href={contact.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp {whatsapp.display}
          </a>
          <a
            className="menu__contact menu__contact--ig"
            href={instagram.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram {instagram.handle}
          </a>
        </div>
      </div>

      <ContactBar suppressed={open} />
    </>
  )
}
