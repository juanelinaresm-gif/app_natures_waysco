// Recursos del diseño de Claude Design («Diseño dinámico Natures Wayco»).
// Originales en visual-pieces/diseno/ y visual-pieces/video/; derivados web generados con
// `npm run media -- --solo-diseno` en public/media/.

export interface Photo {
  /** Ruta base dentro de public/media, sin ancho ni extensión. */
  name: string
  widths: number[]
  /** Dimensiones del derivado más grande, para reservar espacio. */
  width: number
  height: number
  alt: string
  /** Formatos modernos disponibles, en orden de preferencia. */
  formats: ('avif' | 'webp')[]
  /** Formato de respaldo para navegadores sin AVIF ni WebP. */
  fallback: 'jpg' | 'png'
}

const base = `${import.meta.env.BASE_URL}media/`

export function mediaUrl(file: string) {
  return base + file
}

// Video de portada: copia web sin audio de visual-pieces/video/home-background-v2-original.mp4
// (scripts/strip-audio.swift). El póster es su primer cuadro.
// Pendiente: el texto de las etiquetas del video no coincide con el empaque real (docs/pendientes.md).
export const heroVideo = {
  src: mediaUrl('video/home-background.mp4'),
  poster: mediaUrl('portada-video-poster-1024.webp'),
}

// Logotipo con fondo blanco: en la barra se integra con mix-blend-mode: multiply, como en el diseño.
export const logo: Photo = {
  name: 'logo-diseno',
  widths: [420, 840],
  width: 840,
  height: 330,
  alt: 'Nature’s Wayco',
  formats: ['webp'],
  fallback: 'png',
}

// Envases con fondo transparente. Pendiente: verificar sus etiquetas (docs/pendientes.md).
export const detoxJar: Photo = {
  name: 'detox-jar',
  widths: [480, 820],
  width: 820,
  height: 1010,
  alt: 'Envase de DetoxPlus',
  formats: ['avif', 'webp'],
  fallback: 'png',
}

export const colagenJar: Photo = {
  name: 'colagen-jar',
  widths: [500, 1010],
  width: 1010,
  height: 1030,
  alt: 'Envase de ColagenPlus',
  formats: ['avif', 'webp'],
  fallback: 'png',
}

export const esenciaPhoto: Photo = {
  name: 'esencia-bosque',
  widths: [480, 714],
  width: 714,
  height: 1280,
  alt: 'ColagenPlus y DetoxPlus en un bosque, con frutas y plantas',
  formats: ['avif', 'webp'],
  fallback: 'jpg',
}
