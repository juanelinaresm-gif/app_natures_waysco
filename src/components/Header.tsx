import { useEffect, useId, useRef, useState } from 'react'
import { getContactAction } from '../commerce/order'
import { brandName } from '../data/contact'
import { Logo } from './Logo'
import { sections } from './navigation'
import './Header.css'

// Ancho desde el que los enlaces caben en una sola fila (debe coincidir con Header.css).
const DESKTOP = '(min-width: 768px)'

// Barra del diseño, variante «A · Actual». En pantallas angostas los enlaces pasan a un menú
// desplegable: se abre con el botón, se cierra con Escape (el foco vuelve al botón), al elegir un
// enlace, al tocar fuera o al pasar a escritorio. WhatsApp queda siempre visible en la barra.
export function Header() {
  const contact = getContactAction('WhatsApp')
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    const onPointer = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const mq = window.matchMedia(DESKTOP)
    const onMq = () => mq.matches && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    mq.addEventListener('change', onMq)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
      mq.removeEventListener('change', onMq)
    }
  }, [open])

  return (
    <nav ref={navRef} className={open ? 'nav is-open' : 'nav'} data-nav aria-label="Principal">
      <div className="nav__inner">
        <a className="nav__logo" href="#top" aria-label={`${brandName}, ir al inicio`}>
          <Logo className="nav__logo-img" sizes="117px" />
        </a>
        {/* Orden del DOM = orden del teclado: menú (solo móvil) → enlaces → WhatsApp. */}
        <button
          ref={buttonRef}
          type="button"
          className="nav__menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="nav__burger" aria-hidden="true">
            <span />
            <span />
          </span>
          <span className="nav__menu-label">{open ? 'Cerrar' : 'Menú'}</span>
        </button>
        <div className="nav__links" id={menuId}>
          {sections.map((s) => (
            <a key={s.href} className="nav__link" href={s.href} onClick={() => setOpen(false)}>
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
  )
}
