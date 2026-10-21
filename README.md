# app_natures_waysco
pagina web natures waysco

Landing de Nature’s Wayco (DetoxPlus y ColagenPlus) con pedidos por WhatsApp.
React + TypeScript + Vite. Sin carrito, pagos ni cuentas.

## Comandos

```bash
npm install
npm run dev       # servidor local con recarga: http://localhost:5173
npm run build     # verificación de tipos + build de producción en dist/
npm run preview   # sirve dist/ en http://localhost:4173
npm test          # pruebas unitarias (precios, catálogo, enlaces de WhatsApp, derivados)
npm run lint      # oxlint
npm run verify    # revisión en Chrome: capturas, desbordamiento, teclado, enlaces (requiere build)
npm run media     # regenera public/media/ desde visual-pieces/ (requiere ImageMagick, Chrome y Swift)
npm run media -- --solo-diseno    # solo los recursos del diseño y el video de portada
node scripts/grabar-portada.mjs   # grabación breve de la portada (WebP animado; requiere build)
```

`verify` y `media` usan Google Chrome instalado en macOS. Otra ruta: `CHROME_PATH=/ruta/a/chrome`.

## Dónde está cada cosa

| Qué | Dónde |
| --- | --- |
| Productos y precios | `src/data/catalog.ts` |
| WhatsApp e Instagram | `src/data/contact.ts` |
| Fotos, video y textos alternativos | `src/data/media.ts` |
| Acción de compra (hoy WhatsApp) | `src/commerce/order.ts` |
| Secciones de la página | `src/components/` |
| Colores, tipografía y botones | `src/index.css` |
| Materiales originales (no se editan) | `visual-pieces/` y `visual-pieces.zip` |
| Recortes de producto con transparencia (pendientes de revisión) | `visual-pieces/recortes/` |
| Video de portada: original y copia web sin audio (pendiente de revisión) | `visual-pieces/video/`, `public/media/video/home-background.mp4` |
| Diseño de Claude Design (HTML de referencia e imágenes) | `visual-pieces/diseno/` |
| Movimiento del diseño (entradas, paralaje, precio, línea) | `src/lib/useDesignMotion.ts` |
| Derivados optimizados | `public/media/` |
| Integración futura con Shopify | `docs/shopify.md` |
| Datos pendientes antes de publicar | `docs/pendientes.md` |
| Reportes por fase | `docs/reports/` |

## Producción (Railway)

Imagen Docker multietapa: Node 24 compila (`npm ci`, `npm test`, `npm run build`) y Caddy 2.11
sirve solo `dist/`. Ver `Dockerfile`, `Caddyfile`, `.dockerignore`, `railway.json` y
`docs/reports/DEPLOY-RAILWAY.md`.

```bash
docker build -t natures-wayco .
docker run --rm -e PORT=8080 -p 8080:8080 natures-wayco   # http://localhost:8080 · /health
BASE_URL=http://localhost:8080/ npm run verify               # revisión en Chrome contra el contenedor
```

El build no usa Chrome ni ImageMagick: los derivados de `public/media/` ya están generados y deben
estar en el repositorio. Si se agrega un medio nuevo, hay que permitirlo también en `.dockerignore`.
