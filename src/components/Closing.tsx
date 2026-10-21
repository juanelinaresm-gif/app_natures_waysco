import { getContactAction } from '../commerce/order'
import { instagram } from '../data/contact'
import './Closing.css'

export function Closing() {
  const contact = getContactAction()
  return (
    <section className="hablamos" aria-labelledby="hablamos-title">
      <div className="hablamos__inner">
        <div className="hablamos__title-box">
          <h2 id="hablamos-title" className="hablamos__title">
            <span data-r="up">¿Hablamos?</span>
          </h2>
        </div>
        <div>
          <p className="hablamos__text" data-r="fade" data-d="100">
            Cuéntanos qué buscas y te ayudamos a elegir entre DetoxPlus y ColagenPlus. También puedes ver
            lo que compartimos en Instagram.
          </p>
          <div className="hablamos__actions" data-r="fade" data-d="200">
            <a className="hablamos__wa" href={contact.href} target="_blank" rel="noopener noreferrer">
              {contact.label}
            </a>
            <a className="hablamos__ig" href={instagram.url} target="_blank" rel="noopener noreferrer">
              Síguenos en Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
