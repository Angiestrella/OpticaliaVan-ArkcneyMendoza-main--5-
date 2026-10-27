import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Frame } from '../../data/types'
import { getPalette } from '../../utils/colors'
import { formatPrice } from '../../utils/formatPrice'
import { asset } from '../../utils/asset'
import './FrameCard.scss'

export function FrameCard({ frame }: { frame: Frame }) {
  const [colorId, setColorId] = useState(frame.colors[0]?.id)
  const selected = frame.colors.find((c) => c.id === colorId) ?? frame.colors[0]
  // La paleta compartida solo presta el color del punto del selector — la
  // foto que se ve siempre es la real de esta montura en ese color.
  const palette = getPalette(frame.colors.map((c) => c.id))

  return (
    <Link className="frame-card" to={`/producto/${frame.id}`}>
      <div className="frame-card__photo">
        {(frame.trending || frame.category === 'sol') && (
          <span className="frame-card__badge">
            {frame.trending ? 'Tendencia' : 'Gafas de sol'}
          </span>
        )}
        {selected && (
          <img src={asset(selected.image)} alt={`${frame.name} — ${selected.label}`} />
        )}
      </div>

      {palette.length > 1 && (
        <div className="frame-card__colors">
          {palette.map((color) => (
            <button
              key={color.id}
              type="button"
              aria-label={color.label}
              aria-pressed={color.id === colorId}
              className={`frame-card__swatch ${color.id === colorId ? 'frame-card__swatch--selected' : ''}`}
              style={{ backgroundColor: color.hex }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setColorId(color.id)
              }}
            />
          ))}
        </div>
      )}

      <p className="frame-card__name">{frame.name}</p>
      <p className="frame-card__description">{frame.silhouette}</p>
      <div className="frame-card__footer">
        <p className="frame-card__price">Desde {formatPrice(frame.price)}</p>
        <span className="frame-card__details">Ver detalles <span aria-hidden="true">→</span></span>
      </div>
    </Link>
  )
}
