# Opticalia Van-Arcken & Mendoza — sitio web

Sitio de la óptica Opticalia Van-Arcken & Mendoza (Jumbo Las Vegas, Envigado). Permite ver el catálogo de monturas, hacer un test para descubrir qué gafas van con tu rostro, probarse gafas con la cámara, cotizar lentes y agendar una cita por WhatsApp.

**Publicado en:** https://opticalia-vanarcken-mendoza.web.app (Firebase Hosting, dirección oficial)

También en GitHub Pages: https://angiestrella.github.io/OpticaliaVan-ArkcneyMendoza-main--5-/ (le indica a Google que la oficial es la de Firebase).

## Qué se puede hacer

| Página | Ruta | Qué hace |
|---|---|---|
| Inicio | `/` | Portada con video, acceso al test, tendencias, gafas de sol y consejos para la consulta |
| Catálogo | `/catalogo` | Buscar, filtrar (género, marca, tipo) y ordenar monturas; cotizar desde cada tarjeta |
| Producto | `/producto/:id` | Fotos en carrusel, colores, detalles y cotizador de lentes |
| ¿Qué gafas van contigo? | `/que-gafas-van-contigo` | Test de 4 preguntas (rostro, tipo, categoría, colores) con recomendaciones |
| Prueba virtual | `/prueba-virtual` | Cámara + seguimiento del rostro: muestra las gafas puestas |
| Agenda tu cita | `/agenda` | Formulario por pasos que arma el mensaje de WhatsApp |
| Conócenos | `/conocenos` | Video, redes sociales y ubicación con mapa |
| Página no encontrada | cualquier otra | Aviso con enlaces al inicio y al catálogo |

## Tecnologías y por qué

- **React + TypeScript (Vite):** cada parte de la página es un componente reutilizable (por ejemplo, la tarjeta de gafas se usa en Inicio y en el Catálogo). TypeScript avisa de errores antes de publicar.
- **JSX = HTML:** el HTML se escribe dentro de los componentes con etiquetas semánticas (`header`, `nav`, `main`, `section`, `article`, `footer`, `form`, `label`, `ol`, `dl`…).
- **SCSS = CSS:** variables de marca en `src/styles/_variables.scss`, un archivo de estilos por componente y nombres de clase BEM (`bloque__elemento--modificador`).
- **Bootstrap 5:** se usa su grid (`row`, `col-6 col-md-4 col-xl-3`, `g-4`) en las cuadrículas de gafas y utilidades como `h-100`; el diseño visual es propio.
- **Datos en JSON y XML:** el catálogo, los lentes, los colores y el contacto están en `src/data/*.json` para editarlos sin tocar código; los enlaces de la barra y del pie de página están en `public/navegacion.xml` y se leen con `DOMParser`.
- **three.js** (`three`, instalado con pnpm): dibuja el modelo 3D de las gafas en el probador.
- **MediaPipe** (`@mediapipe/tasks-vision`, instalado con pnpm): encuentra los puntos del rostro en la cámara y en la foto de la ayuda.
- **lucide-react:** los íconos de toda la página.
- **WhatsApp en vez de pagos:** la cotización y la cita se envían al asesor por WhatsApp (no hay servidor ni pasarela de pago).

## Estructura

```
src/
  main.tsx            Monta la app en <div id="root"> (index.html)
  App.tsx             Mapa de rutas (todas dentro de <Layout>, cada página se carga con lazy)
  pages/              Una carpeta por pantalla (Home, Catalogo, Producto, TestGafas, PruebaVirtual, Agenda, Conocenos, NoEncontrada)
    PruebaVirtual/    La página + sus hooks: useCamara, useMonturaPlana, useModelo3D, useSeguimientoRostro
    TestGafas/        La página + sus piezas: OpcionTest, IdentificarRostroManual, ResultadosTest, ResultadoCard
    Agenda/           La página + GrupoOpciones (botones con ícono, se usa dos veces)
  components/         Piezas reutilizables (Layout, Navbar, Footer, FrameCard, CotizarPanel, WhatsAppFloat, FaceShapeUpload)
  data/               JSON del catálogo, lentes, colores y contacto; index.ts los entrega con su tipo (types.ts)
  utils/              Funciones y hooks (recomendar, whatsapp, sitemap, almacen, detectorRostro, seo, useSeo…)
  styles/             Variables, estilos base y animaciones compartidas
  **/*.test.ts        Pruebas automáticas (Vitest), junto al archivo que prueban
public/               Imágenes (WebP), videos comprimidos, modelo 3D, navegacion.xml e imagen para compartir
scripts/              seo-estatico.mjs: después de compilar crea un HTML por página, sitemap.xml, robots.txt y 404.html
```

