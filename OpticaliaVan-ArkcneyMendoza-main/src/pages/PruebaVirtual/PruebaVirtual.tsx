import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Glasses, LayoutGrid, RotateCcw, Sun, Tag } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { frames } from '../../data'
import { formatPrice } from '../../utils/formatPrice'
import { asset } from '../../utils/asset'
import { useFlechas } from '../../utils/useFlechas'
import { useVolver } from '../../utils/useVolver'
import { modelosPorMontura, monturaReferencia, tienePruebaVirtual } from './modelos3d'
import { useCamara, type CamaraFallo } from './useCamara'
import { useModelo3D } from './useModelo3D'
import { useSeguimientoRostro } from './useSeguimientoRostro'
import './PruebaVirtual.scss'

// Qué decir cuando la cámara no enciende, según el motivo (ver useCamara.ts).
const MENSAJES_CAMARA: Record<CamaraFallo, { titulo: string; ayuda: string }> = {
  ocupada: {
    titulo: 'La cámara está ocupada',
    ayuda: 'Otra aplicación o pestaña la está usando (por ejemplo Teams, Zoom, Meet u otra pestaña con el probador). Ciérrala y toca "Reintentar".',
  },
  bloqueada: {
    titulo: 'No tenemos permiso para usar la cámara',
    ayuda: 'Toca el candado junto a la dirección de la página y permite la cámara. En Windows revisa también Configuración › Privacidad y seguridad › Cámara. Luego toca "Reintentar".',
  },
  'sin-camara': {
    titulo: 'No encontramos una cámara',
    ayuda: 'Este dispositivo no tiene cámara o está desconectada. Prueba desde tu celular.',
  },
  'no-soportada': {
    titulo: 'Este navegador no permite usar la cámara',
    ayuda: 'Abre la página en Chrome, Safari, Edge o Firefox actualizados.',
  },
}

interface PruebaState {
  recomendadas?: string[]
  seleccionada?: string
  color?: string // color elegido en la ficha o en el test (para monturas con un modelo por color)
}

