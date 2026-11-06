import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { FaceShapeUpload } from '../../components/FaceShapeUpload/FaceShapeUpload'
import { useFlechas } from '../../utils/useFlechas'
import { esFormaRostro, FORMAS_ROSTRO } from './formasRostro'
import { analizarRostro, type FormaRostro, type RespuestasRostro, type ResultadoRostro as Resultado } from './identificarRostro'
import { IdentificarRostroManual } from './IdentificarRostroManual'
import { PREGUNTAS_ROSTRO } from './preguntasRostro'
import { ResultadoRostro } from './ResultadoRostro'
import '../TestGafas/TestGafas.scss'
import './TestRostro.scss'

// El rostro se identifica con una foto o con el test manual. Cada vista tiene
// su propia dirección, como en el test de gafas: /tipo-de-rostro (la foto, que
// ofrece el test manual), ?paso=2 (sus preguntas), ?respuestas=largo-pomulos-suave-suave
// (resultado del test) y ?resultado=ovalado (resultado de la foto). Con
// &desde=gafas se llegó desde la pregunta 1 del test de gafas: al terminar, la
// persona sigue con ese test. Va en la dirección para que resista una recarga.
// Las respuestas van en la dirección: el resultado sigue ahí al recargar o al
// volver desde el test de gafas, sin guardar nada que ese test pueda leer.
function indiceDesdeUrl(valor: string | null): number | null {
  const numero = Number(valor)
  return Number.isInteger(numero) && numero >= 1 && numero <= PREGUNTAS_ROSTRO.length ? numero - 1 : null
}

function respuestasDesdeUrl(valor: string | null): RespuestasRostro | null {
  const partes = valor?.split('-') ?? []
  if (partes.length !== PREGUNTAS_ROSTRO.length) return null
  const validas = PREGUNTAS_ROSTRO.every(({ opciones }, i) => opciones.some(({ id }) => id === partes[i]))
  return validas ? (Object.fromEntries(PREGUNTAS_ROSTRO.map(({ id }, i) => [id, partes[i]])) as unknown as RespuestasRostro) : null
}

// La foto solo da una forma: no hay respuestas de las que sacar rasgos o motivos.
function resultadoDeFoto(forma: FormaRostro): Resultado {
  const { clara, descripcion } = FORMAS_ROSTRO[forma]
  return {
    forma,
    formas: [forma],
    frase: `Tu rostro ${clara}.`,
    explicacion: `Por las proporciones de tu foto, tu rostro se acerca a esta forma. ${descripcion}`,
  }
}

export function TestRostro() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const flechasRespuestas = useFlechas<HTMLDivElement>('.quiz-option')

  const desdeGafas = searchParams.get('desde') === 'gafas'
  const marcaGafas = desdeGafas ? '&desde=gafas' : ''
  const respuestasUrl = respuestasDesdeUrl(searchParams.get('respuestas'))
  const formaFoto = searchParams.get('resultado')
  const resultado = respuestasUrl ? analizarRostro(respuestasUrl) : esFormaRostro(formaFoto) ? resultadoDeFoto(formaFoto) : null
  const indice = resultado ? null : indiceDesdeUrl(searchParams.get('paso'))

  const [respuestas, setRespuestas] = useState<Partial<RespuestasRostro>>(respuestasUrl ?? {})

  // No se puede saltar a una pregunta sin responder las anteriores (por ejemplo
  // al recargar en ?paso=3): se lleva a la primera que falta.
  const primeraSinResponder = PREGUNTAS_ROSTRO.findIndex(({ id }) => !respuestas[id])
  useEffect(() => {
    if (indice !== null && primeraSinResponder !== -1 && indice > primeraSinResponder) {
      navigate({ search: `?paso=${primeraSinResponder + 1}${marcaGafas}` }, { replace: true })
    }
  }, [indice, primeraSinResponder, navigate, marcaGafas])

  const irAPregunta = (nuevo: number) => navigate({ search: `?paso=${nuevo + 1}${marcaGafas}` })
  const irAFoto = () => navigate({ search: desdeGafas ? '?desde=gafas' : '' })
  const irAResultadoDeFoto = (forma: FormaRostro) => navigate({ search: `?resultado=${forma}${marcaGafas}` })

  function siguiente() {
    if (indice === null) return
    if (indice < PREGUNTAS_ROSTRO.length - 1) irAPregunta(indice + 1)
    else navigate({ search: `?respuestas=${PREGUNTAS_ROSTRO.map(({ id }) => respuestas[id]).join('-')}${marcaGafas}` })
  }

  function reiniciar() {
    setRespuestas({})
    irAFoto()
  }

  // Al cambiar de vista, el botón que se tocó desaparece: el foco pasa al
  // título nuevo. Entre preguntas lo hace IdentificarRostroManual.
  const claveVista = resultado ? 'resultado' : indice !== null ? 'preguntas' : 'foto'
  const vistaRef = useRef<HTMLDivElement>(null)
  const vistaAnterior = useRef(claveVista)
  useEffect(() => {
    if (vistaAnterior.current === claveVista) return
    vistaAnterior.current = claveVista
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'smooth' })
    const titulo = vistaRef.current?.querySelector('h1')
    if (!titulo) return
    titulo.tabIndex = -1
    titulo.focus({ preventScroll: true })
  }, [claveVista])

  return (
    <section className="test-gafas">
      <div className="test-gafas__shell" ref={flechasRespuestas}>
        <div ref={vistaRef} key={claveVista} className="test-gafas__view test-gafas__view--adelante">
          {indice !== null && (
            <IdentificarRostroManual
              indice={indice}
              respuestas={respuestas}
              onElegir={(pregunta, opcion) => setRespuestas((actuales) => ({ ...actuales, [pregunta]: opcion }))}
              onSiguiente={siguiente}
              onAnterior={() => (indice > 0 ? irAPregunta(indice - 1) : irAFoto())}
            />
          )}

          {claveVista === 'foto' && (
            <div className="test-gafas__photo-help">
              <button type="button" className="test-gafas__back test-gafas__back--top" onClick={() => navigate(desdeGafas ? '/que-gafas-van-contigo?paso=1' : '/')}>
                <ArrowLeft size={18} aria-hidden="true" /> {desdeGafas ? 'Volver a las formas' : 'Volver al inicio'}
              </button>
              <FaceShapeUpload onSelect={irAResultadoDeFoto} onManual={() => irAPregunta(0)} />
            </div>
          )}

          {resultado && <ResultadoRostro resultado={resultado} desdeGafas={desdeGafas} onReiniciar={reiniciar} />}
        </div>
      </div>
    </section>
  )
}
