import { useRef, useState } from 'react'
import { ArrowLeft, LayoutGrid, Tag } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { frames } from '../../data'
import { formatPrice } from '../../utils/formatPrice'
import { asset } from '../../utils/asset'
import { useFlechas } from '../../utils/useFlechas'
import { useCamara } from './useCamara'
import { useMonturaPlana } from './useMonturaPlana'
import { useModelo3D } from './useModelo3D'
import { useSeguimientoRostro } from './useSeguimientoRostro'
import './PruebaVirtual.scss'

interface PruebaState {
  recomendadas?: string[]
  seleccionada?: string
}

const monturaReferencia = {
  id: 'montura-3d',
  name: 'Modelo 3D con patas',
  image: asset('/gafas/montura-referencia.webp'),
  model: asset('/gafas/montura-3d.glb'),
}

// El probador se arma con cuatro piezas (ver los archivos use*.ts de esta carpeta):
// cámara → montura (foto o modelo 3D) → seguimiento del rostro que la dibuja encima.
export function PruebaVirtual() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state ?? null) as PruebaState | null

  // Con test: solo las monturas recomendadas. Sin test: el catálogo general.
  const catalogo = state?.recomendadas
    ? frames.filter((frame) => state.recomendadas?.includes(frame.id))
    : frames

  const flechasLista = useFlechas<HTMLDivElement>('.camara__item')
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(
    state?.seleccionada ?? null,
  )
  const seleccionada = frames.find((frame) => frame.id === seleccionadaId)
  const esMonturaReferencia = seleccionadaId === monturaReferencia.id
  const nombreMontura = seleccionada?.name ?? (esMonturaReferencia ? monturaReferencia.name : null)
  const imagenMontura = seleccionada?.colors[0]?.image

  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const overlay3dRef = useRef<HTMLCanvasElement>(null)

  const camara = useCamara(videoRef)
  const plana = useMonturaPlana(imagenMontura)
  const modelo3d = useModelo3D(esMonturaReferencia ? monturaReferencia.model : null, overlay3dRef)
  const seguimiento = useSeguimientoRostro({
    activo: camara === 'activa',
    usar3d: esMonturaReferencia,
    videoRef,
    overlayRef,
    overlay3dRef,
    monturaRef: plana.monturaRef,
    escena3dRef: modelo3d.escenaRef,
  })
  const carga = esMonturaReferencia ? modelo3d.estado : plana.estado
  const monturaLista = carga === 'lista'
  const monturaError = carga === 'error'

  // Con una montura del catálogo vuelve a su página; con el modelo 3D, al
  // catálogo; sin ninguna, a la página anterior (o al inicio si entró directo).
  function salir() {
    if (seleccionada) navigate(`/producto/${seleccionada.id}`)
    else if (esMonturaReferencia) navigate('/catalogo')
    else if ((window.history.state?.idx ?? 0) > 0) navigate(-1)
    else navigate('/')
  }

  return (
    <section className="camara">
      <div className="camara__catalogo">
        <button type="button" className="camara__back" onClick={salir}>
          <ArrowLeft size={20} strokeWidth={2.2} aria-hidden="true" />
          Salir del probador
        </button>

        <h1>{state?.recomendadas ? 'Recomendadas para ti' : 'Catálogo'}</h1>
        <p className="camara__catalogo-hint">
          {state?.recomendadas
            ? 'Según el test que hiciste.'
            : 'Elige una montura para probártela.'}
        </p>

        <div className="camara__lista" ref={flechasLista}>
            <button
              type="button"
              aria-pressed={esMonturaReferencia}
              className={`camara__item ${esMonturaReferencia ? 'camara__item--selected' : ''}`}
              onClick={() => setSeleccionadaId(monturaReferencia.id)}
            >
              <span className="camara__item-photo">
                <img src={monturaReferencia.image} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="camara__item-name">{monturaReferencia.name}</span>
              <span className="camara__item-price">Modelo 3D</span>
            </button>
          {catalogo.map((frame) => (
            <button
              key={frame.id}
              type="button"
              aria-pressed={frame.id === seleccionadaId}
              className={`camara__item ${frame.id === seleccionadaId ? 'camara__item--selected' : ''}`}
              onClick={() => setSeleccionadaId(frame.id)}
            >
              <span className="camara__item-photo">
                <img src={asset(frame.colors[0].image)} alt="" loading="lazy" decoding="async" />
              </span>
              <span className="camara__item-name">{frame.name}</span>
              <span className="camara__item-price">
                Desde {formatPrice(frame.price)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="camara__stage">
        <video
          ref={videoRef}
          className={`camara__video ${camara === 'activa' ? 'camara__video--activa' : ''}`}
          autoPlay
          playsInline
          muted
          aria-label={nombreMontura ? `Tu cámara, con la montura ${nombreMontura}` : 'Tu cámara'}
        />
        <canvas ref={overlayRef} className="camara__overlay" aria-hidden="true" />
        <canvas ref={overlay3dRef} className="camara__overlay camara__overlay--three" aria-hidden="true" />

        {/* Para seguir sin devolverse: cotizar lo que se está probando o ver más modelos.
            Van arriba porque abajo los taparía el botón flotante de WhatsApp. */}
        {nombreMontura && (
          <div className="camara__acciones">
            {seleccionada && (
              <button
                type="button"
                className="camara__accion camara__accion--principal"
                // Lleva a la página de la montura con el cotizador ya abierto (ver Producto.tsx).
                onClick={() => navigate(`/producto/${seleccionada.id}`, { state: { abrirCotizador: true } })}
              >
                <Tag size={18} aria-hidden="true" />
                Cotizar esta montura
              </button>
            )}
            <button type="button" className="camara__accion" onClick={() => navigate('/catalogo')}>
              <LayoutGrid size={18} aria-hidden="true" />
              Mirar otras opciones
            </button>
          </div>
        )}

        {camara === 'cargando' && (
          <output className="camara__status">Activando la cámara…</output>
        )}
        {camara === 'error' && (
          <p className="camara__status" role="alert">
            No pudimos activar la cámara. Revisa los permisos del navegador y
            vuelve a intentarlo — mientras tanto puedes ver el catálogo.
          </p>
        )}

        {camara === 'activa' && (
          // aria-live: el lector de pantalla lee cada mensaje nuevo (cargando, centra tu rostro…).
          <p className="camara__note" aria-live="polite">
            {!nombreMontura
              ? 'Elige una montura del catálogo para verla puesta.'
              : monturaError
                ? 'No pudimos cargar la montura. Revisa tu conexión y vuelve a seleccionarla.'
              : !monturaLista
                ? 'Preparando la imagen de la montura…'
                : seguimiento === 'cargando'
                  ? 'Iniciando el seguimiento del rostro…'
                  : seguimiento === 'sin-rostro'
                    ? 'Centra tu rostro frente a la cámara para ajustar las gafas.'
                    : seguimiento === 'error'
                      ? 'No pudimos iniciar el seguimiento. Revisa tu conexión y vuelve a intentarlo.'
                      : `${nombreMontura} está sobrepuesta a tu rostro. Mueve suavemente la cabeza para probar el ajuste.`}
            {seleccionada && seguimiento === 'listo' && <small>Vista de referencia; el ajuste puede variar según la cámara y la posición.</small>}
          </p>
        )}
      </div>
    </section>
  )
}
