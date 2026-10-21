import { getOrderAction } from '../commerce/order'
import { products, type Product } from '../data/catalog'
import { formatAmount } from '../lib/format'
import { Picture } from './Picture'
import './Products.css'

export function Products() {
  return (
    <>
      <section id="productos" className="products-intro" aria-labelledby="productos-title">
        <h2 id="productos-title" className="products-intro__title">
          <span className="reveal-line">
            <span data-r="up">Nuestros</span>
          </span>
          <span className="reveal-line">
            <span data-r="up" data-d="90">
              productos
            </span>
          </span>
        </h2>
        <p className="products-intro__text" data-r="fade" data-d="200">
          Dos mezclas en polvo para preparar bebidas. Elige la tuya y pídela por WhatsApp.
        </p>
      </section>
      {products.map((product) => (
        <ProductSection key={product.id} product={product} />
      ))}
    </>
  )
}

// DetoxPlus: envase a la izquierda. ColagenPlus: texto primero y envase a la derecha.
function ProductSection({ product }: { product: Product }) {
  const order = getOrderAction(product)
  const variant = product.anchor // 'detox' | 'colagen'
  const titleId = `${variant}-title`
  const specs = [{ term: 'Presentación', description: `${product.netWeight}, ${product.servings} porciones` }, ...product.details]

  const visual = (
    <div className="product__visual" data-r="scale">
      <div className="product__disc" />
      <Picture
        photo={product.photo}
        className="product__jar"
        sizes="(min-width: 600px) 458px, 88vw"
        data-p="-0.05"
        data-jar=""
      />
    </div>
  )

  return (
    <section id={product.anchor} className={`product product--${variant}`} aria-labelledby={titleId}>
      <div className="product__ghost" data-x={variant === 'detox' ? '-0.35' : '0.35'} aria-hidden="true">
        {product.name} {product.name}
      </div>
      <div className="product__grid">
        {variant === 'detox' && visual}
        <div>
          {product.note && (
            <span className="product__badge" data-r="pop">
              {product.note}
            </span>
          )}
          <h3 id={titleId} className="product__name">
            <span data-r="up">{product.name}</span>
          </h3>
          <p className="product__summary" data-r="fade" data-d="100">
            {product.summary}
          </p>
          {specs.map((s) => (
            <div key={s.term} className="product__spec" data-r="row">
              <span className="product__spec-key">{s.term}</span>
              <span>{s.description}</span>
            </div>
          ))}
          <div className="product__buy" data-r="fade">
            <div className="product__price">
              <span className="visually-hidden">Precio: {formatAmount(product.priceCOP)} COP</span>
              <span className="product__amount" data-count="" aria-hidden="true">
                {[...formatAmount(product.priceCOP)].map((ch, i) => (
                  <span key={i} style={{ transitionDelay: `${i * 45}ms` }}>
                    {ch}
                  </span>
                ))}
              </span>
              <span className="product__currency" aria-hidden="true">
                COP
              </span>
            </div>
            <a
              className="product__order"
              href={order.href}
              target={order.external ? '_blank' : undefined}
              rel={order.external ? 'noopener noreferrer' : undefined}
            >
              {order.label} →<span className="visually-hidden">: {product.name}</span>
            </a>
          </div>
          <p className="product__note">Envío y disponibilidad se consultan por WhatsApp.</p>
        </div>
        {variant === 'colagen' && visual}
      </div>
    </section>
  )
}
