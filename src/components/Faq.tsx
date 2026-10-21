import { useState } from 'react'
import { products } from '../data/catalog'
import { formatPrice } from '../lib/format'
import './Faq.css'

const catalogSummary = products
  .map((p) => `${p.name} (${p.netWeight}, ${formatPrice(p.priceCOP)})`)
  .join(' y ')

const QUESTIONS = [
  {
    q: '¿Cómo hago un pedido?',
    a: 'Toca «Pedir por WhatsApp» en el producto que quieres. Se abre una conversación con el nombre y el precio del producto ya escritos: envíala y te ayudamos a completar tu pedido.',
  },
  {
    q: '¿Cómo sé si hay envío a mi ciudad y si el producto está disponible?',
    a: 'Escríbenos por WhatsApp y cuéntanos dónde estás. Te confirmamos la disponibilidad y las condiciones de envío antes de cerrar el pedido.',
  },
  {
    q: '¿Qué productos tienen?',
    a: `Por ahora, nuestro catálogo tiene dos productos: ${catalogSummary}.`,
  },
  {
    q: '¿Puedo pagar en esta página?',
    a: 'No. Esta página no recibe pagos: los detalles de tu pedido se acuerdan por WhatsApp.',
  },
  {
    q: '¿Dónde veo la información nutricional y los ingredientes?',
    a: 'En la etiqueta de cada envase. Si quieres revisarla antes de pedir, pregúntanos por WhatsApp.',
  },
  {
    q: '¿Sirven para tratar alguna condición de salud?',
    a: 'No. Son mezclas en polvo para preparar bebidas y no reemplazan una alimentación variada ni la orientación de un profesional de la salud. Si tienes una condición médica o dudas sobre si son adecuadas para ti, consulta a tu médico.',
  },
]

export function Faq() {
  // Como en el diseño, la primera pregunta empieza abierta.
  const [open, setOpen] = useState(0)
  return (
    <section id="preguntas" className="faq" aria-labelledby="preguntas-title">
      <h2 id="preguntas-title" className="faq__title">
        <span className="reveal-line">
          <span data-r="up">Preguntas</span>
        </span>
        <span className="reveal-line">
          <span data-r="up" data-d="90" className="faq__amber">
            frecuentes
          </span>
        </span>
      </h2>
      {QUESTIONS.map((item, i) => {
        const isOpen = open === i
        const panelId = `faq-respuesta-${i}`
        return (
          <div key={item.q} className="faq__item" data-r="row">
            <button
              type="button"
              className="faq__question"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? -1 : i)}
            >
              <span>{item.q}</span>
              <span className={isOpen ? 'faq__icon is-open' : 'faq__icon'} aria-hidden="true">
                +
              </span>
            </button>
            <div id={panelId} className={isOpen ? 'faq__panel is-open' : 'faq__panel'} aria-hidden={!isOpen}>
              <div className="faq__clip">
                <p className="faq__answer">{item.a}</p>
              </div>
            </div>
          </div>
        )
      })}
      <div className="faq__end" />
    </section>
  )
}