## Dónde está cada criterio de la rúbrica

**Interactividad y DOM (JavaScript)**
- Eventos: clics, `onChange` del buscador y formularios, teclado (flechas del carrusel, Escape en menú y cotizador), mouse/táctil (tarjetas 3D, deslizar el carrusel), scroll.
- Manipulación directa del DOM: `IntersectionObserver` + `classList` (`utils/useRevealOnScroll.ts`), `style.setProperty` (`FrameCard.tsx`, `Navbar.tsx`, `utils/useParallax.ts`), `fetch` + `DOMParser` (`utils/sitemap.ts`), cámara y `<canvas>` (`pages/PruebaVirtual/`), `document.createElement` (script de Instagram en `Conocenos.tsx`).
- Lógica: filtros del catálogo (`Catalogo.tsx`), recomendación por puntaje (`utils/recomendar.ts`: color ×3, forma de rostro +2, género +1), total del cotizador (`CotizarPanel.tsx`), validación de la agenda (`Agenda.tsx`), mensaje de WhatsApp con `encodeURIComponent` (`utils/whatsapp.ts`).

**Responsive**
- `<meta name="viewport">` en `index.html`, media queries por componente (celular, tablet, escritorio), grid de Bootstrap, menú ☰ en pantallas de menos de 1100 px y tamaños fluidos con `clamp()`.

**Accesibilidad**
- `alt` en todas las imágenes, `aria-label` / `aria-pressed` en botones, el cotizador es un `role="dialog"`, y las animaciones se apagan si el dispositivo tiene activado "reducir movimiento" (más detalle en la sección E3).

**Estructuras de datos: XML y JSON (E2)**
- JSON: `src/data/frames.json`, `lens-options.json`, `colors.json` y `contact.json`. Solo `src/data/index.ts` los importa y les pone su tipo (`types.ts`); el resto de la app usa `import { frames } from '../../data'`.
- XML: `public/navegacion.xml` es la única lista de enlaces. `utils/sitemap.ts` la descarga con `fetch`, la lee con `DOMParser`, revisa que esté bien escrita y la comparten la barra (enlaces con `menu="si"`) y el pie de página (todos).
- JSON en el navegador: el test guarda las respuestas con `JSON.stringify` en `localStorage` y al volver las lee con `JSON.parse` (`utils/almacen.ts`, `pages/TestGafas/respuestasGuardadas.ts`). Si lo guardado está dañado, se ignora.
- `sitemap.xml`: mapa del sitio para buscadores con las direcciones reales de GitHub Pages. Se genera al publicar (`scripts/seo-estatico.mjs`) a partir de `src/data/seo.json` y `frames.json`, así nunca le falta una página o una montura.

**Framework (React) (E2)**
- Componentes con props tipadas, hooks propios (`useEnlacesSitio`, `useSeo`, `useRevealOnScroll`, `useParallax` y los cuatro del probador), estado con `useState`, efectos que se limpian al salir (cámara, animaciones, modelo 3D) y rutas con React Router.

**Instalación y uso de librerías (E2)**
- Todas están en `package.json` y se instalan con `pnpm install`: React, React Router, Bootstrap, lucide-react, three y @mediapipe/tasks-vision.
- three y MediaPipe se cargan con `import()` dinámico: Vite los deja en archivos aparte que solo se descargan al usarlos. MediaPipe descarga además sus archivos `.wasm` y el modelo del rostro (misma versión que la instalada, ver `utils/detectorRostro.ts`).

