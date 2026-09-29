import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import frames from '../../data/frames.json'
import { formatPrice } from '../../utils/formatPrice'
import './PruebaVirtual.scss'

interface PruebaState {
  recomendadas?: string[]
  seleccionada?: string
}

type CamaraEstado = 'cargando' | 'activa' | 'error'

export function PruebaVirtual() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state ?? null) as PruebaState | null

  // Con test: solo las monturas recomendadas. Sin test: el catálogo general.
  const catalogo = state?.recomendadas
    ? frames.filter((frame) => state.recomendadas?.includes(frame.id))
    : frames

  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(
    state?.seleccionada ?? null,
  )
  const [camara, setCamara] = useState<CamaraEstado>('cargando')
  const videoRef = useRef<HTMLVideoElement>(null)

  const seleccionada = frames.find((frame) => frame.id === seleccionadaId)

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelado = false

    async function iniciarCamara() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCamara('error')
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        })
        if (cancelado) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setCamara('activa')
      } catch {
        if (!cancelado) setCamara('error')
      }
    }

    iniciarCamara()

    // Al salir de la página se apaga la cámara.
    return () => {
      cancelado = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return (
    <section className="camara">
      <aside className="camara__catalogo">
        {/* Con una montura elegida vuelve a su página; sin ninguna, un paso atrás. */}
        {seleccionada ? (
          <Link className="camara__back" to={`/producto/${seleccionada.id}`}>
            &lt; Volver a {seleccionada.name}
          </Link>
        ) : (
          <button
            type="button"
            className="camara__back"
            onClick={() => navigate(-1)}
          >
            &lt; Volver
          </button>
        )}

        <h1>{state?.recomendadas ? 'Recomendadas para ti' : 'Catálogo'}</h1>
        <p className="camara__catalogo-hint">
          {state?.recomendadas
            ? 'Según el test que hiciste.'
            : 'Elige una montura para probártela.'}
        </p>

        <div className="camara__lista">
          {catalogo.map((frame) => (
            <button
              key={frame.id}
              type="button"
              aria-pressed={frame.id === seleccionadaId}
              className={`camara__item ${frame.id === seleccionadaId ? 'camara__item--selected' : ''}`}
              onClick={() => setSeleccionadaId(frame.id)}
            >
              <span className="camara__item-photo">
                <img src={frame.colors[0].image} alt="" />
              </span>
              <span className="camara__item-name">{frame.name}</span>
              <span className="camara__item-price">
                Desde {formatPrice(frame.price)}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <div className="camara__stage">
        <video
          ref={videoRef}
          className={`camara__video ${camara === 'activa' ? 'camara__video--activa' : ''}`}
          autoPlay
          playsInline
          muted
        />

        {camara === 'cargando' && (
          <p className="camara__status">Activando la cámara…</p>
        )}
        {camara === 'error' && (
          <p className="camara__status">
            No pudimos activar la cámara. Revisa los permisos del navegador y
            vuelve a intentarlo — mientras tanto puedes ver el catálogo.
          </p>
        )}

        {camara === 'activa' && (
          <p className="camara__note">
            {seleccionada
              ? `${seleccionada.name} seleccionada. `
              : 'Elige una montura del catálogo. '}
            El ajuste de la montura sobre tu rostro (realidad aumentada)
            está pendiente de implementar.
          </p>
        )}
      </div>
    </section>
  )
}
