# Auditoría de accesibilidad, UX y diseño responsive

**Fecha:** 3 de octubre de 2026
**Alcance:** inspección no destructiva de [index.html](./index.html), [styles.css](./styles.css) y [script.js](./script.js). No se modificaron esos archivos.
**Referencia:** WCAG 2.2 nivel AA. Es una revisión de código y navegador; no constituye una certificación formal ni sustituye las pruebas con tecnologías de asistencia.

## 1. Resumen ejecutivo

La interfaz tiene una base sólida: incluye landmarks HTML, un único encabezado principal, navegación interna, controles nativos con nombres accesibles, etiquetas asociadas a los campos, un enlace para saltar al contenido, estilos de foco y una composición que se adapta a móvil. La versión auditada no contiene imágenes `<img>`, por lo que no requiere textos alternativos de imagen; los elementos gráficos de inventario tienen una descripción accesible.

**Resultado:** no debe declararse todavía conforme en su totalidad con WCAG 2.2 AA. Se encontraron cuatro problemas verificables que conviene resolver:

1. El indicador de foco no alcanza el contraste de 3:1 frente a sus fondos.
2. Los textos de los estados «Reservado», «Atrasado» y «Cotización» no alcanzan el contraste de 4.5:1.
3. En el diseño móvil se oculta la fila de encabezados de la tabla, y el orden visual de sus celdas no coincide con el orden de lectura.
4. A 320 px, el ancho mínimo del `body` puede generar 15 px de desplazamiento horizontal en un navegador con barra de desplazamiento clásica.

No se encontraron hallazgos críticos. Los hallazgos, su prioridad y sus recomendaciones se detallan abajo. Las evaluaciones de contraste son cálculos sobre los colores declarados en CSS; los valores pueden variar si se cambian los colores o el contexto de composición.

## 2. Hallazgos críticos, altos, medios y bajos

### Críticos

**Ninguno identificado.**

### Altos

#### A-01 — Contraste insuficiente del indicador de foco

- **Criterio:** WCAG 2.2, 1.4.11 Contraste no textual; afecta también la facilidad para localizar el foco al navegar con teclado.
- **Evidencia:** [styles.css](./styles.css), líneas 1324–1326, aplica `outline: 3px solid #88a674` a `:focus-visible`. El contraste calculado del contorno es **2.48:1** sobre `#f6f5f1`, **2.71:1** sobre blanco y **2.33:1** sobre `#eeeee8`, por debajo de 3:1.
- **Recomendación:** elegir un color de foco que contraste al menos 3:1 con las superficies adyacentes y conservar un contorno claramente visible en enlaces, botones, campos y controles dentro del diálogo.

### Medios

#### M-01 — Contraste insuficiente en tres estados de alquiler

- **Criterio:** WCAG 2.2, 1.4.3 Contraste mínimo.
- **Evidencia:** [styles.css](./styles.css), líneas 632–644. Los textos normales de los estados tienen estos contrastes calculados entre texto y fondo:
  - «Reservado»: `#667b8e` sobre `#eef2f5` = **3.90:1**.
  - «Atrasado»: `#b9653d` sobre `#fbefe7` = **3.73:1**.
  - «Cotización»: `#806d9c` sobre `#f2eef7` = **4.00:1**.

  Los tres valores son inferiores al mínimo 4.5:1 para texto normal. El texto de estado no es grande según la definición WCAG; además, no se comunica solo mediante color, pues cada insignia contiene una etiqueta textual.
- **Recomendación:** oscurecer los colores de texto de esas insignias, ajustar sus fondos o ambas cosas, y repetir el cálculo para todas las combinaciones. No depender solo del color para diferenciar estados.

#### M-02 — Encabezados de tabla inaccesibles y orden visual/DOM divergente en móvil

- **Criterios:** WCAG 2.2, 1.3.1 Información y relaciones y 1.3.2 Secuencia significativa.
- **Evidencia:** [index.html](./index.html), líneas 107–116, define una tabla con encabezados `<th scope="col">`. Sin embargo, en [styles.css](./styles.css), líneas 1506–1508, la regla móvil `.table-wrap thead { display: none; }` los retira de la presentación. Las celdas creadas en [script.js](./script.js), líneas 266–275, no incluyen encabezados repetidos ni nombres accesibles que indiquen su columna. Además, en móvil CSS coloca visualmente «Devolución» en la primera fila, aunque esa celda aparece después de «Material y cantidad» en el orden del DOM.
- **Impacto:** en la presentación móvil se pierde el contexto que permite interpretar fechas, materiales y saldos; el orden de lectura de tecnología de asistencia puede diferir del orden visual.
- **Recomendación:** conservar encabezados de columna accesibles o transformar explícitamente las filas en tarjetas con etiquetas visibles y relaciones semánticas mantenidas. Alinear el orden DOM con el visual y comprobar el resultado con lector de pantalla.

#### M-03 — Desplazamiento horizontal a 320 px

