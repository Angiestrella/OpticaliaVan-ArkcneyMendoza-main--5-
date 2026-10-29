import { useRef, useState, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Frame } from '../../data/types'
import { CotizarPanel } from '../CotizarPanel/CotizarPanel'
import { getPalette } from '../../utils/colors'
import { formatPrice } from '../../utils/formatPrice'
import { asset } from '../../utils/asset'
import { useFlechas } from '../../utils/useFlechas'
import './FrameCard.scss'

// accion: "cotizar" abre el cotizador ahí mismo (catálogo); "ver" lleva a la
// página de la montura, con sus detalles y su propio botón de cotizar (Inicio).
export function FrameCard({ frame, accion = 'cotizar' }: { frame: Frame; accion?: 'cotizar' | 'ver' }) {
  const [colorId, setColorId] = useState(frame.colors[0]?.id)
  const [cotizarOpen, setCotizarOpen] = useState(false)
  const selected = frame.colors.find((c) => c.id === colorId) ?? frame.colors[0]
  // La paleta compartida solo presta el color del punto del selector — la
  // foto que se ve siempre es la real de esta montura en ese color.
  const palette = getPalette(frame.colors.map((c) => c.id))
  const cardRef = useRef<HTMLElement>(null)
  const flechasColores = useFlechas<HTMLDivElement>('.frame-card__swatch')

  // Inclinación 3D: la tarjeta "mira" hacia el mouse y un brillo lo sigue.
  // Solo con mouse (en celular no hay "pasar por encima").
  function inclinar(e: PointerEvent<HTMLElement>) {
    const card = cardRef.current
    if (!card || e.pointerType !== 'mouse') return
    const r = card.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    card.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`)
    card.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`)
    card.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`)
    card.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`)
  }

  function soltar() {
    const card = cardRef.current
    if (!card) return
    for (const v of ['--rx', '--ry', '--mx', '--my']) card.style.removeProperty(v)
  }

  // Toda la tarjeta lleva al producto: el enlace del nombre se estira sobre
  // ella (ver .frame-card__link). Los colores y "Cotizar" quedan por encima.
  return (
    // h-100 (utilidad de Bootstrap): todas las tarjetas de una fila quedan del mismo alto.
    <article ref={cardRef} className="frame-card h-100" onPointerMove={inclinar} onPointerLeave={soltar}>
      <div className="frame-card__photo">
        {(frame.trending || frame.category === 'sol') && (
          <span className="frame-card__badge">
            {frame.trending ? 'Tendencia' : 'Gafas de sol'}
          </span>
        )}
        {/* key: al cambiar de color la foto nueva entra con un fundido. */}
        {selected && (
          <img key={selected.id} src={asset(selected.image)} alt={`${frame.name} — ${selected.label}`} loading="lazy" decoding="async" />
        )}
      </div>

      {palette.length > 1 && (
        <div className="frame-card__colors" ref={flechasColores}>
          {palette.map((color) => (
            <button
              key={color.id}
              type="button"
              // Con el nombre de la montura: el color se anuncia antes que el nombre de la tarjeta.
              aria-label={`${frame.name} en color ${color.label.toLowerCase()}`}
              aria-pressed={color.id === colorId}
              className={`frame-card__swatch ${color.id === colorId ? 'frame-card__swatch--selected' : ''}`}
              style={{ backgroundColor: color.hex }}
              onClick={() => setColorId(color.id)}
            />
          ))}
        </div>
      )}

      <p className="frame-card__name">
        <Link className="frame-card__link" to={`/producto/${frame.id}`}>{frame.name}</Link>
      </p>
      <p className="frame-card__description">{frame.silhouette}</p>
      <div className="frame-card__footer">
        <p className="frame-card__price">Desde {formatPrice(frame.price)}</p>
        {accion === 'cotizar' && <span className="frame-card__details" aria-hidden="true">Ver detalles →</span>}
      </div>
      {accion === 'cotizar' ? (
        <button type="button" className="frame-card__quote" onClick={() => setCotizarOpen(true)}>
          Cotizar
        </button>
      ) : (
        <Link className="frame-card__quote" to={`/producto/${frame.id}`} tabIndex={-1} aria-hidden="true">
          Ver más <span aria-hidden="true">→</span>
        </Link>
      )}

      {cotizarOpen && <CotizarPanel frame={frame} onClose={() => setCotizarOpen(false)} />}
    </article>
  )
}