**Diseño centrado en el usuario (E2)**
- El test avanza solo al tocar una opción, muestra el progreso, permite cambiar cualquier respuesta desde el resultado y recuerda el último resultado.
- Teclado: enlace "Saltar al contenido" (primer Tab), el foco entra al cotizador y al menú de celular al abrirlos y vuelve al botón que los abrió; Escape los cierra.
- Cada página tiene su propio título en la pestaña del navegador (`utils/useSeo.ts`, textos en `src/data/seo.json`).
- Textos grises con contraste suficiente para leerse bien (WCAG AA, 4.5:1).
- Mensajes claros en cada estado del probador (cámara, carga, sin rostro, error) y de la ayuda con foto.

**Rutas (E3)**
- `main.tsx`: `BrowserRouter` con `basename` para que funcione dentro de la carpeta de GitHub Pages.
- `App.tsx`: una ruta padre con `<Layout>` (barra, `<Outlet />` y pie) y dentro todas las páginas: `index`, rutas fijas, una con parámetro (`producto/:id`), una redirección de la dirección vieja (`encuentra-tus-gafas`) y `*` para la página no encontrada.
- Cada página se descarga solo al visitarla (`lazy` + `<Suspense>` con mensaje "Cargando…").
- Navegación: `NavLink` marca la página actual (`aria-current="page"`), `Link` con `state` (probador ↔ producto con el cotizador abierto), `useSearchParams` (`?ayuda=foto`), secciones con `#` (`/conocenos#ubicacion`, ver `utils/useScrollAlCambiarDeRuta.ts`), migas de pan en el producto.
- Protección de rutas: el sitio no tiene inicio de sesión, así que no hay rutas privadas. Sí hay un "guardia": `/producto/:id` con un id que no existe manda al catálogo.
- GitHub Pages: el flujo de publicación copia `index.html` como `404.html` para que cualquier dirección abra la app.

**Accesibilidad (E3)**
- Imágenes: todas tienen texto alternativo (`alt`); las decorativas llevan `alt=""` y los videos decorativos `aria-hidden`. El video de la cámara del probador y el de Conócenos tienen nombre.
- Etiquetas semánticas: `header`, `nav` (cada una con nombre), `main`, `section`, `aside`, `article`, `footer`, `form`, `fieldset`, `label`, `ol`, `dl`, `output`. Los títulos van en orden (h1 → h2 → h3).
- Flechas: en los grupos de opciones (respuestas del test, opciones de la agenda y del cotizador, colores, filtros del catálogo, monturas del probador, enlaces del menú) ← → ↑ ↓ mueven el foco según dónde está cada opción en pantalla, e Inicio/Fin van a la primera y a la última (`utils/useFlechas.ts`). En el carrusel del producto, ← y → cambian de foto. Fuera de esos grupos, las flechas desplazan la página como siempre.
- Teclado: "Saltar al contenido"; al cambiar de página el foco pasa al contenido nuevo (`Layout.tsx`); en el test pasa al título de cada pregunta; el cotizador y el menú guardan y devuelven el foco, y Escape los cierra.
- ARIA: `aria-pressed`, `aria-expanded`/`aria-controls`, `aria-current`, `role="dialog"` + `aria-modal`, `aria-live`/`role="alert"` para los mensajes que cambian (probador, errores, resultado de la foto).
- Movimiento: el video de portada arranca quieto con "reducir movimiento" y tiene un botón "Pausar video" que no se ve con el mouse: aparece al llegar con Tab (como "Saltar al contenido").
- Contraste: `$color-blue-texto` (4.9:1) para texto pequeño y botones con letra blanca. Revisado con axe-core (WCAG 2.1 AA) en todas las páginas.
- El revisor de código incluye las reglas de accesibilidad `jsx-a11y` (`.oxlintrc.json`).

