import { Link } from 'react-router-dom'
import type { Frame } from '../../data/types'
import { asset } from '../../utils/asset'
import { formatPrice } from '../../utils/formatPrice'
import { colorParaMostrar } from '../../utils/recomendar'
import { tienePruebaVirtual } from '../PruebaVirtual/modelos3d'
import { conIndice } from './opciones'

interface Props {
  frame: Frame
  indice: number
  colores: string[] // los elegidos en el test: la foto sale en uno de ellos
  destacada?: boolean
  motivo?: string // por qué se sugiere (solo en "También te pueden gustar")
  idsRecomendadas: string[] // el probador muestra solo estas monturas
}

// Tarjeta de una montura recomendada: probarla en vivo o ver sus detalles
// (en la página de la montura están las fotos, los colores y el botón de cotizar).
export function ResultadoCard({ frame, indice, colores, destacada = false, motivo, idsRecomendadas }: Props) {
  const color = colorParaMostrar(frame, colores)
  return (
    <div className="result-card" style={conIndice(indice)}>
      <div className="result-card__photo">
        {destacada && <span className="result-card__badge">Mejor coincidencia</span>}
        <img src={asset(color.image)} alt={`${frame.name} — ${color.label}`} loading="lazy" decoding="async" />
        {/* Solo las que tienen modelo 3D se pueden probar en vivo. */}
        {tienePruebaVirtual(frame.id) && (
          <Link
            className="result-card__try-btn"
            to="/prueba-virtual"
            state={{ recomendadas: idsRecomendadas, seleccionada: frame.id, color: color.id }}
          >
            Probar en 3D
          </Link>
        )}
      </div>
      {motivo && <p className="result-card__motivo">{motivo}</p>}
      <p className="result-card__name">{frame.name}</p>
      <p className="result-card__price">Desde {formatPrice(frame.price)}</p>
      {/* La página de la montura abre en el mismo color de la foto. */}
      <Link className="result-card__detalles" to={`/producto/${frame.id}`} state={{ color: color.id }} aria-label={`Ver detalles de ${frame.name}`}>
        Ver detalles <span aria-hidden="true">→</span>
      </Link>
    </div>
  )
}
