# Despliegue en Railway: preparación

Proyecto: landing de Nature’s Wayco · Fecha: 2026-10-21 · Estado: **listo para desplegar; sin commit, sin push y sin publicar**.

## Resumen

La aplicación queda empaquetada en una imagen Docker multietapa, a partir de la guía oficial de Railway para React (https://docs.railway.com/guides/react):
- **Etapa Node** (`node:24.12.0-alpine3.23`): `npm ci`, `npm test`, `npm run build`.
- **Etapa Caddy** (`caddy:2.11.7-alpine`): sirve solo `dist/`.

**Probado con Docker local (Docker Desktop, Engine 29.1.3):**
- se construyó la imagen en `arm64` y en `linux/amd64`, la arquitectura de Railway;
- se construyó desde una copia limpia del repositorio;
- se probó el servidor con solicitudes reales y se pasó la revisión completa en Chrome contra el contenedor.

El diseño y las funcionalidades no cambiaron: no se tocó ningún archivo de `src/`.

## 1. Archivos

| Archivo | Estado | Contenido |
| --- | --- | --- |
| `Dockerfile` | Nuevo | Dos etapas con versiones explícitas. Las pruebas corren dentro del build: si falta un medio declarado, el build falla. |
| `Caddyfile` | Nuevo | `:{$PORT:3000}` con `bind 0.0.0.0`; `auto_https off`; `/health`; compresión zstd/gzip; 404 para medios inexistentes; fallback SPA; cabeceras de caché y seguridad. |
| `.dockerignore` | Nuevo | Lista de permitidos: solo código, configuración y los 25 medios que usa la página. |
| `railway.json` | Nuevo | Configuración como código: builder `DOCKERFILE`, `healthcheckPath` `/health`, reinicio `ON_FAILURE`. Claves validadas contra `https://railway.com/railway.schema.json`. |
| `scripts/verify-ui.mjs` | Modificado | Variable opcional `BASE_URL` para revisar un servidor ya en marcha, como el contenedor. |
| `README.md` | Modificado | Sección «Producción (Railway)». |
| `docs/reports/DEPLOY-RAILWAY.md`, `verify-deploy-railway.txt`, `capturas/deploy-railway/` | Nuevos | Este reporte, la salida de la revisión y sus capturas. |

### Comportamiento del servidor (`Caddyfile`)

| Ruta | Respuesta |
| --- | --- |
| `/health` | `200 OK` (`text/plain`, `Cache-Control: no-store`) |
| `/`, `/cualquier/ruta` sin extensión | `index.html` (fallback de SPA, `Cache-Control: no-cache`) |
| `/media/*`, `/assets/*` y cualquier ruta con extensión | Archivo real, o **404 vacío** si no existe; nunca el HTML |
| `/assets/*` (con hash de Vite) | `Cache-Control: public, max-age=31536000, immutable` |
| `/media/*` | `Cache-Control: public, max-age=86400` |
| Todas | `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, sin cabecera `Server` |

**Compresión:** zstd o gzip solo para tipos comprimibles (HTML, JS, CSS…). Imágenes y video se sirven sin comprimir.

**Proxy:** como en la guía, el proxy de Railway queda como confiable (`trusted_proxies`). HTTPS lo gestiona Railway.

## 2. Pruebas realizadas

| Prueba | Resultado |
| --- | --- |
| `npm run build` (local) | Correcto. JS 240,8 kB (75,3 kB gzip), CSS 15,1 kB. |
| `npm run lint` | Sin advertencias. |
| `npm test` (local y dentro del build Docker) | 9/9 |
| `docker build` (arm64) | Correcto, unos 23 s. |
| `docker build --platform linux/amd64` | Correcto con emulación; pruebas 9/9 dentro del build. El contenedor amd64 respondió `/health` 200, `/` 200, video `video/mp4` y medio faltante 404. |
| Build desde copia limpia | Correcto: solo archivos que Git incluiría, sin `node_modules` ni `dist`. Mismos 33 archivos en `/srv`. Ningún archivo necesario está en `.gitignore`. |
| Contenido de la imagen final | `/srv` = `dist/`: 33 archivos, 5,4 MB. Sin `node_modules`, ZIP, `.dc.html`, `visual-pieces`, capturas ni `.env`. |
| Secretos | Búsqueda de claves, tokens y archivos `.env`: ninguno. |
| Rutas absolutas | `grep "/Users/"` en `src`, `public`, `index.html`, `vite.config.ts` y `package.json`: ninguna. |
| Puerto | Con `PORT=8080` escucha en 8080; sin `PORT`, en 3000 (probado con `-p 3001:3000`). |

**Solicitudes al contenedor (`curl`):**
- `/health` → 200 `OK`.
- `/` y `/productos/detalle` → 200 `text/html`.
- Medios, video, asset y archivo inexistentes, y `/media/` → 404, 0 B.
- Tipos MIME:
  - `home-background.mp4` → 200 `video/mp4`;
  - `.avif` → `image/avif`;
  - `.webp` → `image/webp`;
  - `.jpg` → `image/jpeg`;
  - `.woff2` → `font/woff2`.
- **Solicitudes parciales:** `Range: bytes=0-1023` → `206 Partial Content`, `Content-Range: bytes 0-1023/1211413`, `Accept-Ranges: bytes`. `Range: bytes=1000000-` con `Accept-Encoding` → 206, sin comprimir.
- **Compresión:** HTML, JS y CSS con `zstd`; PNG sin codificar.

**Revisión en Chrome contra el contenedor** (`BASE_URL=http://localhost:8080/ npm run verify`): **78/82**, igual que contra `vite preview`.
- **Pasan** a 320, 375, 768, 1440 y 2560 px:
  - imágenes;
  - entradas animadas;
  - enlaces de WhatsApp e Instagram;
  - teclado;
  - video (reproducción, pausa, rango);
  - movimiento reducido;
  - sin errores de consola ni solicitudes externas.
- **Fallan** las 4 verificaciones de contraste del texto de portada a 375 y 768 px. Es un problema del diseño, ya documentado en `FASE-04-DISENO.md`; no lo introduce el servidor.

**No realizado:**
- despliegue real en Railway;
- prueba con el healthcheck y el proxy de Railway;
- dominio y HTTPS reales.

## 3. Repositorio y rama

| | |
| --- | --- |
| Remoto | `origin` → `https://github.com/juanelinaresm-gif/app_natures_waysco.git` |
| Rama | `main` (también `origin/main`) |
| Último commit | `fe6c11a Initial commit`: es el mismo en local y en el remoto (`git ls-remote`); no hay divergencia. |
| Estado | Todo el proyecto está **sin commit**: solo `README.md` está versionado (y modificado); el resto aparece como no rastreado. |

No se hizo commit, push ni ningún cambio en el remoto.

**Railway construye desde lo que está en GitHub**, así que hay que hacer commit y push antes del primer despliegue.

**Autoría:** el usuario Git local es `Juan Pablo <96211704+juanpabloow@users.noreply.github.com>` y el repositorio pertenece a `juanelinaresm-gif`. Hay que confirmar que esa cuenta tiene permisos de escritura.

## 4. Root Directory para Railway

El Dockerfile, el Caddyfile y el `package.json` están en la raíz del repositorio. **Root Directory: vacío (o `/`)**, es decir, la raíz del repositorio.

## 5. Configuración exacta en Railway

1. **New Project → Deploy from GitHub repo** → `juanelinaresm-gif/app_natures_waysco`, rama `main`.
2. **Settings → Source:**
   - Root Directory: vacío (raíz);
   - Branch: `main`.
3. **Settings → Build:**
   - Builder: **Dockerfile**. Lo fija `railway.json`; Railway también lo detecta solo.
   - Dockerfile Path: `Dockerfile`.
   - No definir Build Command ni Start Command: el Dockerfile ya los tiene.
4. **Settings → Deploy:**
   - Healthcheck Path: `/health`, con timeout de 60 s (lo fija `railway.json`);
   - Restart Policy: On Failure, 5 intentos.
5. **Variables:** ninguna obligatoria.
   - Railway inyecta `PORT` y Caddy la usa.
   - No definir `PORT` a mano salvo que se quiera fijar.
   - La app no usa variables `VITE_*` ni secretos.
6. **Settings → Networking → Generate Domain:**
   - el puerto destino es el que Railway asigna en `PORT`;
   - si Railway pide el puerto, usar el valor de `PORT` (3000 solo aplica en local);
   - después, conectar el dominio propio si lo hay.
7. **Réplicas y región:** por defecto. Es un sitio estático sin estado ni volúmenes.

> Si en `railway.json` y en el panel hay valores distintos, prevalece `railway.json`.

## 6. Pendientes antes de publicar

**Bloqueantes de contenido**, ya registrados en `docs/pendientes.md`:
1. **Texto inventado en imágenes y video:** los envases, la imagen de Esencia y el video de portada muestran etiquetas con texto que no corresponde al empaque real.
2. **Número de WhatsApp provisional:** `+57 312 447 5525` está pendiente de confirmación del propietario.
3. **Contraste del diseño:** palabras en ámbar y verde, y texto de portada sobre el video en móvil.
4. **«Powered by MONTSERRAT_AI» en el pie:** confirmar si debe aparecer.
5. **Registro INVIMA:** sin verificar; no se usa en la página.

**Técnicos:**

6. **Commit y push.** Decidir qué se versiona:
   - `docs/reports/capturas/` pesa 133 MB y `visual-pieces/` 17 MB, más el ZIP de 3,6 MB;
   - no entran en la imagen (los excluye `.dockerignore`), pero sí harían pesado el repositorio;
   - opciones: excluir las capturas del repositorio o usar Git LFS.
7. **Dominio definitivo:** sin él faltan `canonical`, `og:url`, `og:image` y `sitemap.xml`.
8. **Medios nuevos:** si se agrega uno, también hay que permitirlo en `.dockerignore`. Si falta, las pruebas fallan dentro del build y avisan.
9. **Imagen Caddy en root:** la imagen oficial corre como root. Se podría pasar a un usuario sin privilegios; no se cambió para no alterar el comportamiento probado.
10. **Escucha IPv6:** se configuró `bind 0.0.0.0` como se pidió. En el contenedor, el socket apareció como `:::8080` (Go escucha en modo dual con la dirección comodín). No se probó la red privada IPv6 de Railway.
11. **Primer despliegue:** revisar los registros de Railway (formato JSON), el healthcheck y abrir el dominio generado en un teléfono real.
