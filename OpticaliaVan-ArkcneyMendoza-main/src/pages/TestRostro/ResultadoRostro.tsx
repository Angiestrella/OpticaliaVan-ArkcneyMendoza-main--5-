import { Link } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { asset } from '../../utils/asset'
import { FORMAS_ROSTRO } from './formasRostro'
import type { ResultadoRostro as Resultado } from './identificarRostro'

interface Props {
  resultado: Resultado
  desdeGafas: boolean // se llegó desde la pregunta 1 del test de gafas
  onReiniciar: () => void
}

// Quien venía del test de gafas sigue en la pregunta 2 con su forma ya elegida.
// Con un resultado combinado no hay forma que entregar: vuelve a la pregunta 1.
function textosDeContinuar(hayForma: boolean, desdeGafas: boolean) {
  if (!desdeGafas) return { titulo: '¿Ya sabes cuál es tu tipo de rostro?', texto: 'Descubre qué gafas van mejor contigo.', boton: 'Encontrar mis gafas ideales', destino: '/que-gafas-van-contigo' }
  if (hayForma) return { titulo: '¡Listo! Sigamos con tus gafas', texto: 'Ya tenemos tu tipo de rostro para tu test.', boton: 'Continuar con mi test de gafas', destino: '/que-gafas-van-contigo?paso=2' }
  return { titulo: 'Sigamos con tus gafas', texto: 'Elige la forma que sientas más parecida a ti.', boton: 'Continuar con mi test de gafas', destino: '/que-gafas-van-contigo?paso=1' }
}

// Última vista del test de rostro. La forma se entrega al test de gafas solo si
// la persona decide seguir con este enlace, y solo si hay una forma principal:
// un resultado combinado no nombra ninguna, así que no se elige una por su cuenta.
export function ResultadoRostro({ resultado, desdeGafas, onReiniciar }: Props) {
  const { forma, formas, frase, explicacion } = resultado
  const continuar = textosDeContinuar(forma !== null, desdeGafas)
  return (
    <>
      <div className="rostro-resultado">
        <div className={`rostro-resultado__imgs rostro-resultado__imgs--${formas.length}`}>
          {formas.map((f) => (
            <img key={f} className="rostro-resultado__img" src={asset(FORMAS_ROSTRO[f].imagen)} alt={FORMAS_ROSTRO[f].alt} width={320} height={292} decoding="async" />
          ))}
        </div>
        <div>
          <h1 className="rostro-resultado__title">{forma ? '¡Ya descubrimos tu tipo de rostro!' : 'Esto es lo que encontramos'}</h1>
          <p className="rostro-resultado__forma">{frase}</p>
          <p className="rostro-resultado__text">{explicacion}</p>
          <p className="rostro-resultado__nota">Es una orientación visual, no una medición facial exacta.</p>
          <button type="button" className="test-gafas__again rostro-resultado__again" onClick={onReiniciar}>
            <RotateCcw size={17} aria-hidden="true" /> Volver a hacer el test
          </button>
        </div>
      </div>

      <aside className="test-gafas__face-help" aria-labelledby="rostro-siguiente-titulo">
        <div className="test-gafas__face-help-text">
          <h2 id="rostro-siguiente-titulo" className="test-gafas__face-help-title">{continuar.titulo}</h2>
          <p className="test-gafas__face-help-desc">{continuar.texto}</p>
        </div>
        <Link className="test-gafas__face-help-cta" to={continuar.destino} state={forma ? { rostro: forma } : undefined}>
          {continuar.boton} <span aria-hidden="true">→</span>
        </Link>
      </aside>
    </>
  )
}
