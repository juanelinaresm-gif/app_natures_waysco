import { esenciaPhoto } from '../data/media'
import { Picture } from './Picture'
import './Essence.css'

export function Essence() {
  return (
    <section id="esencia" className="esencia" aria-labelledby="esencia-title">
      <div className="esencia__ghost" data-x="0.3" aria-hidden="true">
        Esencia Esencia
      </div>
      <div className="esencia__grid">
        <div className="esencia__visual" data-r="scale">
          <div className="esencia__card esencia__card--lime" />
          <div className="esencia__card esencia__card--amber" />
          <div className="esencia__frame" data-tilt="">
            <Picture
              photo={esenciaPhoto}
              className="esencia__img"
              sizes="(min-width: 480px) 440px, calc(100vw - 96px)"
              data-p="-0.06"
            />
          </div>
        </div>
        <div>
          <h2 id="esencia-title" className="esencia__title">
            <span className="reveal-line">
              <span data-r="up">Nuestra</span>
            </span>
            <span className="reveal-line">
              <span data-r="up" data-d="90" className="esencia__green">
                esencia
              </span>
            </span>
          </h2>
          <div className="esencia__text">
            <p data-r="fade" data-d="100">
              Creemos en el bienestar que se construye con decisiones pequeñas y conscientes, de las que
              caben en un día cualquiera.
            </p>
            <p data-r="fade" data-d="200">
              Nos inspira la naturaleza y nos importa lo práctico: bebidas en polvo que preparas con
              agua, sin complicarte, en casa o en el trabajo.
            </p>
            <p data-r="fade" data-d="300">
              Y queremos estar cerca. Cuando tengas una pregunta o quieras hacer un pedido, conversamos
              por <span className="esencia__wa">WhatsApp</span> y te acompañamos en lo que necesites.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
