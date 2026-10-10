# Mi primera PWA

Proyecto académico para practicar la configuración básica de una Progressive Web App (PWA), el Web App Manifest y el patrón App Shell.

## Archivos
- `index.html`: estructura semántica, vínculo al manifest, iconos, CSS y JavaScript.
- `style.css`: presentación adaptable.
- `app.js`: navegación entre las secciones del contenido.
- `manifest.json`: metadatos de instalación y configuración visual.
- `icons/`: iconos de 192 × 192 y 512 × 512.
- `evidencias/`: espacio para guardar capturas reales de las pruebas.

## Ejecutar con servidor local
Desde esta carpeta ejecuta:
```bash
python -m http.server 8000
```
Después abre `http://localhost:8000` en el navegador.

No abras `index.html` directamente con `file://`; utiliza un servidor local para probar correctamente el manifest.

## Comprobaciones
1. Abre las herramientas de desarrollador (F12).
2. En **Application / Aplicación > Manifest**, verifica que aparezcan el nombre, colores e iconos.
3. En **Console / Consola**, comprueba que no haya errores.
4. En **Network / Red**, recarga y comprueba que `manifest.json`, `style.css`, `app.js` y los iconos respondan correctamente.
5. Prueba cada botón de navegación y cambia el tamaño de la ventana.

## App Shell y contenido dinámico
**App Shell:** encabezado, logotipo, menú de navegación, contenedor principal y pie de página. Es la estructura que se mantiene mientras se navega.

**Contenido dinámico:** el contenido que cambia dentro del área principal al seleccionar Inicio, Contenido o Acerca de.

Nota: esta práctica demuestra el Manifest y el App Shell. No incluye un Service Worker ni funcionamiento sin conexión, porque no son requisitos explícitos de esta actividad.