- **Criterio:** WCAG 2.2, 1.4.10 Reflow.
- **Evidencia:** [styles.css](./styles.css), líneas 34–36, fija `body { min-width: 320px; }`. En la prueba a 320 px, el navegador informó `innerWidth = 320`, `documentElement.clientWidth = 305` y `documentElement.scrollWidth = 320`; el `body` conservó 320 px de ancho. Esto produce 15 px de desbordamiento horizontal en ese entorno con barra de desplazamiento clásica. A 390, 768 y 1366 px no se observó desbordamiento horizontal de página.
- **Recomendación:** evitar que el ancho mínimo del `body` exceda el ancho de diseño disponible; permitir que el contenedor se reduzca al espacio útil y revisar también el ancho de navegación y pie de página en 320 px. Mantener desplazamiento horizontal solo en controles que realmente requieran una región desplazable, no en la página completa.

### Bajos

#### B-01 — Controles con área táctil menor que la recomendada para comodidad

- **Evidencia:** [styles.css](./styles.css), líneas 1124–1126, da 32 × 32 px al botón de cierre del diálogo; las reglas móviles de las líneas 1940–1954 reducen botones de cabecera a 36 px de alto. En la prueba, «Instalar app» midió aproximadamente 84 × 36 px y «Registrar alquiler» 129 × 36 px.
- **Evaluación:** esos botones superan el mínimo de 24 × 24 px de WCAG 2.2, 2.5.8, por lo que no se registran como incumplimiento AA. Aun así, una zona de 44 × 44 px suele ser más cómoda en teléfono, especialmente para el botón de cierre. La navegación también usa enlaces con poco relleno vertical.
- **Recomendación:** aumentar las áreas táctiles a cerca de 44 × 44 px cuando el espacio lo permita y verificar que el crecimiento no provoque solapamientos a 320 px.

#### B-02 — Títulos de indicadores no están marcados como encabezados

- **Evidencia:** [index.html](./index.html), líneas 54–74, presenta cada indicador en un `<article>`, pero su etiqueta se encuentra en un `<span>` dentro de `.metric-heading`, no en un elemento de encabezado.
- **Evaluación:** la jerarquía principal sí está ordenada —un `<h1>` y encabezados `<h2>` para alquileres e inventario—, por lo que esto no se considera un fallo confirmado de WCAG.
- **Recomendación:** si se espera que el personal recorra rápidamente los indicadores usando la lista de encabezados de su lector de pantalla, considerar un encabezado de nivel adecuado para cada tarjeta.

## 3. Evidencia y criterios que cumplen

### Estructura semántica y jerarquía

- **Cumple:** [index.html](./index.html), líneas 24–45 y 140–149, utiliza `header`, `nav`, `main`, `section`, `article`, `footer` y `dialog`. Hay un `<h1>` para el resumen, `<h2>` para las secciones principales y un `<h2>` para el diálogo; no se observan saltos de nivel en esa jerarquía.
- **Cumple:** los encabezados de la tabla de escritorio usan `<th scope="col">` ([index.html](./index.html), líneas 108–116), sujeto al hallazgo móvil M-02.

### Nombres accesibles, etiquetas y ARIA

- **Cumple:** la navegación tiene nombre con `aria-label`; el diálogo queda nombrado por `aria-labelledby`; el botón de cierre tiene `aria-label`; búsqueda, filtro y campos se asocian con etiquetas `<label>` ([index.html](./index.html), líneas 29, 91–104, 149–213).
- **Cumple:** el área de tabla que puede recibir foco tiene `role="region"` y `aria-label`; los cambios del estado de conexión, los errores del formulario y el resumen del cálculo utilizan regiones de estado o anuncios (`role="status"`, `role="alert"`, `aria-live`).
- **Cumple:** la barra de disponibilidad se expone con `role="img"` y un `aria-label` que expresa unidades disponibles y utilizables ([script.js](./script.js), líneas 321–337).
- **Observación:** el resumen del cálculo se anuncia con `aria-live="polite"` y se actualiza ante eventos `input` y `change` ([index.html](./index.html), línea 216; [script.js](./script.js), líneas 543–547). Comprobar con lector de pantalla que las actualizaciones por cada cambio no interrumpan ni repitan demasiada información.

### Textos alternativos e imágenes

- **Cumple / no aplica:** la versión auditada no contiene elementos `<img>` ni imágenes informativas externas. Los símbolos decorativos del logotipo y botones están marcados `aria-hidden="true"`. Por ello, no hay textos `alt` ausentes en estos archivos.

### Teclado, foco y controles

- **Cumple en código:** el enlace «Saltar al contenido» aparece al inicio del `body` y se revela con `:focus` ([index.html](./index.html), línea 22; [styles.css](./styles.css), líneas 74–87).
- **Cumple en código:** las acciones se implementan con `<button>`, la navegación con `<a>`, y el diálogo usa el elemento nativo `<dialog>` y `showModal()` ([index.html](./index.html), líneas 35–39 y 149–224; [script.js](./script.js), líneas 521–539). Esto evita controles interactivos basados únicamente en elementos genéricos.
- **Cumple parcialmente:** existe una regla global `:focus-visible` ([styles.css](./styles.css), líneas 1324–1331). El estilo se observó al enfocar un botón en navegador, pero el contraste insuficiente se registra como A-01.
- **Límite de la prueba:** el recorrido completo con Tab/Shift+Tab y la restauración del foco tras cerrar el diálogo no se pudieron confirmar de forma fiable en la automatización; deben repetirse manualmente con teclado.

