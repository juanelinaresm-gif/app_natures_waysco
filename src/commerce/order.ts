// Acción de compra, separada de la presentación.
//
// Los componentes solo piden "la acción para este producto" y reciben un enlace
// con su etiqueta; no saben que hoy el canal es WhatsApp. Cuando exista tienda
// Shopify, este es el único módulo que cambia (ver docs/shopify.md).
import type { Product } from '../data/catalog'
import { contactMessage, productMessage, whatsappUrl, type ContactContext } from './whatsapp'

export interface OrderAction {
  href: string
  label: string
  /** Abre otra aplicación o pestaña. */
  external: boolean
}

export function getOrderAction(product: Product): OrderAction {
  return {
    href: whatsappUrl(productMessage(product)),
    label: 'Pedir por WhatsApp',
    external: true,
  }
}

/** Contacto general: abre el chat con el mensaje del lugar desde donde se escribe. */
export function getContactAction(context: ContactContext = 'general', label = 'Escríbenos por WhatsApp'): OrderAction {
  return { href: whatsappUrl(contactMessage(context)), label, external: true }
}
