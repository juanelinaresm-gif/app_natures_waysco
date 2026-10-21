import type { ImgHTMLAttributes } from 'react'
import { mediaUrl, type Photo } from '../data/media'

type ImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes' | 'width' | 'height' | 'alt'>

interface PictureProps extends ImgProps {
  photo: Photo
  /** Ancho aproximado de visualización, en sintaxis del atributo sizes. */
  sizes: string
  /** Solo para la imagen principal visible al cargar. */
  priority?: boolean
}

function srcSet(photo: Photo, ext: string) {
  return photo.widths.map((w) => `${mediaUrl(`${photo.name}-${w}.${ext}`)} ${w}w`).join(', ')
}

/**
 * <picture> con AVIF/WebP y respaldo. El <picture> usa display: contents, así que el <img>
 * se comporta en el diseño como si fuera hijo directo de su contenedor.
 * Los demás atributos (clase, estilo, data-*) van al <img>.
 */
export function Picture({ photo, sizes, priority = false, ...img }: PictureProps) {
  const largest = photo.widths[photo.widths.length - 1]
  return (
    <picture className="picture">
      {photo.formats.map((format) => (
        <source key={format} type={`image/${format}`} srcSet={srcSet(photo, format)} sizes={sizes} />
      ))}
      <img
        {...img}
        src={mediaUrl(`${photo.name}-${largest}.${photo.fallback}`)}
        srcSet={srcSet(photo, photo.fallback)}
        sizes={sizes}
        width={photo.width}
        height={photo.height}
        alt={photo.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </picture>
  )
}
