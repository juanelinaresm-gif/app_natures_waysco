# Fase 2 · Portada: dos alternativas para revisión

Proyecto: landing de Nature’s Wayco · Fecha: 2026-10-20 · Estado: **detenido para revisión** antes de desarrollar la página completa.

Las alternativas son prototipos HTML/CSS en `docs/design/fase-02/`. No se tocó la aplicación: `src/`, `public/`, `scripts/`, `tests/`, `index.html` y la configuración siguen como al cerrar la Fase 1 (verificado por fecha de modificación). Tampoco se publicó nada.

**Cómo verlas**
- Abrir en el navegador `docs/design/fase-02/portadas/alternativa-a.html` y `alternativa-b.html`.
- Vista lado a lado: `docs/design/fase-02/capturas/comparativa.png`.
- Regenerar capturas y mediciones: `node docs/design/fase-02/capturar.mjs`.

## 1. Concepto de cada alternativa

### A · El nivel (recomendada)

**Idea:** DetoxPlus, servido. La foto real del vaso con la bebida verde junto al envase es la protagonista.

**Gesto memorable:** un campo lima sube hasta la altura del líquido del vaso y cruza la pantalla de lado a lado. Esa línea separa el mensaje, arriba sobre marfil, de la acción, abajo sobre lima.

**Elementos:**
- Etiqueta adhesiva en el amarillo del logo: «El más vendido · DetoxPlus · $70.000 COP».
- Línea de presentación y sabor: «600 g, 30 porciones. Sabor a lulo, kiwi y manzana».
- ColagenPlus aparece como una ficha pequeña con foto y precio, enlazada a su producto.

**Móvil:** titular, texto en 2 líneas y foto cuadrada al 80 % del ancho, alineada a la derecha. La etiqueta queda sobre el borde de la foto. En el campo lima van el dato, el botón de pedido, el enlace al catálogo y la ficha de ColagenPlus.

**Escritorio:** texto a la izquierda y foto vertical a la derecha. El campo lima corta la foto a la altura del líquido.

**Movimiento:** una sola entrada. El campo sube como el líquido y la etiqueta aparece al final. Se desactiva con `prefers-reduced-motion`.

### B · El dúo

**Idea:** el catálogo visible desde la portada.

**Composición:** dos campos de color, verde para DetoxPlus y ámbar para ColagenPlus, cada uno con la banda inferior de su etiqueta. DetoxPlus va primero, ocupa cerca del 58 % y lleva «El más vendido».

**Escritorio:** las fotos se apoyan sobre las bandas, como envases en una repisa. ColagenPlus queda más bajo y escalonado.

**Móvil:** dos fichas lado a lado. La de ColagenPlus es más angosta y está desplazada hacia abajo.

**Acciones:** explorar primero. «Ver productos» es el botón principal y «Consultar por WhatsApp» el secundario. Cada ficha enlaza a su producto.

**Movimiento:** una sola entrada, en la que los dos campos suben, DetoxPlus primero.

### Qué cambia realmente entre las dos

| | A · El nivel | B · El dúo |
| --- | --- | --- |
| Protagonista | Un producto servido (DetoxPlus) | Los dos envases, con jerarquía |
| Estructura | Asimétrica: texto + foto, cortados por una línea horizontal | Dos campos verticales de color, lado a lado |
| Acción principal | Pedir DetoxPlus por WhatsApp (1 toque) | Ver productos (explorar) |
| Rol de ColagenPlus | Ficha secundaria con precio | Campo propio, menor |
| Sabor y preparación | Bebida en primer plano + línea de sabor | Bebida pequeña + sabor bajo el nombre |

### Mediciones (Chrome, sin animación)

| Vista | Base actual (Fase 1) | A · El nivel | B · El dúo |
| --- | --- | --- | --- |
| Encabezado, 390 × 844 | 118 px (2 filas) | 60 px | 60 px |
| Titular, 390 × 844 | 49 px, 3 líneas | 33 px, 2 líneas | 33 px, 2 líneas |
| Texto de portada, 390 × 844 | 5 líneas | 2 líneas | 2 líneas |
| Foto de producto, 390 × 844 | Empieza a 583 px; 60 % visible | Completa, desde 218 px | Completa, desde 284 px |
| Acción principal, 390 × 844 | Termina a 539 px | Termina a 609 px | Termina a 266 px |
| 390 × 664 (Safari con barras) | Foto ~19 % visible | Foto y botón visibles | Fotos y botones visibles |
| Titular, 1440 × 900 | 106 px, 4 líneas | 60 px, 2 líneas | 60 px, 2 líneas |
| Desbordamiento horizontal (320–1920 px) | No | No | No |

