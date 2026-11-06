import type { RespuestasRostro } from './identificarRostro'

interface Opcion {
  id: string
  label: string
  imagen: string
  alt: string
}

// "retrato": la imagen no trae texto, por eso el texto va debajo.
// "ilustracion": la imagen ya trae su título y su descripción, y no se repiten.
export const PREGUNTAS_ROSTRO: { id: keyof RespuestasRostro; titulo: string; ayuda: string; tipo: 'retrato' | 'ilustracion'; opciones: Opcion[] }[] = [
  {
    id: 'proporcion',
    titulo: '¿Qué proporción tiene tu rostro?',
    ayuda: 'Observa tu rostro de frente. ¿Cuál de estas formas se parece más a la tuya?',
    tipo: 'retrato',
    opciones: [
      { id: 'largo', label: 'Más largo que ancho', imagen: '/rostros/proporcion/largo.webp', alt: 'Mujer de rostro alargado, más largo que ancho' },
      { id: 'equilibrado', label: 'Tiene un largo y ancho similares', imagen: '/rostros/proporcion/equilibrado.webp', alt: 'Mujer de rostro equilibrado, con un largo y un ancho similares' },
      { id: 'ancho', label: 'Más ancho que largo', imagen: '/rostros/proporcion/ancho.webp', alt: 'Mujer de rostro ancho, más ancho que largo' },
    ],
  },
  {
    id: 'anchura',
    titulo: '¿En qué parte de tu rostro notas mayor anchura?',
    ayuda: 'Piensa en la zona que sobresale más hacia los lados al mirar tu rostro de frente.',
    tipo: 'ilustracion',
    opciones: [
      { id: 'frente', label: 'La frente', imagen: '/rostros/zona/frente.webp', alt: 'La frente: la parte superior de tu rostro es la más ancha' },
      { id: 'pomulos', label: 'Los pómulos', imagen: '/rostros/zona/pomulos.webp', alt: 'Los pómulos: la zona de los pómulos es la más ancha' },
      { id: 'mandibula', label: 'La mandíbula', imagen: '/rostros/zona/mandibula.webp', alt: 'La mandíbula: la parte inferior de tu rostro es la más ancha' },
      { id: 'uniforme', label: 'Todas por igual', imagen: '/rostros/zona/uniforme.webp', alt: 'Todas por igual: tu rostro tiene una anchura bastante uniforme en la frente, los pómulos y la mandíbula' },
    ],
  },
  {
    id: 'estrechamiento',
    titulo: '¿Cómo cambia la forma de tu rostro hacia el mentón?',
    ayuda: 'Observa los lados de tu rostro desde la frente hasta la barbilla.',
    tipo: 'ilustracion',
    opciones: [
      { id: 'suave', label: 'Se estrecha suavemente', imagen: '/rostros/estrechamiento/suave.webp', alt: 'Se estrecha suavemente: el rostro se va haciendo un poco más delgado hacia el mentón' },
      { id: 'marcado', label: 'Se estrecha bastante', imagen: '/rostros/estrechamiento/marcado.webp', alt: 'Se estrecha bastante: el rostro se hace notablemente más delgado hacia el mentón' },
      { id: 'constante', label: 'Mantiene un ancho parecido', imagen: '/rostros/estrechamiento/constante.webp', alt: 'Mantiene un ancho parecido: el ancho del rostro se mantiene similar desde los pómulos hasta la mandíbula' },
    ],
  },
  {
    id: 'mandibula',
    titulo: '¿Cómo describirías la forma de tu mandíbula?',
    ayuda: 'Mira el contorno de tu mandíbula y la forma en que termina tu mentón. Elige la opción más parecida a ti.',
    tipo: 'ilustracion',
    opciones: [
      { id: 'suave', label: 'Suave y redondeada', imagen: '/rostros/contorno/suave.webp', alt: 'Suave y redondeada: la mandíbula tiene una forma curva, sin ángulos marcados' },
      { id: 'recta', label: 'Recta y marcada', imagen: '/rostros/contorno/recta.webp', alt: 'Recta y marcada: la mandíbula se ve más definida, con ángulos visibles' },
      { id: 'estrecha', label: 'Estrecha y delicada', imagen: '/rostros/contorno/estrecha.webp', alt: 'Estrecha y delicada: la mandíbula es más fina y se reduce hacia el mentón' },
    ],
  },
]
