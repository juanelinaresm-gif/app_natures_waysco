import { getContactAction } from '../commerce/order'
import { brandName, instagram, whatsapp } from '../data/contact'
import { Logo } from './Logo'
import { sections } from './navigation'
import './Footer.css'

const year = new Date().getFullYear()

export function Footer() {
  const contact = getContactAction()
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          <Logo className="footer__logo" sizes="200px" />
          <nav className="footer__col" aria-label="Secciones del pie de página">
            {sections.map((s) => (
              <a key={s.href} className="footer__link" href={s.href}>
                {s.label}
              </a>
            ))}
          </nav>
          <div className="footer__col">
            <a href={contact.href} target="_blank" rel="noopener noreferrer">
              WhatsApp {whatsapp.display}
            </a>
            <a href={instagram.url} target="_blank" rel="noopener noreferrer">
              Instagram {instagram.handle}
            </a>
          </div>
        </div>
        <div className="footer__legal">
          <span>Precios en pesos colombianos (COP). Envío y disponibilidad se confirman por WhatsApp.</span>
          <span>
            © {year} {brandName} · Powered by MONTSERRAT_AI
          </span>
        </div>
      </div>
    </footer>
  )
}
