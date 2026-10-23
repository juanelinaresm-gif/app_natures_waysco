import './Ticker.css'

const WORDS: [string, string][] = [
  ['DetoxPlus', '#9BCB3F'],
  ['ColagenPlus', '#F2A422'],
  ['Bienestar', '#FAF6EE'],
  ['En casa', '#9BCB3F'],
  ['Manzana verde', '#9BCB3F'],
  ['Resveratrol', '#F2A422'],
  ['Citrus Punch', '#F2A422'],
  ['Lulo · kiwi', '#9BCB3F'],
]

// Cinta inclinada en movimiento. Es decorativa: repite palabras que ya están en la página.
export function Ticker() {
  return (
    <div className="ticker-band" aria-hidden="true">
      <div className="ticker">
        <div className="ticker__track">
          {[...WORDS, ...WORDS].map(([word, color], i) => (
            <div key={i} className="ticker__item">
              <span style={{ color }}>{word}</span>
              <span className="ticker__gem" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
