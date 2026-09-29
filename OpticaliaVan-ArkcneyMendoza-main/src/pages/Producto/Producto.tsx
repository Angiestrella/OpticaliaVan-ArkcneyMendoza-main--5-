import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { CotizarPanel } from '../../components/CotizarPanel/CotizarPanel'
import frames from '../../data/frames.json'
import { getPalette } from '../../utils/colors'
import { formatPrice } from '../../utils/formatPrice'
import './Producto.scss'

export function Producto() {
  const { id } = useParams()
  const [cotizarOpen, setCotizarOpen] = useState(false)

  const frame = frames.find((f) => f.id === id)
  // Los hooks no pueden ir después de un return condicional, así que este se
  // inicializa antes de saber si frame existe.
  const [colorId, setColorId] = useState(frame?.colors[0]?.id)

  // Un id que no existe en frames.json no tiene página: de vuelta al catálogo.
  if (!frame) {
    return <Navigate to="/catalogo" replace />
  }

  const selected = frame.colors.find((c) => c.id === colorId) ?? frame.colors[0]
  const palette = getPalette(frame.colors.map((c) => c.id))

  return (
    <section className="producto">
      <div className="producto__layout">
        <div className="producto__photo">
          {selected && (
            <img src={selected.image} alt={`${frame.name} — ${selected.label}`} />
          )}
          <Link
            className="producto__try-btn"
            to="/prueba-virtual"
            state={{ seleccionada: frame.id }}
          >
            Probar
          </Link>
        </div>

        <div className="producto__info">
          <h1 className="producto__name">{frame.name}</h1>
          <p className="producto__price">Desde {formatPrice(frame.price)}</p>

          {palette.length > 1 && (
            <div className="producto__section">
              <h2 className="producto__section-title">Color</h2>
              <div className="producto__colors">
                {palette.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    aria-label={color.label}
                    aria-pressed={color.id === colorId}
                    className={`producto__color-swatch ${color.id === colorId ? 'producto__color-swatch--selected' : ''}`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => setColorId(color.id)}
                  />
                ))}
              </div>
            </div>
          )}

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
