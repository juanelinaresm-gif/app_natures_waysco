import { useRef } from 'react'
import { Closing } from './components/Closing'
import { Essence } from './components/Essence'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Products } from './components/Products'
import { Routine } from './components/Routine'
import { Ticker } from './components/Ticker'
import { useDesignMotion } from './lib/useDesignMotion'

// Página según el diseño de Claude Design «Diseño dinámico Natures Wayco»
// (visual-pieces/diseno/Natures Wayco.dc.html): barra A, rutina C, movimiento completo.
export default function App() {
  const rootRef = useRef<HTMLDivElement>(null)
  useDesignMotion(rootRef)
  return (
    <div className="page" ref={rootRef}>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" tabIndex={-1}>
        <Hero />
        <Ticker />
        <Products />
        <Routine />
        <Essence />
        <Faq />
        <Closing />
      </main>
      <Footer />
    </div>
  )
}