// El probador se arma con tres piezas (ver los archivos use*.ts de esta carpeta):
// cámara → modelo 3D de la montura → seguimiento del rostro que lo pone encima.
// Solo se pueden probar las monturas con modelo 3D (ver modelos3d.ts); las demás
// salen en "Explora todas nuestras monturas" con su foto y precio, sin "Probar".
export function PruebaVirtual() {
  const location = useLocation()
  const navigate = useNavigate()
  const volver = useVolver()
  const state = (location.state ?? null) as PruebaState | null

  // Solo las que tienen modelo 3D. Con test, las recomendadas que lo tengan;
  // si ninguna lo tiene todavía, todas las que se pueden probar.
  const conPrueba = frames.filter((frame) => tienePruebaVirtual(frame.id))
  const recomendadasConPrueba = conPrueba.filter((frame) => state?.recomendadas?.includes(frame.id))
  const soloRecomendadas = recomendadasConPrueba.length > 0

  // Cada modelo 3D es una opción de la lista: una montura con un modelo por
  // color (ej. la Trendi Metro) sale una vez por cada color.
  const opcionesDe = (lista: typeof frames) => lista.flatMap((frame) => {
    const modelos = modelosPorMontura[frame.id]
    return modelos.map((modelo) => ({
      clave: `${frame.id}|${modelo.color ?? ''}`,
      frame,
      modelo,
      color: frame.colors.find((c) => c.id === modelo.color) ?? frame.colors[0],
      variosColores: modelos.length > 1,
    }))
  })
  const todas = opcionesDe(conPrueba)
  const opcionesRecomendadas = opcionesDe(recomendadasConPrueba)
  // "Explora": lo que no está ya en las recomendadas, primero lo que se puede probar.
  const opcionesPorExplorar = todas.filter((o) => !recomendadasConPrueba.includes(o.frame))
  const sinPrueba = frames.filter((frame) => !tienePruebaVirtual(frame.id))

  // Quien viene del test ve primero sus recomendadas; el resto se abre con
  // "Mirar otras opciones". Sin recomendaciones, el catálogo se ve de una vez.
  const [verOtras, setVerOtras] = useState(false)
  const mostrarExplorar = !soloRecomendadas || verOtras
  const explorarRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!verOtras) return
    explorarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    explorarRef.current?.querySelector('h2')?.focus({ preventScroll: true })
  }, [verOtras])

  const flechasRecomendadas = useFlechas<HTMLDivElement>('.camara__item')
  const flechasExplorar = useFlechas<HTMLDivElement>('.camara__item')
  // Llega elegida desde la ficha o el test, en su color si tiene modelo propio.
  // Si es una montura sin modelo 3D (un enlace viejo), no se elige ninguna.
  const [claveElegida, setClaveElegida] = useState<string | null>(() => {
    const deLaMontura = todas.filter((o) => o.frame.id === state?.seleccionada)
    return (deLaMontura.find((o) => o.modelo.color === state?.color) ?? deLaMontura[0])?.clave ?? null
  })
  // Si llega con una recomendada elegida, la fila se desplaza hasta ella (en
  // celular se mueve de lado; si no, quedaría fuera de la vista).
  useEffect(() => {
    document.querySelector('.camara__catalogo .camara__item--selected')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' })
  }, [])
  const elegida = todas.find((o) => o.clave === claveElegida)
  const seleccionada = elegida?.frame
  const esMonturaReferencia = claveElegida === monturaReferencia.id
  // Gafas 2 en 1: se prueban como oftálmicas o con el clip de sol puesto. La
  // elección se mantiene al pasar a otra 2 en 1; en las demás no aplica.
  const [conClip, setConClip] = useState(false)
  const modeloSol = elegida?.modelo.sol
  const usaClip = conClip && !!modeloSol
  const modelo3dElegido = esMonturaReferencia ? monturaReferencia.modelo : (usaClip ? modeloSol : elegida?.modelo) ?? null
  const nombreDe = (o: (typeof todas)[number]) => o.variosColores ? `${o.frame.name} · ${o.color.label}` : o.frame.name
  const nombreMontura = elegida ? `${nombreDe(elegida)}${usaClip ? ' con clip de sol' : ''}` : esMonturaReferencia ? monturaReferencia.name : null

  const videoRef = useRef<HTMLVideoElement>(null)
  const overlay3dRef = useRef<HTMLCanvasElement>(null)

  const { estado: camara, fallo: falloCamara, reintentar: reintentarCamara } = useCamara(videoRef)
  const modelo3d = useModelo3D(modelo3dElegido, overlay3dRef)
  const seguimiento = useSeguimientoRostro({
    activo: camara === 'activa',
    videoRef,
    escena3dRef: modelo3d.escenaRef,
  })
  const monturaLista = modelo3d.estado === 'lista'
  const monturaError = modelo3d.estado === 'error'

  // Vuelve a donde estaba la persona (la montura, los resultados del test, el
  // menú…), aunque dentro del probador haya elegido otra montura. Solo si entró
  // directo con un enlace: a la montura elegida, o al inicio si no hay ninguna.
  function salir() {
    volver(seleccionada ? `/producto/${seleccionada.id}` : '/')
  }

  const tarjetaProbar = (opcion: (typeof todas)[number]) => (
    <button
      key={opcion.clave}
      type="button"
      aria-pressed={opcion.clave === claveElegida}
      className={`camara__item ${opcion.clave === claveElegida ? 'camara__item--selected' : ''}`}
      onClick={() => setClaveElegida(opcion.clave)}
    >
      {/* La foto sale en el color del modelo 3D. */}
      <span className="camara__item-photo">
        <img src={asset(opcion.color.image)} alt="" loading="lazy" decoding="async" />
        <span className="camara__item-probar" aria-hidden="true">{opcion.clave === claveElegida ? 'Puesta ✓' : 'Probar'}</span>
      </span>
      <span className="camara__item-name">{nombreDe(opcion)}</span>
      <span className="camara__item-price">
        Desde {formatPrice(opcion.frame.price)}
      </span>
    </button>
  )

  return (
    // En computador la cámara y sus controles quedan fijos a la izquierda mientras
    // las monturas se desplazan a la derecha. En celular va todo en una columna
    // y la cámara queda fija arriba. Siempre es el mismo <video>: al explorar no
    // se apaga ni se pierde la montura puesta.
    <section className="camara">
      <header className="camara__cabecera">
        <button type="button" className="camara__back" onClick={salir}>
          <ArrowLeft size={20} strokeWidth={2.2} aria-hidden="true" />
          <span>Salir<span className="camara__back-largo"> del probador</span></span>
        </button>
        <h1>{soloRecomendadas ? 'Recomendadas para ti' : 'Prueba virtual en 3D'}</h1>
        <p className={`camara__catalogo-hint ${soloRecomendadas || state?.recomendadas ? '' : 'camara__catalogo-hint--general'}`}>
          {soloRecomendadas
            ? 'Las del test que ya puedes probarte en 3D.'
            : state?.recomendadas
              ? 'Tus recomendadas aún no tienen prueba virtual. Estas sí.'
              : 'Mira en tu cámara cómo te quedan. Pronto agregaremos más monturas.'}
        </p>
      </header>

      <div className="camara__principal">
      <div className="camara__stage">
        <video
          ref={videoRef}
          className={`camara__video ${camara === 'activa' ? 'camara__video--activa' : ''}`}
          autoPlay
          playsInline
          muted
          aria-label={nombreMontura ? `Tu cámara, con la montura ${nombreMontura}` : 'Tu cámara'}
        />
        <canvas ref={overlay3dRef} className="camara__overlay camara__overlay--three" aria-hidden="true" />

        {camara === 'cargando' && (
          <output className="camara__status">Activando la cámara…</output>
        )}
        {camara === 'error' && (
          // Dice qué pasó y qué hacer, según el motivo; con botón para reintentar.
          <div className="camara__status camara__status--error" role="alert">
            <strong>{falloCamara ? MENSAJES_CAMARA[falloCamara].titulo : 'No pudimos activar la cámara'}</strong>
            <p>{falloCamara ? MENSAJES_CAMARA[falloCamara].ayuda : 'Vuelve a intentarlo.'}</p>
            {falloCamara !== 'no-soportada' && falloCamara !== 'sin-camara' && (
              <button type="button" className="camara__reintentar" onClick={reintentarCamara}>
                <RotateCcw size={17} aria-hidden="true" /> Reintentar
              </button>
            )}
          </div>
        )}

        {camara === 'activa' && (
          // aria-live: el lector de pantalla lee cada mensaje nuevo (cargando, centra tu rostro…).
          <p className="camara__note" aria-live="polite">
            {!nombreMontura
              ? 'Elige una montura de la lista para verla puesta en tu cara.'
              : monturaError
                ? 'No pudimos cargar la montura. Revisa tu conexión y vuelve a seleccionarla.'
              : !monturaLista
                ? 'Preparando la montura en 3D…'
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

      {/* Fuera de la imagen, para que se vean y no tapen la cámara. */}
      {nombreMontura && (
        <div className="camara__panel">
            <div className="camara__elegida">
              <img src={elegida ? asset(elegida.color.image) : monturaReferencia.image} alt="" decoding="async" />
              <p>
                <span>Estás probando</span>
                <strong>{nombreMontura}</strong>
                <span>{seleccionada ? `Desde ${formatPrice(seleccionada.price)}` : 'Modelo de muestra'}</span>
              </p>
            </div>
            {modeloSol && (
              // Solo en las 2 en 1 (Easy Click): quitar o poner el clip de sol.
              <fieldset className="camara__modo-grupo" aria-label="Cómo quieres probarla">
                <button type="button" aria-pressed={!usaClip} onClick={() => setConClip(false)}>
                  <Glasses size={18} aria-hidden="true" /> Oftálmica
                </button>
                <button type="button" aria-pressed={usaClip} onClick={() => setConClip(true)}>
                  <Sun size={18} aria-hidden="true" /> Con clip de sol
                </button>
              </fieldset>
            )}
            {seleccionada && (
              <button
                type="button"
                className="camara__accion camara__accion--principal"
                // Lleva a la página de la montura con el cotizador ya abierto (ver Producto.tsx).
                onClick={() => navigate(`/producto/${seleccionada.id}`, { state: { abrirCotizador: true, color: elegida?.color.id } })}
              >
                <Tag size={18} aria-hidden="true" />
                Cotizar esta montura
              </button>
            )}
        </div>
      )}
      </div>

      {soloRecomendadas && (
        <div className="camara__catalogo">
          <h2 className="camara__lista-titulo">Toca una montura para verla puesta en tu cara</h2>
          <div className="camara__lista" ref={flechasRecomendadas}>
            {opcionesRecomendadas.map(tarjetaProbar)}
          </div>
          {!verOtras && (
            <button type="button" className="camara__accion camara__mirar-otras" onClick={() => setVerOtras(true)}>
              <LayoutGrid size={18} aria-hidden="true" />
              Mirar otras opciones
            </button>
          )}
        </div>
      )}

      {mostrarExplorar && (
      <section className="camara__explorar" ref={explorarRef} aria-labelledby="camara-explorar-titulo">
        <p className="camara__explorar-etiqueta">Explora todas nuestras monturas</p>
        <h2 id="camara-explorar-titulo" tabIndex={-1}>Hay más gafas esperando por ti</h2>
        <p className="camara__explorar-texto">Toca "Probar" y mírala en tu cámara sin salir de aquí.</p>
        <div className="camara__lista camara__lista--todas" ref={flechasExplorar}>
          <button
            type="button"
            aria-pressed={esMonturaReferencia}
            className={`camara__item ${esMonturaReferencia ? 'camara__item--selected' : ''}`}
            onClick={() => setClaveElegida(monturaReferencia.id)}
          >
            <span className="camara__item-photo">
              <img src={monturaReferencia.image} alt="" loading="lazy" decoding="async" />
              <span className="camara__item-probar" aria-hidden="true">{esMonturaReferencia ? 'Puesta ✓' : 'Probar'}</span>
            </span>
            <span className="camara__item-name">{monturaReferencia.name}</span>
            <span className="camara__item-price">Modelo de muestra</span>
          </button>
          {opcionesPorExplorar.map(tarjetaProbar)}
          {sinPrueba.map((frame) => (
            <article key={frame.id} className="camara__ficha">
              <span className="camara__item-photo">
                <img src={asset(frame.colors[0].image)} alt="" loading="lazy" decoding="async" />
              </span>
              <h3 className="camara__item-name">{frame.name}</h3>
              <span className="camara__item-price">Desde {formatPrice(frame.price)}</span>
              <span className="camara__ficha-nota">Aún sin prueba 3D</span>
              {/* En otra pestaña: así el probador sigue abierto con su montura y su cámara. */}
              <Link className="camara__ficha-link" to={`/producto/${frame.id}`} target="_blank" rel="noopener" aria-label={`Ver detalles de ${frame.name} (se abre en otra pestaña)`}>
                Ver detalles <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>
      )}
    </section>
  )
}
