import { useCallback, useEffect, useRef, useState } from 'react'
import { heroVideo } from '../data/media'
import './Hero.css'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Portada del diseño: titular de tres líneas, texto y CTA junto al video completo (16:9) con sus
// bordes fundidos en el fondo, y control de pausa.
// Además del diseño: se pausa fuera de pantalla o con la pestaña oculta (y respeta la pausa manual
// al volver) y, con movimiento reducido, no se reproduce sola: queda el póster (su primer cuadro).
export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [autoplay] = useState(() => !prefersReducedMotion())
  const wantsPlay = useRef(autoplay)
  const onScreen = useRef(true)
  const [paused, setPaused] = useState(!autoplay)

  const sync = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (wantsPlay.current && onScreen.current && !document.hidden) {
      v.muted = true
      v.play().catch(() => setPaused(true))
    } else if (!v.paused) {
      v.pause()
    }
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.defaultMuted = true
    v.setAttribute('muted', '')
    const io = new IntersectionObserver(([entry]) => {
      onScreen.current = entry.isIntersecting
      sync()
    })
    io.observe(v.closest('header')!)
    document.addEventListener('visibilitychange', sync)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [sync])

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    wantsPlay.current = v.paused
    sync()
  }

  return (
    <header id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero__inner">
        <div className="hero__text">
          {/* Un solo h1; cada línea es un bloque. Los espacios entre bloques mantienen el texto
              continuo para lectores de pantalla y al copiar. */}
          <h1 id="hero-title" className="hero__title">
            <span className="hero__line">
              <span data-r="up" data-d="0">
                Bienestar
              </span>
            </span>{' '}
            <span className="hero__line">
              <span data-r="up" data-d="60">
                que se <span className="hero__green">integra</span>
              </span>
            </span>{' '}
            <span className="hero__line">
              <span data-r="up" data-d="120">
                a tu <span className="hero__amber">día</span>
              </span>
            </span>
          </h1>
          <p className="hero__lead" data-r="fade" data-d="160">
            Dos mezclas en polvo para preparar bebidas en casa: DetoxPlus, nuestra bebida verde a base
            de manzana verde, y ColagenPlus, con colágeno hidrolizado y resveratrol.
          </p>
          <div className="hero__actions" data-r="fade" data-d="220">
            <a className="hero__cta" href="#detox">
              Conoce DetoxPlus
            </a>
            <a className="hero__ghost" href="#productos">
              Ver productos
            </a>
          </div>
        </div>
        {/* Video completo en su proporción 16:9; los bordes se funden con el fondo de la portada. */}
        <div className="hero__visual">
          <div className="hero__media">
            <video
              ref={videoRef}
              className="hero__video"
              src={heroVideo.src}
              poster={heroVideo.poster}
              width={1024}
              height={576}
              autoPlay={autoplay}
              muted
              loop
              playsInline
              preload={autoplay ? 'auto' : 'metadata'}
              disablePictureInPicture
              tabIndex={-1}
              aria-hidden="true"
              onPlay={() => setPaused(false)}
              onPause={() => setPaused(true)}
            />
          </div>
          <button
            type="button"
            className="hero__toggle"
            onClick={toggle}
            aria-label={paused ? 'Reproducir video' : 'Pausar video'}
          >
            <span aria-hidden="true">{paused ? '▶' : '❚❚'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
