import { Link } from 'react-router-dom'
import { ArrowRight, SearchX } from 'lucide-react'
import './NoEncontrada.scss'

// Se muestra cuando la dirección no corresponde a ninguna página (ruta "*").
// Su título y el "noindex" (que Google no la guarde) los pone Layout con useSeo.
export function NoEncontrada() {
  return (
    <section className="no-encontrada" aria-labelledby="no-encontrada-titulo">
      <SearchX className="no-encontrada__icono" size={44} strokeWidth={1.6} aria-hidden="true" />
      <h1 id="no-encontrada-titulo">No encontramos esta página</h1>
      <p>Puede que el enlace esté mal escrito o que la página ya no exista.</p>
      <div className="no-encontrada__acciones">
        <Link className="no-encontrada__principal" to="/">
          Ir al inicio <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <Link className="no-encontrada__secundario" to="/catalogo">Ver el catálogo</Link>
      </div>
    </section>
  )
}
