import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react'
import { CotizarPanel } from '../../components/CotizarPanel/CotizarPanel'
import { frames } from '../../data'
import { getPalette } from '../../utils/colors'
import { formatPrice } from '../../utils/formatPrice'
import { asset } from '../../utils/asset'
import { useFlechas } from '../../utils/useFlechas'
import './Producto.scss'

export function Producto() {
  const { id } = useParams()
  const location = useLocation()
  // Desde el probador, "Cotizar esta montura" llega con el cotizador ya abierto.
  const [cotizarOpen, setCotizarOpen] = useState(
    () => Boolean((location.state as { abrirCotizador?: boolean } | null)?.abrirCotizador),
  )
  const [photoIndex, setPhotoIndex] = useState(0)
  // Hacia dónde se desliza la foto nueva ("ninguna" = fundido, al cambiar de color).
  const [direccion, setDireccion] = useState<'siguiente' | 'anterior' | 'ninguna'>('ninguna')
  const toqueInicioX = useRef<number | null>(null)

  const frame = frames.find((f) => f.id === id)
  // Los hooks no pueden ir después de un return condicional, así que este se
  // inicializa antes de saber si frame existe.
  const [colorId, setColorId] = useState(frame?.colors[0]?.id)
  const flechasColores = useFlechas<HTMLDivElement>('.producto__color-swatch')

  // Un id que no existe en frames.json no tiene página: de vuelta al catálogo.
  if (!frame) {
    return <Navigate to="/catalogo" replace />
  }

  const selected = frame.colors.find((c) => c.id === colorId) ?? frame.colors[0]
  const palette = getPalette(frame.colors.map((color) => color.id))
  const photos = selected.photos ?? [{ id: 'frontal', label: 'Frontal', image: selected.image, placeholder: true }]
  const totalFotos = photos.length
  const indiceFoto = Math.min(photoIndex, totalFotos - 1)
  const selectedPhoto = photos[indiceFoto]

  // Carrusel: da la vuelta (de la última pasa a la primera y al revés).
  function irAFoto(nuevo: number, haciaDonde: 'siguiente' | 'anterior') {
    setDireccion(haciaDonde)
    setPhotoIndex((nuevo + totalFotos) % totalFotos)
  }
  const fotoAnterior = () => irAFoto(indiceFoto - 1, 'anterior')
  const fotoSiguiente = () => irAFoto(indiceFoto + 1, 'siguiente')

  // Al cambiar de color se vuelve a la primera foto, con fundido.
  function elegirColor(id: string) {
    setColorId(id)
    setPhotoIndex(0)
    setDireccion('ninguna')
  }

  function alPresionarTecla(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') fotoAnterior()
    if (e.key === 'ArrowRight') fotoSiguiente()
  }

  // En celular: deslizar el dedo a un lado o al otro cambia la foto.
  function alTocar(e: PointerEvent) {
    if (e.pointerType !== 'mouse') toqueInicioX.current = e.clientX
  }
  function alSoltar(e: PointerEvent) {
    if (toqueInicioX.current === null) return
    const recorrido = e.clientX - toqueInicioX.current
    toqueInicioX.current = null
    if (Math.abs(recorrido) > 40) {
      if (recorrido < 0) fotoSiguiente()
      else fotoAnterior()
    }
  }

  return (
    <section className="producto">
      {/* Migas de pan: dónde está la persona y cómo volver al catálogo. */}
      <nav className="producto__migas" aria-label="Estás en">
        <ol>
          <li><Link to="/catalogo">Catálogo</Link></li>
          <li aria-current="page">{frame.name}</li>
        </ol>
      </nav>

      <div className="producto__layout">
        <div className="producto__visuals">
          {/* Carrusel: las flechas y los puntos son botones (teclado); deslizar
              con el dedo es un atajo extra en celular. */}
          {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <section
            className="producto__photo"
            // Se puede enfocar con Tab: entonces ← y → cambian de foto (patrón de carrusel de WAI-ARIA).
            // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={totalFotos > 1 ? 0 : undefined}
            aria-roledescription="carrusel"
            aria-label={`Fotos de ${frame.name}`}
            onKeyDown={totalFotos > 1 ? alPresionarTecla : undefined}
            onPointerDown={alTocar}
            onPointerUp={alSoltar}
            onPointerCancel={() => { toqueInicioX.current = null }}
          >
          {selected && (
            <img
              key={`${selected.id}-${selectedPhoto.id}-${indiceFoto}`}
              className={`producto__photo-img producto__photo-img--${direccion}`}
              src={asset(selectedPhoto.image)}
              alt={`${frame.name} — ${selected.label}, vista ${selectedPhoto.label.toLowerCase()}`}
              draggable={false}
            />
          )}
          <span className="producto__photo-placeholder" aria-live="polite">
            {selectedPhoto.label}
            {totalFotos > 1 && ` · ${indiceFoto + 1} de ${totalFotos}`}
            {selectedPhoto.placeholder && <small> · foto provisional</small>}
          </span>
          {totalFotos > 1 && (
            <>
              <button type="button" className="producto__arrow producto__arrow--prev" aria-label="Foto anterior" onClick={fotoAnterior}>
                <ChevronLeft size={24} strokeWidth={2.4} aria-hidden="true" />
              </button>
              <button type="button" className="producto__arrow producto__arrow--next" aria-label="Foto siguiente" onClick={fotoSiguiente}>
                <ChevronRight size={24} strokeWidth={2.4} aria-hidden="true" />
              </button>
              <div className="producto__dots">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    type="button"
                    className={`producto__dot ${index === indiceFoto ? 'producto__dot--active' : ''}`}
                    aria-label={`Ver foto ${index + 1}: ${photo.label}`}
                    aria-current={index === indiceFoto}
                    onClick={() => irAFoto(index, index >= indiceFoto ? 'siguiente' : 'anterior')}
                  />
                ))}
              </div>
            </>
          )}
          <Link
            className="producto__try-btn"
            to="/prueba-virtual"
            state={{ seleccionada: frame.id }}
          >
            <Camera size={21} aria-hidden="true" />
            <span><strong>Probar gafas en vivo</strong><small>Abre el probador con esta montura</small></span>
            <ChevronRight size={20} aria-hidden="true" />
          </Link>
          </section>
        </div>

        <div className="producto__info">
          <h1 className="producto__name">{frame.name}</h1>
          <p className="producto__price">Desde {formatPrice(frame.price)}</p>
          <span className="producto__silhouette">{frame.silhouette}</span>
          <p className="producto__description">{frame.description}</p>

          {palette.length > 1 && <div className="producto__section">
            <h2 className="producto__section-title">Elige un color</h2>
            <div className="producto__colors" ref={flechasColores}>
              {palette.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  aria-label={color.label}
                  aria-pressed={color.id === colorId}
                  className={`producto__color-swatch ${color.id === colorId ? 'producto__color-swatch--selected' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => elegirColor(color.id)}
                />
              ))}
            </div>
          </div>}

          <section className="producto__details" aria-labelledby="producto-detalles">
            <h2 id="producto-detalles" className="producto__section-title">Detalles de la montura</h2>
            <dl>
              <div><dt>Marca</dt><dd>{frame.brand}</dd></div>
              <div><dt>Tipo</dt><dd>{frame.category === 'sol' ? 'Gafas de sol' : 'Montura para fórmula'}</dd></div>
              <div><dt>Color seleccionado</dt><dd>{selected?.label ?? '—'}</dd></div>
              <div><dt>Colores disponibles</dt><dd>{frame.colors.map((color) => color.label).join(', ')}</dd></div>
            </dl>
          </section>

          <p className="producto__price-note">El precio mostrado es de la montura. El valor de los lentes se confirma según tu fórmula y las opciones que elijas.</p>

          <button
            type="button"
            className="producto__buy-btn"
            onClick={() => setCotizarOpen(true)}
          >
            Cotizar
          </button>
        </div>
      </div>

      {cotizarOpen && (
        <CotizarPanel frame={frame} onClose={() => setCotizarOpen(false)} />
      )}
    </section>
  )
}
