// Catálogo centralizado. Precios en pesos colombianos (COP), confirmados por el negocio.
// Presentación, sabor y declaraciones provienen de lo legible en el empaque;
// no se completan textos que no se leen en las fotos.
import { colagenJar, detoxJar, type Photo } from './media'

export type ProductId = 'detoxplus' | 'colagenplus'

export interface Product {
  id: ProductId
  /** Ancla de su sección en la página (#detox, #colagen). */
  anchor: string
  name: string
  priceCOP: number
  netWeight: string
  servings: number
  /** Frase breve que acompaña al nombre. */
  note?: string
  summary: string
  /** Datos adicionales del empaque, después de la presentación. */
  details: { term: string; description: string }[]
  photo: Photo
}

const packagingClaims = 'Sin soya, sin gluten, sin maltodextrina y sin azúcar añadida.'

export const products: Product[] = [
  {
    id: 'detoxplus',
    anchor: 'detox',
    name: 'DetoxPlus',
    priceCOP: 70000,
    netWeight: '600 g',
    servings: 30,
    note: 'Nuestro producto más vendido',
    summary:
      'Una bebida verde que preparas en casa: mezcla en polvo a base de manzana verde, con pepino, brócoli, espirulina, moringa, Bacillus coagulans e inulina.',
    details: [
      { term: 'Sabor', description: 'Idéntico al natural a lulo, kiwi y manzana' },
      { term: 'El empaque indica', description: packagingClaims },
    ],
    photo: detoxJar,
  },
  {
    id: 'colagenplus',
    anchor: 'colagen',
    name: 'ColagenPlus',
    priceCOP: 130000,
    netWeight: '1.000 g',
    servings: 50,
    summary:
      'Mezcla en polvo para preparar una bebida a base de colágeno hidrolizado, con resveratrol.',
    details: [
      {
        term: 'Contiene',
        description:
          'Colágeno hidrolizado de origen marino, caprino, ovino, avícola y bovino, y resveratrol',
      },
      { term: 'Sabor', description: 'Idéntico al natural a Citrus Punch' },
      { term: 'El empaque indica', description: packagingClaims },
    ],
    photo: colagenJar,
  },
]

export function getProduct(id: ProductId): Product {
  const product = products.find((p) => p.id === id)
  if (!product) throw new Error(`Producto desconocido: ${id}`)
  return product
}
