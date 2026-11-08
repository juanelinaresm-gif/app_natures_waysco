import { useEffect, useState } from 'react'
import { getContactAction } from '../commerce/order'
import './ContactBar.css'

// Barra flotante de la vista móvil del diseño: aparece al bajar más de un 55 % de la pantalla y se
// oculta con el menú abierto. Oculta, queda inerte (sin foco ni lectura). Solo existe en móvil.
export function ContactBar({ suppressed }: { suppressed: boolean }) {
  const contact = getContactAction('general', 'WhatsApp')
  const [past, setPast] = useState(false)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      setPast(window.scrollY > window.innerHeight * 0.55)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const shown = past && !suppressed
  return (
    <div className={shown ? 'wa-bar is-shown' : 'wa-bar'} inert={!shown}>
      <span className="wa-bar__text">¿Dudas? Te ayudamos</span>
      <a className="wa-bar__link" href={contact.href} target="_blank" rel="noopener noreferrer">
        <span className="wa-bar__dot" aria-hidden="true" />
        {contact.label}
      </a>
    </div>
  )
}
