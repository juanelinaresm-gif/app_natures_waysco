import { brandName, whatsapp } from '../data/contact'
import type { Product } from '../data/catalog'
import { formatPrice } from '../lib/format'

/** Enlace wa.me, con mensaje precargado y codificado si se indica. No envía nada por sí mismo. */
export function whatsappUrl(message?: string, number = whatsapp.number) {
  const url = `https://wa.me/${number}`
  return message ? `${url}?text=${encodeURIComponent(message)}` : url
}

/** Lugares con un acceso general a WhatsApp (los de producto usan `productMessage`). */
export type ContactContext = 'header' | 'contact' | 'general'

// Único lugar donde se redactan los mensajes. El enlace solo los precarga: el cliente decide enviarlos.
const contactMessages: Record<ContactContext, string> = {
  header: `Hola, me gustaría conocer más sobre los productos de ${brandName}.`,
  contact: 'Hola, me gustaría recibir orientación para elegir entre DetoxPlus y ColagenPlus.',
  general: `Hola, me gustaría recibir información sobre ${brandName}.`,
}

export function contactMessage(context: ContactContext) {
  return contactMessages[context]
}

/** Nombre y precio salen del catálogo, la misma fuente que el precio visible. */
export function productMessage(product: Product) {
  return `Hola, quiero pedir ${product.name} (${formatPrice(product.priceCOP)}). ¿Me confirman disponibilidad y envío?`
}
