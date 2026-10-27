import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Camera, ChevronRight } from 'lucide-react'
import { CotizarPanel } from '../../components/CotizarPanel/CotizarPanel'
import frames from '../../data/frames.json'
import { getPalette } from '../../utils/colors'
import { formatPrice } from '../../utils/formatPrice'
import { asset } from '../../utils/asset'
import './Producto.scss'

export function Producto() {
  const { id } = useParams()
  const [cotizarOpen, setCotizarOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)

  const frame = frames.find((f) => f.id === id)
  // Los hooks no pueden ir después de un return condicional, así que este se
  // inicializa antes de saber si frame existe.
  const [colorId, setColorId] = useState(frame?.colors[0]?.id)

  // Un id que no existe en frames.json no tiene página: de vuelta al catálogo.
  if (!frame) {
    return <Navigate to="/catalogo" replace />
  }

  const selected = frame.colors.find((c) => c.id === colorId) ?? frame.colors[0]
  const palette = getPalette(frame.colors.map((color) => color.id))
  const photos = selected.photos ?? [{ id: 'frontal', label: 'Frontal', image: selected.image, placeholder: true }]
  const selectedPhoto = photos[photoIndex] ?? photos[0]
  return (
    <section className="producto">
      <div className="producto__layout">
        <div className="producto__visuals">
          <div className="producto__photo">
          {selected && (
            <img src={asset(selectedPhoto.image)} alt={`${frame.name} — ${selected.label}, vista ${selectedPhoto.label.toLowerCase()}`} />
          )}
          {selectedPhoto.placeholder && <span className="producto__photo-placeholder">Foto provisional · {selectedPhoto.label}</span>}
          <Link
            className="producto__try-btn"
            to="/prueba-virtual"
            state={{ seleccionada: frame.id }}
          >
            <Camera size={21} aria-hidden="true" />
            <span><strong>Probar gafas en vivo</strong><small>Abre el probador con esta montura</small></span>
            <ChevronRight size={20} aria-hidden="true" />
          </Link>
          </div>

          {photos.length > 1 && <div className="producto__gallery" aria-label="Vistas disponibles de la montura">
            <p className="producto__gallery-title">Vistas de la montura · {selected.label}</p>
            <div className="producto__gallery-list">
              {photos.map((photo, index) => <button key={photo.id} type="button" className={`producto__gallery-item ${index === photoIndex ? 'producto__gallery-item--selected' : ''}`} aria-pressed={index === photoIndex} onClick={() => setPhotoIndex(index)}>
                <img src={asset(photo.image)} alt={`${frame.name} — vista ${photo.label.toLowerCase()}${photo.placeholder ? ', foto provisional' : ''}`} />
                <span>{photo.label}</span>
                {photo.placeholder && <small>Provisional</small>}
              </button>)}
            </div>
          </div>}
        </div>

        <div className="producto__info">
          <h1 className="producto__name">{frame.name}</h1>
          <p className="producto__price">Desde {formatPrice(frame.price)}</p>
          <span className="producto__silhouette">{frame.silhouette}</span>
          <p className="producto__description">{frame.description}</p>

          {palette.length > 1 && <div className="producto__section">
            <h2 className="producto__section-title">Elige un color</h2>
            <div className="producto__colors">
              {palette.map((color) => <button key={color.id} type="button" aria-label={color.label} aria-pressed={color.id === colorId} className={`producto__color-swatch ${color.id === colorId ? 'producto__color-swatch--selected' : ''}`} style={{ backgroundColor: color.hex }} onClick={() => { setColorId(color.id); setPhotoIndex(0) }} />)}
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
