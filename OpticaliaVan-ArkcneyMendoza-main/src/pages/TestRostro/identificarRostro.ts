import { FORMAS_ROSTRO } from './formasRostro'

// Lógica del test "¿Qué tipo de rostro tengo?". Es una orientación visual, no
// una medición.
//
// 1. Cada forma tiene un perfil con el mismo máximo (12 puntos: 3 por pregunta).
//    Por cada respuesta suma 3 si es lo típico de esa forma, 2 o 1 si es
//    compatible y 0 si no encaja. Así ninguna forma parte con ventaja.
// 2. Sin una forma que destaque no se fuerza ninguna: se dice que combina varias.
//    Si destaca, se afirma solo si encaja casi por completo, o si le saca buena
//    ventaja a la segunda y su silueta no se contradice. Si no, va como
//    "principalmente".
// 3. El rasgo secundario sale siempre de una respuesta elegida que no es típica
//    de la forma principal; si todas son típicas, no hay rasgo.

export type FormaRostro = 'ovalado' | 'redondo' | 'rectangular' | 'diamante' | 'corazon' | 'triangular'

export interface RespuestasRostro {
  proporcion: 'largo' | 'equilibrado' | 'ancho'
  anchura: 'frente' | 'pomulos' | 'mandibula' | 'uniforme'
  estrechamiento: 'suave' | 'marcado' | 'constante'
  mandibula: 'suave' | 'recta' | 'estrecha'
}

export interface ResultadoRostro {
  forma: FormaRostro | null // null: combina varias formas y ninguna destaca
  formas: FormaRostro[] // las que se muestran: la principal, o las que combina
  frase: string
  explicacion: string
}

type Pregunta = keyof RespuestasRostro
type Puntos = Partial<Record<FormaRostro, number>>
type PorRespuesta<T> = { [P in Pregunta]: Record<RespuestasRostro[P], T> }

const PUNTOS: PorRespuesta<Puntos> = {
  proporcion: {
    largo: { rectangular: 3, ovalado: 3, diamante: 2, corazon: 1 },
    equilibrado: { redondo: 3, corazon: 3, triangular: 3, diamante: 3, ovalado: 2, rectangular: 1 },
    ancho: { redondo: 3, triangular: 2, corazon: 1 },
  },
  anchura: {
    frente: { corazon: 3, ovalado: 1 },
    pomulos: { diamante: 3, ovalado: 3, redondo: 2, corazon: 1 },
    mandibula: { triangular: 3, rectangular: 1 },
    uniforme: { rectangular: 3, redondo: 3, ovalado: 1 },
  },
  estrechamiento: {
    suave: { ovalado: 3, redondo: 2, corazon: 1, diamante: 1 },
    marcado: { corazon: 3, diamante: 3 },
    constante: { rectangular: 3, triangular: 3, redondo: 3 },
  },
  mandibula: {
    suave: { redondo: 3, ovalado: 3, corazon: 1 },
    recta: { rectangular: 3, triangular: 3 },
    estrecha: { corazon: 3, diamante: 3, ovalado: 1 },
  },
}

// Cómo se nombra cada respuesta en la explicación.
const SENALES: PorRespuesta<string> = {
  proporcion: { largo: 'un rostro más largo que ancho', equilibrado: 'un largo y un ancho similares', ancho: 'un rostro más ancho que largo' },
  anchura: { frente: 'la frente como zona más ancha', pomulos: 'los pómulos como zona más ancha', mandibula: 'la mandíbula como zona más ancha', uniforme: 'un ancho parejo en todo el rostro' },
  estrechamiento: { suave: 'un estrechamiento suave hacia el mentón', marcado: 'un estrechamiento marcado hacia el mentón', constante: 'un ancho que se mantiene hasta la mandíbula' },
  mandibula: { suave: 'una mandíbula suave y redondeada', recta: 'una mandíbula recta y marcada', estrecha: 'una mandíbula estrecha y delicada' },
}

// Cómo se nombra cada respuesta cuando es el rasgo secundario.
export const RASGOS: PorRespuesta<string> = {
  proporcion: { largo: 'con una proporción ligeramente alargada', equilibrado: 'con una proporción más equilibrada', ancho: 'con una proporción más ancha' },
  anchura: { frente: 'con una frente más amplia', pomulos: 'con pómulos prominentes', mandibula: 'con una mandíbula más amplia', uniforme: 'con un ancho más parejo' },
  estrechamiento: { suave: 'con un estrechamiento suave hacia el mentón', marcado: 'con un estrechamiento marcado hacia el mentón', constante: 'con un ancho que se mantiene hasta la mandíbula' },
  mandibula: { suave: 'con una mandíbula más suave', recta: 'con una mandíbula más marcada', estrecha: 'con una mandíbula más fina' },
}