Con eso, a 390 × 844 se ven el titular, una imagen reconocible del producto y la acción principal en las dos alternativas. Lo mismo ocurre a 390 × 664 y a 320 × 640.

## 2. Cambios frente a la base actual

| Problema | Base actual | Propuesta |
| --- | --- | --- |
| 1. El producto aparece tarde en móvil | Encabezado de 2 filas, titular de 3 líneas, texto de 5 líneas; la foto empieza bajo el pliegue. | Encabezado de 60 px en una fila (logo, «Menú», WhatsApp), titular de 2 líneas y texto de 2. La foto queda completa en la primera pantalla. |
| 2. El titular domina | Bricolage a 49 px (móvil) y 106 px (escritorio), con `max-width: 11ch`. | Urbanist peso 760, interlineado 1,04, a 33 px en móvil y 60 px en escritorio. Sin saltos manuales: `text-wrap: balance` y ancho del contenedor. Probado a 320, 390, 768, 1024, 1440 y 1920 px: 1 o 2 líneas, sin palabras sueltas. |
| 3. CTA redundantes | «Conoce DetoxPlus» y «Ver productos»: dos anclas internas. | Una acción sale a WhatsApp (ícono de WhatsApp, verbos «Pedir» o «Consultar») y otra navega en la página (flecha hacia abajo, verbo «Ver»). |
| 4. Fichas con todo al mismo nivel | Seis datos con el mismo peso. | En esta etapa no se rediseñan. Jerarquía propuesta para la siguiente: nombre, descripción de una frase, sabor, presentación, precio y botón. «Ingredientes y datos del empaque» irían en un desplegable (`<details>`). La portada B ya aplica nombre, sabor y precio. |
| 5. Bloques repetidos | Alternancia foto/texto en casi todas las secciones. | La portada concentra el gesto. Recorrido propuesto, para validar: portada A → el dúo de B como entrada al catálogo → fichas con desplegables → preparación en pasos del empaque junto al video vertical → historia con la foto del lago a todo el ancho → preguntas → cierre. |
| 6. El botón flotante tapa texto | Botón que aparece y desaparece según la zona. | Se elimina. El encabezado fijo lleva WhatsApp siempre visible, en el mismo lugar y sin cambios al desplazarse. El contenido pasa por debajo de una franja fija de 60 px, así que nada queda encima del área de lectura. Anclas y foco no quedan ocultos gracias a `scroll-padding-top`. |

**Otros cambios**
- Navegación: «Productos, Preparación, Nosotros, Preguntas». Antes decía «Rutina» y «Esencia».
- Texto de portada: el sugerido en el brief.
- Sin etiquetas en mayúsculas sostenidas ni numeraciones decorativas.

## 3. Paleta y tipografía propuestas

### Paleta

Los tonos se tomaron de las etiquetas y el logo, y se aclararon para pantalla.

| Nombre | Hex | Uso | Contraste |
| --- | --- | --- | --- |
| Leche | `#FBF9F4` | Fondo general | tinta 15,1:1 · tinta-2 7,2:1 |
| Blanco | `#FFFFFF` | Encabezado (fondo del logo), fichas | — |
| Tinta | `#17251C` | Texto, botón principal | blanco sobre tinta 15,9:1 |
| Tinta 2 | `#4A574E` | Texto secundario | ≥ 6,5:1 en todos los fondos claros |
| Turquesa (logo) | `#04A0CE` | Solo decorativo | 3,0:1: no se usa en texto |
| Turquesa hondo | `#00708F` | WhatsApp general, enlaces, foco | blanco 5,7:1 · sobre leche 5,4:1 |
| Sol (logo) | `#FABE04` | Etiqueta de precio, «El más vendido» | tinta 9,4:1 |
| Lima (DetoxPlus) | `#A8CF45` | Campo de la portada A, banda | tinta 8,9:1 |
| Lima campo | `#E6F1CF` | Fondo de DetoxPlus | tinta 13,5:1 |
| Ámbar (ColagenPlus) | `#F5A524` | Banda de ColagenPlus | tinta 7,8:1 |
| Ámbar campo | `#FFEFCB` | Fondo de ColagenPlus | tinta 14,0:1 |

### Tipografía

**Familia:** Urbanist variable (100–900, licencia OFL), una sola para todo. Se probó junto al logo con Jost, Outfit, Gabarito, Figtree, Onest y Bricolage. Urbanist es la más cercana a la geometría del nombre del logo: *a* de un solo piso, *y* recta y terminal inclinada de la *t*. Así el logo y el texto se leen como un mismo sistema.

| Rol | Tamaño | Peso |
| --- | --- | --- |
| Titular | `clamp(2.05rem, 1.25rem + 3.4vw, 3.75rem)`: 33 px a 390, 46 px a 768, 60 px a 1440 | 760 |
| Nombres de producto | 20 px en móvil, hasta 48 px en escritorio | 820 |
| Botones | 17 px | 750 |
| Texto | 17 px | 500 |
| Texto de portada | 16–19 px, interlineado 1,45 | — |

