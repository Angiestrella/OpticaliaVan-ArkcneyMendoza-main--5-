// Punto único de acceso a los datos del sitio (archivos JSON de esta carpeta).
// Al asignar cada JSON a su tipo (types.ts), TypeScript revisa su estructura:
// si a un dato le falta un campo o tiene el tipo equivocado, el proyecto no compila.
import framesJson from './frames.json'
import lentesJson from './lens-options.json'
import coloresJson from './colors.json'
import contactoJson from './contact.json'
import seoJson from './seo.json'
import type { ColorOption, Contacto, Frame, OpcionesLente } from './types'
import type { SeoConfig } from '../utils/seo'

// Las monturas con "oculta": true no aparecen en ninguna parte del sitio.
const todasLasMonturas: Frame[] = framesJson
export const frames: Frame[] = todasLasMonturas.filter((frame) => !frame.oculta)
export const opcionesLente: OpcionesLente = lentesJson
export const opcionesColor: ColorOption[] = coloresJson
export const contacto: Contacto = contactoJson
// Títulos y descripciones para buscadores (los usan utils/useSeo.ts y scripts/seo-estatico.mjs).
export const seo: SeoConfig = seoJson
