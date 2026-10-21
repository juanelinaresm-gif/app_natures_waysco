# Pendientes internos antes de publicar

Estos puntos no aparecen en el texto comercial de la página.

## Requieren confirmación del propietario

| Dato | Estado actual | Dónde se cambia |
| --- | --- | --- |
| Número de WhatsApp `+57 312 447 5525` | Provisional: observado en Instagram. La etiqueta de ColagenPlus muestra un número que termina en «…12 447 5525», parcialmente visible. | `src/data/contact.ts` |
| Dominio definitivo | No existe. Sin él no se definen `canonical`, `og:url`, `og:image` ni `sitemap.xml`. | `index.html`, `public/robots.txt` |
| Uso de la frase «Nuestro producto más vendido» para DetoxPlus | Basada en el brief del negocio. Confirmar que pueden sostenerla. | `src/data/catalog.ts` |
| Envíos: ciudades, costos y tiempos | No publicados a propósito; se consultan por WhatsApp. | FAQ en `src/components/Faq.tsx` |
| Si el precio incluye envío o impuestos | Desconocido; no se menciona. | — |
| Medios de pago | Desconocidos; la página dice que los detalles se acuerdan por WhatsApp. | — |
| Permiso de uso de fotos y videos | Se asume que los materiales entregados son del negocio. | — |
| Audio del video de DetoxPlus | El archivo trae pista de audio; no se revisó su contenido ni sus derechos. | `public/media/video/` |

## Recortes de producto con transparencia (FASE-02-PNG): no publicar sin revisar

Las fichas de DetoxPlus y ColagenPlus usan `visual-pieces/recortes/*-frente-recorte-v1.png`. Según su
`recortes-generacion-metadata.json`, se hicieron con un generador de imágenes («built-in image_gen»),
y la misma nota advierte que el microtexto y los bordes requieren revisión antes de publicar. Al
compararlas con las fotos originales, la etiqueta **cambia información del producto**:

| Envase | Foto original | Recorte v1 |
| --- | --- | --- |
| DetoxPlus | «…a base de manzana verde **en polvo** con pepino, brócoli…» | «…manzana verde **piña en polvo** con pepino, brocoli…»: agrega piña |
| DetoxPlus | Sin mención de stevia | «**· Con stevia ·**» bajo «600g» |
| DetoxPlus | Ícono de cronómetro en «Disolución rápida» | Ícono de engranaje; hoja añadida sobre «30» |
| ColagenPlus | «Colágeno tipo **(I, II, III, IV, V, VI, VII, VIII y IX)**» | «Colágeno tipo **II, II, III, … VIII, X XY**» |
| ColagenPlus | «Sin maltodextrina» | «Sin malto**dek**trina» |

Evidencia: `docs/reports/capturas/fase-02-png/discrepancias-etiquetas.png`.

Antes de publicar hay que hacer una de dos cosas:
1. Que el propietario confirme, con el envase físico, que el texto del recorte corresponde al
   empaque vigente. Piña y stevia son información de ingredientes.
2. O reemplazar los recortes por fotografía real con fondo eliminado sin regenerar la etiqueta.

Para volver a las fotografías anteriores hay que cambiar `detoxCutout`/`colagenCutout` por
`detoxPhoto`/`colagenPhoto` en `src/data/catalog.ts`. Sus derivados siguen en `public/media/` y,
si se descarta esa vuelta atrás, pueden eliminarse.

## Video de fondo de la portada (FASE-03): no publicar sin revisar

`visual-pieces/video/home-background-original.mp4` llegó como «WhatsApp Video…», sin metadatos de
origen. El texto de las etiquetas que muestra **no corresponde al empaque real** y contiene palabras
inexistentes, típicas de un video generado:

- **ColagenPlus:** «Metcla di polvo para prepadar besida a base de coláceno horoucado», «Pesuines
  for envnee», «Citflb Punch».
- **DetoxPlus:** «Hezela en polvo…», «600g mele noto», «Poretones», «Drolución rapisa»,
  «Lulo - kino manzana».

Evidencia: `docs/reports/capturas/fase-03/video-etiquetas.png`. En escritorio (1440 px) varias de estas
palabras se leen con claridad; en móvil el velo cubre buena parte de la etiqueta.

Antes de publicar hay que hacer una de dos cosas:
1. Confirmar con el propietario que acepta mostrar envases con ese texto.
2. O reemplazar el clip por video real de los envases.

Para volver a la foto anterior basta usar `heroPhoto` en `src/components/Hero.tsx`.

## Diseño de Claude Design (FASE-04): revisar antes de publicar

La página implementa el diseño «Diseño dinámico Natures Wayco» tal cual. Puntos del diseño que
requieren decisión:

- **Imagen de Esencia** (`visual-pieces/diseno/esencia-bosque.png`): es una imagen generada. Sus
  etiquetas tienen texto inexistente («CIN & COLARNICS», «10000», «600%»). Reemplaza la foto real
  junto al lago.
- **Envases** (`detox-jar.png`, `colagen-jar.png`): repiten los errores de los recortes de FASE-02-PNG
  («piña en polvo», «con stevia», tipos de colágeno mal escritos).
- **Video de portada** (`video/home-background-v2-original.mp4`, 6,5 s): mismo tipo de texto
  inventado que el anterior («Coláceno horoucado», «Coagulans manzana»). El diseño lo muestra con
  `object-fit: cover` y `scale(1.08)`, lo que vuelve a recortar el fotograma (lo contrario de FASE-03B).
- **Contraste del diseño:**
  - «día» y «frecuentes» en ámbar `#F2A422` sobre crema: 1,93:1 (mínimo 3:1 en texto grande).
  - «integra» y «esencia» en verde `#7FAE2A`: 2,44:1.
  - «WhatsApp» en ámbar dentro del texto de Esencia: 1,93:1 (mínimo 4,5:1).
- **Texto de portada en móvil y tableta:** el velo del diseño es horizontal; en pantallas angostas el
  texto queda sobre la etiqueta del video (peor caso 1,29:1, igual en el prototipo).
- **Pie de página:** «Powered by MONTSERRAT_AI» viene del diseño. Confirmar que debe aparecer.
- **Mensaje de WhatsApp:** cambió al del diseño: «Hola, quiero pedir DetoxPlus ($70.000 COP)», sin
  pedir disponibilidad ni envío. El contacto general abre el chat sin mensaje.
- **Barra en móvil:** el diseño no tiene variante móvil; los enlaces se reparten en dos filas
  (165 px de alto a 375 px).

## Verificaciones regulatorias

- La etiqueta de DetoxPlus muestra «Registro sanitario INVIMA NSA-004320-2018».
  **No se usa en la página**: su vigencia no se verificó de forma independiente.
  Antes de mencionarlo, consultarlo en los canales oficiales del INVIMA.
- En las fotos no se ve el registro de ColagenPlus.
- Las declaraciones «sin soya, sin gluten, sin maltodextrina, sin azúcar añadida» se
  muestran como lo que indica el empaque, no como verificación propia.
- Las listas de ingredientes del lateral de las etiquetas están cortadas en las fotos y
  no se transcribieron. Las advertencias (p. ej. «Si presenta hiper…») tampoco se ven
  completas. Pedir la etiqueta completa si se quieren publicar.

## Materiales que mejorarían la página

- Fotografía individual de DetoxPlus en alta resolución. Hoy se usa un fotograma del
  video (576 × 720 px), que se ve suave en pantallas grandes.
- Logo en formato vectorial (SVG) o PNG con fondo transparente.
- Fotos de producto más recientes o de la misma sesión, para unificar luz y fondo.
