# Navegación suave, mensajes de WhatsApp y precio de ColagenPlus

No hay cambios visuales en el diseño, salvo el precio de ColagenPlus. Sin commit, push ni deploy.

## Archivos modificados

- `src/index.css`: desplazamiento suave y margen de las anclas bajo la barra.
- `src/components/Header.tsx`: publica el alto real de la barra en `--nav-h`, cierra el menú antes de navegar y usa el mensaje de WhatsApp de la barra.
- `src/commerce/whatsapp.ts`: único lugar donde se redactan los mensajes.
- `src/commerce/order.ts`: cada acceso pide el mensaje de su contexto.
- `src/components/Closing.tsx`: usa el contexto de contacto.
- `src/components/Footer.tsx`: usa el contexto general.
- `src/data/catalog.ts`: precio de ColagenPlus en `103000`.
- `tests/catalog.test.ts`: precios, enlaces y mensajes.
- `scripts/verify-ui.mjs`: pruebas en navegador de navegación, mensajes y precio.

## Cambios

### 1. Navegación fluida

- **Sin JavaScript de scroll:** se usa `scroll-behavior: smooth` del navegador. Así siguen funcionando los enlaces por hash (la URL cambia a `#productos`, etc.), el foco y la navegación con teclado. No hay librerías ni se intercepta el scroll manual.
  - Aplica a todos los enlaces internos: barra, menú móvil, «Conoce DetoxPlus», «Ver productos», enlaces del pie, logo y enlace para saltar al contenido.
- **Margen bajo la barra fija:** es su alto real. `Header.tsx` lo mide con un `ResizeObserver` y lo publica en `--nav-h`, que usa `scroll-padding-top`. Mientras carga el script hay un valor de respaldo de 80 px, o 70 px en móvil.
- **Menú móvil:** al tocar un enlace, el menú se cierra y se pinta cerrado (`flushSync`) antes de que el navegador empiece a desplazarse. El panel flota sobre la página, así que cerrarlo no cambia el alto de la barra ni de la página, y no hay saltos.
- **Movimiento reducido:** con `prefers-reduced-motion: reduce` el suave no se activa y el salto es directo.

### 2. WhatsApp según el contexto

`src/commerce/whatsapp.ts` es el único lugar donde se redactan los mensajes. Los componentes piden la acción de su contexto, nunca la URL.

| Lugar | Mensaje |
| --- | --- |
| Barra | Hola, me gustaría conocer más sobre los productos de Nature’s Wayco. |
| DetoxPlus | Hola, quiero pedir DetoxPlus ($70.000 COP). ¿Me confirman disponibilidad y envío? |
| ColagenPlus | Hola, quiero pedir ColagenPlus ($103.000 COP). ¿Me confirman disponibilidad y envío? |
| Contacto («Hablamos») | Hola, me gustaría recibir orientación para elegir entre DetoxPlus y ColagenPlus. |
| Pie y otros accesos generales | Hola, me gustaría recibir información sobre Nature’s Wayco. |

- El número no cambió: `573124475525`.
- Los mensajes van codificados con `encodeURIComponent`: acentos, `¿`, `$` y el apóstrofo tipográfico de Nature’s.
- El enlace solo precarga el mensaje en `wa.me`; el cliente decide si lo envía.

### 3. Precio de ColagenPlus

- **Fuente única:** `catalog.ts`, con `priceCOP: 103000`. De ahí salen:
  - el precio visible y su animación;
  - el texto accesible «Precio: $103.000 COP»;
  - la respuesta de preguntas frecuentes;
  - el mensaje de pedido.
- **DetoxPlus** sigue en $70.000 COP.
- **Metadatos:** `index.html` no tiene datos estructurados, y su descripción y Open Graph no mencionan precios, así que no había nada que cambiar.
- **Referencias a $130.000:** no queda ninguna en el código que se publica. Solo aparece en archivos históricos que no se sirven:
  - el archivo original de Claude Design (`visual-pieces/diseno/`);
  - las portadas de la fase 2 (`docs/design/fase-02/`);
  - los reportes anteriores.

## Verificaciones

- Build, lint y tipos sin errores. Pruebas unitarias: 10/10, con precios, ambos pedidos, los tres mensajes generales, la codificación y el precio del mensaje igual al visible.
- `npm run verify` da **230/230** (`verify-navegacion-whatsapp-precio.txt`). Las nuevas o actualizadas:
  - **Navegación suave**, en 320, 375, 768 y 1440: los 4 enlaces de la barra o del menú, los 2 botones de la portada, los 4 del pie y el logo.
    - Cada uno actualiza el hash.
    - La sección empieza justo bajo la barra (±2 px) y su título queda visible.
    - El desplazamiento pasa por varios cuadros intermedios, con 151 cuadros registrados desde el clic.
  - **Menú móvil:** cerrado desde el primer cuadro del desplazamiento; la barra y la página no cambian de alto.
  - **Scroll manual:** la rueda del ratón sigue desplazando la página.
  - **Movimiento reducido**, en 375 y 1440: `scroll-behavior: auto`, el primer cuadro ya está en el destino y el título queda visible.
  - **WhatsApp:** hay exactamente 5 accesos (barra, DetoxPlus, ColagenPlus, contacto y pie). Cada uno tiene su mensaje exacto y bien codificado. Se revisaron sin abrirlos y sin enviar nada.
  - **Precio:** el de cada mensaje coincide con el de su ficha. Preguntas frecuentes muestra $70.000 y $103.000 y no contiene 130.000. Se comprobó en los 11 tamaños de pantalla.
  - **Lo anterior sigue pasando:** teclado, menú (Escape, clic fuera), video, contraste, uniones del header móvil y movimiento reducido.

## Capturas

En `capturas/navegacion-whatsapp-precio/`:

- `movil-375-colagen.png` y `escritorio-1440-colagen.png`: la ficha con **$103.000 COP**.
- `*-ancla-*.png`: cada sección al llegar desde la barra o el menú, en 375 y 1440, con el título bajo la barra.

## Pendientes

- **Ajustes del header móvil sin commit:** siguen en el mismo árbol de trabajo (`HEADER-MOVIL.md`), sin commit todavía.
- **Número de WhatsApp provisional:** el propietario debe confirmarlo (`docs/pendientes.md`).
- **Dispositivos reales:** falta probar en iOS Safari y Android. Safari soporta `scroll-behavior: smooth` desde la versión 15.4.
