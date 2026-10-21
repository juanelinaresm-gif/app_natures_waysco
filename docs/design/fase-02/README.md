# Fase 2 · Exploración de portada

Prototipos de diseño en HTML/CSS. **No forman parte de la aplicación**: no se importan desde
`src/`, no se copian a `public/` y no entran al build.

## Abrir

Abre los archivos directamente en el navegador (no requieren servidor):

- `portadas/alternativa-a.html`: A · El nivel (recomendada)
- `portadas/alternativa-b.html`: B · El dúo
- `comparativa.html`: las dos lado a lado (usa las capturas)

Para revisarlos en móvil, usa la vista de dispositivo de Chrome (`Cmd + Option + I`, luego `Cmd + Shift + M`) con 390 × 844.

## Regenerar capturas y mediciones

Desde la raíz del proyecto:

```bash
node docs/design/fase-02/capturar.mjs
```

Genera `capturas/*.png` y `capturas/mediciones.json` con Chrome. Bloquea cualquier solicitud externa.

## Contenido

| Ruta | Qué es |
| --- | --- |
| `portadas/comun.css` | Tokens de color, tipografía, encabezado fijo, botones y etiqueta de precio |
| `portadas/alternativa-a.*`, `portadas/alternativa-b.*` | Cada portada |
| `portadas/assets/img/` | Recortes de los materiales originales (ver reporte) |
| `portadas/assets/fonts/` | Urbanist (licencia OFL) |
| `capturas/` | Capturas a 320, 390, 768, 1024 y 1440 px, y mediciones |

El reporte está en `docs/reports/FASE-02-portadas.md`.
