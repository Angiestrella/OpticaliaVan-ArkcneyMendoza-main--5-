import { Link } from 'react-router-dom'
import './EncuentraTusGafas.scss'

export function EncuentraTusGafas() {
  return (
    <section className="encuentra">
      <h1>¿Quieres realizar el test?</h1>
      <p className="encuentra__hint">
        Encuentra la montura que mejor se adapta a tu rostro y a tu estilo.
        Solo te toma 2 minutos.
      </p>

      <div className="encuentra__options">
        <Link className="encuentra__option" to="/que-gafas-van-contigo">
          Sí
        </Link>
        <Link
          className="encuentra__option encuentra__option--outline"
          to="/prueba-virtual"
        >
          No
        </Link>
      </div>
    </section>
  )
}