**Organización y calidad del código (E3)**
- Una carpeta por página y por componente, con su SCSS; las piezas que solo usa una página viven en su carpeta (ej. `pages/Agenda/GrupoOpciones.tsx`).
- TypeScript estricto, `oxlint` con reglas de React (hooks y dependencias) y de accesibilidad, y pruebas con Vitest (`pnpm test`). GitHub Actions corre el revisor y las pruebas antes de publicar: si algo falla, no se publica.
- Nombres: el código nuevo está en español (`useSeo`, `alternar`, `GrupoOpciones`); los componentes más antiguos conservan su nombre en inglés (`FrameCard`, `FaceShapeUpload`) para no romper importaciones.

**SEO (posicionamiento en buscadores)**
- Textos en un solo lugar: `src/data/seo.json` tiene el título y la descripción de cada página y los datos de la óptica. `src/utils/seo.ts` arma con eso todas las etiquetas; lo usan la página y el script de publicación, así siempre coinciden. Las monturas toman su título, descripción, precio y foto de `frames.json`.
- Cada página tiene: `<title>` y `<meta name="description">` propios, dirección oficial (`<link rel="canonical">`), `robots` (la página no encontrada lleva `noindex`), vista previa para compartir en WhatsApp, Facebook y X (Open Graph y Twitter Cards, con la imagen `public/og-opticalia.jpg` de 1200 × 630) y datos estructurados de schema.org en JSON-LD: la óptica (`Optician`: dirección, teléfono, mapa, redes) y el sitio (`WebSite`) en todas, y en cada montura `Product` (marca, fotos, precio en COP) con su `BreadcrumbList`.
- Un HTML por página: GitHub Pages solo sirve archivos, así que antes `/catalogo` respondía "404" (Google no guarda páginas con ese error). `scripts/seo-estatico.mjs` crea `catalogo/index.html`, `producto/diseno-1/index.html`, etc., cada uno con sus etiquetas ya puestas: responde "200" y los buscadores y redes ven la información correcta aunque no ejecuten JavaScript (también lleva un `<noscript>` con el título, la descripción y enlaces). Al navegar dentro de la app, `utils/useSeo.ts` actualiza las mismas etiquetas.
- `robots.txt` (permite todo e indica el sitemap) y `sitemap.xml` con fecha de actualización. Nota: los buscadores leen `robots.txt` solo en la raíz del dominio (`angiestrella.github.io`), por eso el sitemap conviene enviarlo también en Google Search Console.
- Velocidad (Google la tiene en cuenta): fotos del catálogo en WebP (de ~1 MB a ~30 KB cada una), fotos de rostros del test en WebP (de ~1.5 MB a ~18 KB), video de portada comprimido (de 23.7 MB a 4.4 MB) con imagen de portada mientras carga y que empieza a bajar cuando el resto ya cargó, video del pie comprimido (de 2.4 MB a 0.5 MB) que solo carga al llegar al pie, imágenes fuera de pantalla con `loading="lazy"`, fuentes que no bloquean la carga y páginas que se descargan por separado.
- Base: `lang="es"`, un `<h1>` por vista, textos alternativos en las imágenes, enlaces con texto descriptivo y diseño adaptable a celular.
- Resultado con Lighthouse (modo celular): SEO 100/100 en las 7 páginas.

## Cómo correrlo

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # versión para publicar (carpeta dist/, con un HTML por página, sitemap y robots)
pnpm lint       # revisor de código (oxlint)
pnpm test       # pruebas automáticas (Vitest)
pnpm deploy:firebase   # compila y publica en Firebase Hosting (antes: firebase login)
```

Firebase: `firebase.json` (carpeta `dist/`, redirección de la dirección vieja del test, caché de un año para los archivos con huella) y `.firebaserc` (proyecto `opticalia-vanarcken-mend-bc637`, sitio `opticalia-vanarcken-mendoza`). La dirección oficial para Google está en `src/data/seo.json`.

Cada vez que se sube un cambio a `main`, GitHub Actions revisa el código, corre las pruebas, compila, genera los archivos de SEO y publica el sitio en GitHub Pages (`.github/workflows/deploy.yml`).
