import { getContactAction } from '../commerce/order'
import { brandName } from '../data/contact'
import { Logo } from './Logo'
import { sections } from './navigation'
import './Header.css'

// Barra del diseño, variante «A · Actual».
export function Header() {
  const contact = getContactAction('WhatsApp')
  return (
    <nav className="nav" data-nav aria-label="Principal">
      <div className="nav__inner">
        <a className="nav__logo" href="#top" aria-label={`${brandName}, ir al inicio`}>
          <Logo className="nav__logo-img" sizes="117px" />
        </a>
        <div className="nav__links">
          {sections.map((s) => (
            <a key={s.href} className="nav__link" href={s.href}>
              {s.label}
            </a>
          ))}
          <a className="nav__wa" href={contact.href} target="_blank" rel="noopener noreferrer">
            <span className="nav__dot" aria-hidden="true" />
            {contact.label}
          </a>
        </div>
      </div>
    </nav>
  )
}