const PREGUNTAS: Pregunta[] = ['proporcion', 'anchura', 'estrechamiento', 'mandibula']
// Si varias respuestas se apartan igual, el rasgo es la que más se nota al mirar el rostro.
const PRIORIDAD_RASGO: Pregunta[] = ['mandibula', 'anchura', 'proporcion', 'estrechamiento']
const ORDEN = Object.keys(FORMAS_ROSTRO) as FormaRostro[]

const PUNTAJE_MINIMO = 8 // por debajo, ni la mejor forma se parece lo suficiente
const PUNTAJE_CASI_PERFECTO = 11 // de 12: se afirma aunque otra forma se le parezca
const VENTAJA_CLARA = 3 // sobre la segunda, para afirmarla si su silueta encaja
// Lo que define la silueta. Una mandíbula o una proporción distinta son un matiz;
// que el rostro sea ancho o se estreche donde esa forma no lo hace, la contradice.
const SILUETA: Pregunta[] = ['anchura', 'estrechamiento']
const CERCANIA_COMBINADA = 1 // formas tan cerca de la mejor que también se nombran

function unir(partes: string[]): string {
  if (partes.length < 2) return partes.join('')
  return `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`
}

export function analizarRostro(r: RespuestasRostro): ResultadoRostro {
  const ajuste = (forma: FormaRostro, pregunta: Pregunta) => {
    const porRespuesta = PUNTOS[pregunta] as Record<string, Puntos>
    return porRespuesta[r[pregunta]][forma] ?? 0
  }
  const senal = (pregunta: Pregunta) => (SENALES[pregunta] as Record<string, string>)[r[pregunta]]

  const ranking = ORDEN
    .map((forma) => ({ forma, puntos: PREGUNTAS.reduce((suma, p) => suma + ajuste(forma, p), 0) }))
    .sort((a, b) => b.puntos - a.puntos)
  const [mejor, segunda] = ranking
  const ventaja = mejor.puntos - segunda.puntos

  if (mejor.puntos < PUNTAJE_MINIMO || ventaja === 0) {
    const cercanas = ranking.filter(({ puntos }) => mejor.puntos - puntos <= CERCANIA_COMBINADA)
    const formas = (cercanas.length > 1 ? cercanas : [mejor, segunda]).slice(0, 3).map(({ forma }) => forma)
    return {
      forma: null,
      formas,
      frase: 'Tu rostro combina características de varias formas.',
      explicacion: `Señalaste ${unir(PREGUNTAS.map(senal))}. Esa combinación reúne rasgos de las formas ${unir(formas.map((f) => FORMAS_ROSTRO[f].adjetivo))}, sin encajar claramente en una sola.`,
    }
  }

  const { forma } = mejor
  const coinciden = PREGUNTAS.filter((p) => ajuste(forma, p) === 3)
  const difieren = PREGUNTAS.filter((p) => ajuste(forma, p) < 3)
  const preguntaRasgo = [...PRIORIDAD_RASGO]
    .filter((p) => difieren.includes(p))
    .sort((a, b) => ajuste(forma, a) - ajuste(forma, b))[0]
  const rasgo = preguntaRasgo ? (RASGOS[preguntaRasgo] as Record<string, string>)[r[preguntaRasgo]] : null

  const siluetaCoherente = SILUETA.every((p) => ajuste(forma, p) > 0)
  const clara = mejor.puntos >= PUNTAJE_CASI_PERFECTO || (ventaja >= VENTAJA_CLARA && siluetaCoherente)
  const nombre = clara ? FORMAS_ROSTRO[forma].clara : FORMAS_ROSTRO[forma].principal
  const motivo = `Llegamos a este resultado porque señalaste ${unir(coinciden.map(senal))}.`
  const matiz = difieren.length > 0 ? ` También señalaste ${unir(difieren.map(senal))}, y eso le da un matiz propio.` : ''
  return {
    forma,
    formas: [forma],
    frase: `Tu rostro ${nombre}${rasgo ? `, ${rasgo}` : ''}.`,
    explicacion: motivo + matiz,
  }
}
