// Acción de compra, separada de la presentación.
//
// Los componentes solo piden "la acción para este producto" y reciben un enlace
// con su etiqueta; no saben que hoy el canal es WhatsApp. Cuando exista tienda
// Shopify, este es el único módulo que cambia (ver docs/shopify.md).
import type { Product } from '../data/catalog'
import { productMessage, whatsappUrl } from './whatsapp'

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

/** Contacto general: abre el chat sin mensaje precargado, como en el diseño. */
export function getContactAction(label = 'Escríbenos por WhatsApp'): OrderAction {
  return { href: whatsappUrl(), label, external: true }
}
