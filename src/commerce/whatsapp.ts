import { whatsapp } from '../data/contact'
import type { Product } from '../data/catalog'
import { formatPrice } from '../lib/format'

/** Enlace wa.me, con mensaje precargado y codificado si se indica. No envía nada por sí mismo. */
export function whatsappUrl(message?: string, number = whatsapp.number) {
  const url = `https://wa.me/${number}`
  return message ? `${url}?text=${encodeURIComponent(message)}` : url
}

export function productMessage(product: Product) {
  return `Hola, quiero pedir ${product.name} (${formatPrice(product.priceCOP)})`
}