## 4. Jerarquía y comportamiento de los CTA

**Sistema común**
- **WhatsApp:** toda acción que sale a WhatsApp lleva el ícono de WhatsApp y un verbo de contacto («Pedir», «Consultar»).
- **Navegación interna:** lleva una flecha hacia abajo y el verbo «Ver».
- **Color:** tinta para la acción principal de la pantalla; turquesa para el contacto general (el color del logo); campos lima y ámbar para lo que es de cada producto.
- **Encabezado:** «WhatsApp» en turquesa, siempre visible y sin cambiar de posición.
- **Enlaces externos:** abren en una pestaña o app nueva (`rel="noopener noreferrer"`).
- **Mensajes:** precargados y codificados, como en la Fase 1.
- **Estados:** al pasar el cursor el botón se oscurece; el foco es un anillo de 3 px.

**A · El nivel**

| Nivel | Texto | Destino | Estilo |
| --- | --- | --- | --- |
| Principal | Pedir DetoxPlus por WhatsApp | `wa.me` con «Quiero pedir DetoxPlus ($70.000 COP)…» | Tinta, ícono lima, 52 px de alto |
| Secundario | Ver los dos productos ↓ | `#productos` | Enlace subrayado con flecha |
| Terciario | Ficha «ColagenPlus $130.000» | `#colagenplus` | Píldora blanca con foto |
| Persistente | WhatsApp (encabezado) | `wa.me` consulta general | Turquesa |

**B · El dúo**

| Nivel | Texto | Destino | Estilo |
| --- | --- | --- | --- |
| Principal | Ver productos ↓ | `#productos` | Tinta |
| Secundario | Consultar por WhatsApp («Consultar» en móvil) | `wa.me` consulta general | Contorno turquesa |
| Fichas | DetoxPlus / ColagenPlus | `#detoxplus`, `#colagenplus` | Toda la ficha es enlace |
| Persistente | WhatsApp (encabezado) | `wa.me` consulta general | Turquesa |

**Textos cortos en pantallas angostas:** en A, a menos de 360 px el botón dice «Pedir DetoxPlus». En B, en móvil, dice «Consultar». El nombre accesible conserva siempre la frase completa.

## 5. Materiales utilizados y faltantes

### Utilizados

| Original | Recorte o derivado (`docs/design/fase-02/portadas/assets/`) | Dónde |
| --- | --- | --- |
| `video_detox.mp4`, fotograma a 9,0 s | `detoxplus-vaso-1x1.webp` (576 × 576) y `detoxplus-vaso-3x4.webp` (576 × 768) | Foto principal de A; ficha DetoxPlus de B |
| `colageno_img.jpeg` | `colagenplus-vaso-3x4.webp` (600 × 800) y `colagenplus-mini.webp` (240 × 240) | Ficha ColagenPlus de B; ficha pequeña de A |
| `logo.jpeg` (derivado de Fase 1) | `logo-300.webp`, `logo-600.webp` | Encabezado, siempre sobre blanco |
| `etiqueta_detox.jpeg` | — | Solo referencia: 600 g, 30 porciones |

**Tratamiento:** solo recortes y escalado. No se redibujó el logo, no se retocaron etiquetas y no hay imágenes generadas.

**Revisados y no usados en la portada:**
- `detox_y_colageno.jpeg`: los envases quedan cortados en los bordes y no muestra bebida ni sabor. Sirve para el catálogo.
- `detox_colageno_nature.jpeg`: queda para la historia de marca.
- `video_detox_colageno.mp4`: repite esa misma escena.

### Faltantes (en orden de impacto)

1. **Foto de DetoxPlus en alta resolución**, de al menos 1.600 px de ancho: envase con la etiqueta completa visible (hoy el vaso tapa la «D») y la bebida preparada. La portada recomendada depende de un fotograma de video de 576 px, que se ve suave en pantallas retina de escritorio.
2. **ColagenPlus preparado, de frente, en la misma sesión**, para unificar luz y fondo. La foto actual es cenital y con otra luz.
3. **Fotos reales de los sabores:** lulo, kiwi, manzana verde y cítricos (Citrus Punch), para que el sabor tenga presencia sin depender de texto.
4. **Personas en momentos cotidianos**, con autorización de uso, para acercarse a la personalidad del Instagram.
5. **Logo en SVG o PNG con transparencia.** Hoy obliga a usar fondo blanco.
6. **Envases recortados** (fondo transparente, sin retocar etiquetas), para componer con libertad.
7. **Video de preparación en mayor resolución**, si se quiere mostrar grande.