### Objetivos táctiles y navegación móvil

- **Cumple parcialmente:** las acciones principales siguen disponibles en el encabezado y la navegación móvil no se convierte en un menú dependiente de JavaScript. No se observó solapamiento de controles a 320 o 390 px. Los tamaños medidos y la recomendación ergonómica se documentan en B-01.

### Overflow y dimensiones solicitadas

Se inspeccionó el ancho de página a **320, 390, 768 y 1366 px**:

| Ancho probado | Ancho visible del documento | Resultado |
|---:|---:|---|
| 320 px | 305 px de área útil; 320 px de contenido desplazable | Desbordamiento horizontal de 15 px; hallazgo M-03 |
| 390 px | 375 px de área útil y contenido | Sin desbordamiento de página |
| 768 px | 753 px de área útil y contenido | Sin desbordamiento de página |
| 1366 px | 1351 px de área útil y contenido | Sin desbordamiento de página |

La diferencia entre ancho del viewport y área útil corresponde a una barra de desplazamiento vertical clásica en el navegador de prueba. A 320 px, la página conserva un ancho de 320 px frente a un área útil de 305 px.

### Contraste

- **Cumple en los elementos muestreados:** texto principal, enlaces de navegación, CTA principal y estado «Entregado» superaron 4.5:1 en las combinaciones calculadas.
- **No cumple en foco:** documentado en A-01.
- **No cumple en estados:** documentado en M-01.
- Se recomienda repetir un análisis automatizado y una revisión visual tras cualquier cambio de paleta; esta auditoría calculó los pares de color citados, no todos los píxeles posibles.

### Errores de JavaScript

- Los tres archivos solicitados existen: `index.html`, `styles.css` y `script.js`.
- No hay un ejecutable `node`, `nodejs`, `deno` o `bun` disponible en el entorno, por lo que no se ejecutó `node --check`.
- Como alternativa, se abrió la aplicación desde un servidor local en Chromium. El navegador cargó y ejecutó `script.js`, renderizó cuatro alquileres de muestra y seis tarjetas de inventario; no se observaron excepciones JavaScript (`pageerror`) durante esa carga.
- Los diagnósticos del editor no reportaron errores en los tres archivos.

## 4. Recomendación de corrección para cada hallazgo

| Hallazgo | Recomendación prioritaria |
|---|---|
| A-01 | Cambiar el color del contorno de foco por uno que contraste ≥ 3:1 con cada fondo adyacente; comprobar enlaces, inputs, selects, botones y foco dentro del diálogo. |
| M-01 | Ajustar los colores de texto/fondo de las insignias reservada, atrasada y cotización hasta ≥ 4.5:1; mantener también una etiqueta textual explícita para cada estado. |
| M-02 | Mantener las relaciones de encabezado en móvil o utilizar tarjetas con etiquetas visibles y estructura accesible; sincronizar el orden DOM con el visual y probar con lector de pantalla. |
| M-03 | Retirar/replantear el `min-width: 320px` del `body` o restringirlo al ancho disponible; repetir la prueba a 320 px con barra de desplazamiento clásica y zoom de texto. |
| B-01 | Aumentar, si el diseño lo permite, los controles pequeños y enlaces de navegación hacia áreas táctiles de aproximadamente 44 × 44 px. |
| B-02 | Añadir encabezados adecuados a las tarjetas de indicadores si la navegación por encabezados forma parte del flujo previsto para usuarios de lector de pantalla. |

## 5. Pruebas que deberían repetirse después de corregir

1. Recalcular contraste de texto normal (mínimo 4.5:1) y contraste de componentes/indicadores de foco (mínimo 3:1) sobre todas las superficies y estados —normal, hover, foco, seleccionado y error—.
2. Probar reflow y ausencia de desplazamiento horizontal a 320, 390, 768 y escritorio, también con zoom de navegador y aumento de texto.
3. Inspeccionar la tabla móvil con NVDA y Firefox/Chrome y con VoiceOver y Safari: nombres de columnas/celdas, orden de lectura y navegación por fila.
4. Completar todo el recorrido solo con teclado: enlace para saltar contenido, enlaces internos, filtros, apertura del formulario, recorrido de campos, cierre con Escape, devolución del foco al botón que abrió el diálogo y envío con errores.
5. Revisar el tamaño y separación de los objetivos táctiles en teléfono, incluidos el cierre del diálogo, acciones del encabezado y navegación.
6. Ejecutar un validador automatizado de accesibilidad (por ejemplo, axe) y tratar sus resultados como complemento, no sustituto, de pruebas manuales con lector de pantalla.
7. Repetir la carga de JavaScript y probar búsqueda, filtro, validación de cantidades, almacenamiento local, conexión/offline y diálogo; ejecutar `node --check script.js` cuando Node.js esté disponible.
