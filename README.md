# Obra Clara

Panel web progresivo (PWA) de demostración para administrar alquileres e inventario de equipos de construcción. Está desarrollado con HTML, CSS y JavaScript vanilla; no requiere frameworks ni paquetes.

## Ejecutar en desarrollo

Una PWA debe abrirse desde un contexto seguro: HTTPS o `localhost`. Abrir `index.html` directamente como archivo (`file://`) no permite instalar el *service worker*.

En Visual Studio Code:

1. Abre la carpeta del proyecto.
2. Inicia un servidor local, por ejemplo con la extensión Live Server.
3. Abre la dirección local que proporciona el servidor, normalmente `http://127.0.0.1:5500/`.
4. Espera a que el indicador del pie de página confirme la conexión. Después de la primera carga, los archivos de la aplicación quedan disponibles en caché para abrirla sin conexión.
5. Selecciona **Instalar app** para instalarla cuando el navegador lo permita. Si no aparece el diálogo de instalación, usa la opción “Instalar aplicación” o “Añadir a pantalla de inicio” del menú del navegador.

## Publicar en GitHub Pages

El workflow [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml) despliega el sitio con GitHub Actions en cada `push` a `main`; también se puede iniciar manualmente desde la pestaña **Actions**.

En el repositorio, configura **Settings → Pages → Build and deployment → Source → GitHub Actions**. Cuando termine correctamente la primera ejecución, el sitio estará disponible en:

`https://daniloerazo07.github.io/PaginaWebProgresiva/`

La publicación debe servirse mediante HTTPS y conservar `manifest.webmanifest`, `service-worker.js` y la carpeta `icons` junto a los archivos de la aplicación.

## Datos de este prototipo

Los alquileres de muestra y los registros nuevos se guardan en `localStorage` del navegador actual. No existe un servidor ni una base de datos compartida: los datos no se sincronizan entre trabajadores, dispositivos o navegadores. Los totales de inventario son valores de ejemplo definidos en `script.js`.