No se consultó el Instagram de la marca. La personalidad descrita sale del brief.

## 6. Consideraciones de accesibilidad

- **Lighthouse (local, móvil):** accesibilidad 100 en A y B. Buenas prácticas marcó 96 solo por un `favicon.ico` ausente en el servidor de prueba de los prototipos.
- **Contraste:** todo el texto sobre sus fondos supera 5,3:1 (tabla de la sección 3). El turquesa del logo no se usa en texto.
- **Foco:** anillo de 3 px, turquesa hondo. Sobre lima y ámbar cambia a tinta (8,9:1), porque turquesa sobre lima solo da 3,1:1.
- **Encabezado fijo:** su altura es constante (60/72 px) y `scroll-padding-top` evita que tape el destino de una ancla o un elemento enfocado (WCAG 2.4.11). No aparece ni desaparece al desplazarse.
- **Áreas táctiles:** ≥ 44 px (botones de 44–52 px, enlaces con `min-height: 2.75rem`).
- **Etiqueta en el nombre:** las versiones cortas («Pedir DetoxPlus», «Consultar») son el comienzo del nombre accesible completo (WCAG 2.5.3).
- **Menú móvil:** usa `aria-expanded` y `aria-controls`, el texto cambia entre «Menú» y «Cerrar», y Escape lo cierra y devuelve el foco al botón. Los enlaces van inmediatamente después del botón en el orden de foco.
- **Titular sin saltos manuales:** se reacomoda sin cortes forzados de 320 a 1920 px.
- **Imágenes:**
  - En A, la foto principal tiene texto alternativo descriptivo.
  - En B, las fotos de las fichas usan `alt=""`, porque el enlace ya nombra el producto, su sabor y su precio; así no se duplica la lectura.
  - La etiqueta de precio es texto real, no imagen. Va girada solo 4°.
- **Movimiento:** con `prefers-reduced-motion` no hay animaciones.
- **Pendiente para la implementación:**
  - Lector de pantalla (VoiceOver y NVDA).
  - Zoom al 200 %: con poca altura, conviene que el encabezado deje de ser fijo, por ejemplo con `@media (max-height: 500px)`.
  - Modo `forced-colors`: la etiqueta y los campos dependen del fondo; habrá que añadir bordes.
  - Pruebas en iPhone y Android reales.

## 7. Recomendación y decisiones pendientes

### Recomendación: A · El nivel

- **Reconocimiento de marca:**
  - El logo está siempre visible en el encabezado.
  - La tipografía repite su geometría.
  - El amarillo del logo marca el precio y el turquesa marca el contacto.
  - La línea lima sale de la etiqueta de DetoxPlus.
- **Protagonismo de DetoxPlus:** es lo primero que se ve y se muestra preparado, con su sabor, su presentación y «El más vendido» junto al precio. B le da más espacio que a ColagenPlus, pero lo presenta como un envase entre dos.
- **Claridad del catálogo:** suficiente en la portada. ColagenPlus aparece con foto y precio, y «Ver los dos productos» lleva al catálogo. B es más claro en este punto. Por eso propongo usar el dúo de B como entrada del catálogo, justo después de la portada A. Así se gana claridad sin repetir la composición.
- **Pedidos por WhatsApp:** A permite pedir el producto más vendido con un toque, con el mensaje ya escrito y en la primera pantalla de un móvil. En B, para pedir hay que pasar primero por la ficha del producto, o conformarse con una consulta general.

**Riesgo principal de A:** depende de la foto de DetoxPlus. Con el fotograma actual funciona en móvil, pero en escritorio retina se ve suave. Conseguir el faltante n.º 1 es lo que más mejora esta portada.

### Decisiones pendientes

1. Elegir A o B, o A con el dúo de B como inicio del catálogo (recomendado).
2. Aprobar el cambio de tipografía de Bricolage Grotesque a Urbanist.
3. Aprobar que el encabezado fijo con WhatsApp reemplace el botón flotante. Costo: 60 px permanentes en móvil.
4. Confirmar que el botón principal de la portada vaya directo a WhatsApp, y no primero a la ficha de DetoxPlus.
5. Validar los nombres de navegación: «Preparación» y «Nosotros».
6. Gestionar la sesión de fotos o los materiales faltantes de la sección 5. Si no llegan, la implementación seguirá con el fotograma actual y esa limitación quedará documentada.
7. Siguen vigentes los pendientes de la Fase 1: número de WhatsApp provisional, dominio y verificación del registro INVIMA.

**Siguiente paso:** con la alternativa elegida, diseñar el resto del recorrido (catálogo con desplegables, preparación, historia, preguntas y cierre) y después implementarlo en la aplicación con Claude Code.
