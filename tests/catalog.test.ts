import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { getContactAction, getOrderAction } from '../src/commerce/order'
import { whatsappUrl } from '../src/commerce/whatsapp'
import { getProduct, products } from '../src/data/catalog'
import { whatsapp } from '../src/data/contact'
import { colagenJar, detoxJar, esenciaPhoto, heroVideo, logo } from '../src/data/media'
import { formatPrice } from '../src/lib/format'

describe('precios', () => {
  it('formatea en pesos colombianos', () => {
    expect(formatPrice(70000)).toBe('$70.000 COP')
    expect(formatPrice(130000)).toBe('$130.000 COP')
  })
})

describe('catálogo', () => {
  it('tiene DetoxPlus primero y ColagenPlus después, con las anclas del diseño', () => {
    expect(products.map((p) => [p.id, p.anchor])).toEqual([
      ['detoxplus', 'detox'],
      ['colagenplus', 'colagen'],
    ])
  })

  it('conserva precios y presentaciones confirmados', () => {
    const detox = getProduct('detoxplus')
    expect([detox.priceCOP, detox.netWeight, detox.servings]).toEqual([70000, '600 g', 30])
    const colagen = getProduct('colagenplus')
    expect([colagen.priceCOP, colagen.netWeight, colagen.servings]).toEqual([130000, '1.000 g', 50])
  })

  it('usa el envase de cada producto y no el del otro', () => {
    expect(getProduct('detoxplus').photo.name).toBe('detox-jar')
    expect(getProduct('colagenplus').photo.name).toBe('colagen-jar')
  })
})

describe('enlaces de WhatsApp', () => {
  it('cada producto abre el número configurado con su nombre y precio, como en el diseño', () => {
    expect(getOrderAction(getProduct('detoxplus')).href).toBe(
      'https://wa.me/573124475525?text=Hola%2C%20quiero%20pedir%20DetoxPlus%20(%2470.000%20COP)',
    )
    expect(getOrderAction(getProduct('colagenplus')).href).toBe(
      'https://wa.me/573124475525?text=Hola%2C%20quiero%20pedir%20ColagenPlus%20(%24130.000%20COP)',
    )
  })

  it('codifica el mensaje completo', () => {
    expect(whatsappUrl('¿Hay envío? $70.000 & más', '570000000000')).toBe(
      'https://wa.me/570000000000?text=%C2%BFHay%20env%C3%ADo%3F%20%2470.000%20%26%20m%C3%A1s',
    )
  })

  it('el contacto general abre el chat sin mensaje', () => {
    expect(getContactAction().href).toBe(`https://wa.me/${whatsapp.number}`)
  })
})

describe('recursos del diseño', () => {
  const dir = fileURLToPath(new URL('../public/media', import.meta.url))

  it('existen todos los derivados declarados (formatos modernos y respaldo)', () => {
    for (const photo of [logo, detoxJar, colagenJar, esenciaPhoto]) {
      for (const w of photo.widths) {
        for (const ext of [...photo.formats, photo.fallback]) {
          const file = `${photo.name}-${w}.${ext}`
          expect(fs.existsSync(path.join(dir, file)), file).toBe(true)
        }
      }
    }
    expect(fs.existsSync(path.join(dir, path.basename(heroVideo.poster)))).toBe(true)
  })

  it('el video de portada no tiene pista de audio y está listo para web', () => {
    const data = fs.readFileSync(path.join(dir, 'video', 'home-background.mp4'))
    expect(data.indexOf('vide')).toBeGreaterThan(-1)
    expect(data.indexOf('soun')).toBe(-1)
    expect(data.indexOf('moov')).toBeLessThan(data.indexOf('mdat'))
  })
})
