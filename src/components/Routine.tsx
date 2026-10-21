import './Routine.css'

const STEPS = [
  {
    n: '01',
    bg: '#9BCB3F',
    t: 'Tenlo a la vista',
    d: 'Deja el envase donde empieza tu día, en la cocina o en tu escritorio. Lo que se ve, se recuerda.',
  },
  {
    n: '02',
    bg: '#F2A422',
    t: 'Súmalo a algo que ya haces',
    d: 'Un hábito nuevo es más fácil cuando se une a un momento que ya forma parte de tu rutina. Elige el que mejor te funcione.',
  },
  {
    n: '03',
    bg: '#BFE0EA',
    t: 'Elige el que va contigo',
    d: 'DetoxPlus es una bebida verde con sabor a lulo, kiwi y manzana. ColagenPlus, una bebida de colágeno hidrolizado con sabor a Citrus Punch. Si dudas, te ayudamos por WhatsApp.',
  },
]

// Rutina del diseño, variante «C · Línea del día».
export function Routine() {
  return (
    <section id="rutina" className="rutina" aria-labelledby="rutina-title">
      <div className="rutina__inner">
        <div className="rutina__head">
          <h2 id="rutina-title" className="rutina__title">
            <span data-r="up">Tu rutina</span>
          </h2>
          <p className="rutina__intro" data-r="fade" data-d="100">
            No hace falta cambiarlo todo. Estas ideas te ayudan a darle un lugar a tu bebida dentro del
            día que ya tienes.
          </p>
        </div>
        <div className="rutina__steps">
          <div className="rutina__line" data-line="" aria-hidden="true" />
          {STEPS.map((s) => (
            <div key={s.n} className="rutina__step" data-r="fade">
              <span className="rutina__num" style={{ background: s.bg }} aria-hidden="true">
                {s.n}
              </span>
              <h3 className="rutina__step-title">{s.t}</h3>
              <p className="rutina__step-text">{s.d}</p>
            </div>
          ))}
        </div>
        <div id="etiqueta" className="rutina__label" data-r="fade">
          <span className="rutina__tag">Lo que indica la etiqueta</span>
          <p className="rutina__label-text">
            En los dos productos, la tabla nutricional del empaque indica que una porción se prepara con{' '}
            <strong>1 cucharada dosificadora (20 g)</strong> en <strong>200 mL de agua</strong>.
          </p>
        </div>
        <p className="rutina__note">
          Es la forma de preparar una porción, no una recomendación de cuánto ni cada cuánto consumir.
          Lee la etiqueta completa y, si tienes dudas sobre tu caso, consulta a un profesional de la salud.
        </p>
      </div>
    </section>
  )
}
