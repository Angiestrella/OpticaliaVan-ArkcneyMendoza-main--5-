import { Link } from 'react-router-dom'
import type { Frame } from '../../data/types'
import { asset } from '../../utils/asset'
import { formatPrice } from '../../utils/formatPrice'
import { conIndice } from './opciones'

interface Props {
  frame: Frame
  indice: number
  destacada?: boolean
  idsRecomendadas: string[] // el probador muestra solo estas monturas
}

// Tarjeta de una montura recomendada: probarla en vivo o ver sus detalles
// (en la página de la montura están las fotos, los colores y el botón de cotizar).
export function ResultadoCard({ frame, indice, destacada = false, idsRecomendadas }: Props) {
  return (
    <div className="result-card" style={conIndice(indice)}>
      <div className="result-card__photo">
        {destacada && <span className="result-card__badge">Mejor coincidencia</span>}
        <img src={asset(frame.colors[0].image)} alt={frame.name} loading="lazy" decoding="async" />
        <Link
          className="result-card__try-btn"
          to="/prueba-virtual"
          state={{ recomendadas: idsRecomendadas, seleccionada: frame.id }}
        >
          Probar
        </Link>
      </div>
      <p className="result-card__name">{frame.name}</p>
      <p className="result-card__price">Desde {formatPrice(frame.price)}</p>
      <Link className="result-card__detalles" to={`/producto/${frame.id}`} aria-label={`Ver detalles de ${frame.name}`}>
        Ver detalles <span aria-hidden="true">→</span>
      </Link>
    </div>
  )
}
