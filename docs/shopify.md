# Integración futura con Shopify

Estado: **no implementada**. No hay SDK instalado ni código de Shopify en el proyecto.

## Punto de conexión

La compra está aislada en `src/commerce/order.ts`:

```ts
getOrderAction(product)  // → { href, label, external }
getContactAction()       // consulta general
```

Los componentes (`Products.tsx`, `Header.tsx`, `Closing.tsx`, `Footer.tsx`,
`FloatingWhatsApp.tsx`) solo usan esas funciones; no construyen enlaces ni saben qué
canal hay detrás. Hoy `getOrderAction` devuelve un enlace `wa.me` con el producto y
su precio.

## Qué cambiaría al conectar Shopify

1. **Catálogo** (`src/data/catalog.ts`): agregar a cada producto su identificador de
   Shopify (handle o ID de variante), o leer precio y disponibilidad desde la
   Storefront API en lugar de tenerlos fijos.
2. **Acción de compra** (`src/commerce/order.ts`): según la opción elegida,
   `getOrderAction` devolvería:
   - un enlace de carrito permanente (`https://<tienda>/cart/<variante>:1`), sin SDK; o
   - el `checkoutUrl` de un carrito creado con la Storefront API; o
   - una acción interna ("Agregar al carrito") si se agrega un carrito en la página.
   La etiqueta del botón viaja en el mismo objeto, así que el componente no cambia.
3. **WhatsApp** puede seguir como canal de consulta con `getContactAction`.

## Decisiones pendientes del negocio

- Si habrá tienda Shopify, con qué dominio y qué plan.
- Si el pedido se cierra en Shopify o se mantiene WhatsApp como canal principal.
- Inventario, costos de envío y medios de pago, que hoy se acuerdan por WhatsApp.
