import { opcionesColor } from '../../data'
import { guardar, leer } from '../../utils/almacen'
import { estilos, rostros, tipos } from './opciones'

// Las respuestas del test se guardan en el navegador (localStorage, como JSON)
// para que quien vuelva a la página pueda ver su resultado sin repetir el test.
const CLAVE = 'opticalia-test-respuestas'

export interface RespuestasTest {
  rostro: string
  tipo: string
  estilo: string
  colores: string[]
}

export function guardarRespuestas(respuestas: RespuestasTest) {
  guardar(CLAVE, respuestas)
}

// Lo guardado puede estar incompleto, editado a mano o venir de una versión
// anterior de la página: solo se usa si todas las respuestas siguen existiendo.
export function leerRespuestas(): RespuestasTest | null {
  const r = leer<Partial<RespuestasTest> | null>(CLAVE, null)
  if (!r || typeof r !== 'object') return null
  const colores = Array.isArray(r.colores)
    ? r.colores.filter((id) => opcionesColor.some((c) => c.id === id))
    : []
  const valido =
    rostros.some((o) => o.id === r.rostro) &&
    tipos.some((o) => o.id === r.tipo) &&
    estilos.some((o) => o.id === r.estilo) &&
    colores.length > 0
  return valido ? { rostro: r.rostro!, tipo: r.tipo!, estilo: r.estilo!, colores } : null
}
