import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { FrameCard } from '../../components/FrameCard/FrameCard'
import frames from '../../data/frames.json'
import './Catalogo.scss'

const generos = [
  { id: 'hombre', label: 'Hombre' },
  { id: 'mujer', label: 'Mujer' },
]

const categorias = [
  { id: 'sol', label: 'Sol' },
  { id: 'formula', label: 'Recetadas' },
]

function alternar(lista: string[], id: string) {
  return lista.includes(id) ? lista.filter((item) => item !== id) : [...lista, id]
}

export function Catalogo() {
  const marcas = useMemo(() => [...new Set(frames.map((frame) => frame.brand))], [])

  const [generosActivos, setGenerosActivos] = useState<string[]>([])
  const [categoriasActivas, setCategoriasActivas] = useState<string[]>([])
  const [marcasActivas, setMarcasActivas] = useState<string[]>([])
  const [marcasAbierto, setMarcasAbierto] = useState(false)
  const marcasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function cerrarSiEsAfuera(e: MouseEvent) {
      if (marcasRef.current && !marcasRef.current.contains(e.target as Node)) {
        setMarcasAbierto(false)
      }
    }
    document.addEventListener('mousedown', cerrarSiEsAfuera)
    return () => document.removeEventListener('mousedown', cerrarSiEsAfuera)
  }, [])

  const hayFiltrosActivos =
    generosActivos.length > 0 || categoriasActivas.length > 0 || marcasActivas.length > 0

  function limpiarFiltros() {
    setGenerosActivos([])
    setCategoriasActivas([])
    setMarcasActivas([])
  }

  const resultado = frames.filter((frame) => {
    const pasaGenero =
      generosActivos.length === 0 ||
      frame.genero === 'unisex' ||
      generosActivos.includes(frame.genero)
    const pasaCategoria =
      categoriasActivas.length === 0 || categoriasActivas.includes(frame.category)
    const pasaMarca = marcasActivas.length === 0 || marcasActivas.includes(frame.brand)
    return pasaGenero && pasaCategoria && pasaMarca
  })

  return (
    <section className="catalogo">
      <h1 className="catalogo__title">Catálogo</h1>

      <div className="catalogo__filtros">
        {generos.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={generosActivos.includes(id)}
            className={`catalogo__filtro ${generosActivos.includes(id) ? 'catalogo__filtro--activo' : ''}`}
            onClick={() => setGenerosActivos((activos) => alternar(activos, id))}
          >
            {label}
          </button>
        ))}

        <div className="catalogo__marcas" ref={marcasRef}>
          <button
            type="button"
            aria-expanded={marcasAbierto}
            className={`catalogo__filtro ${marcasActivas.length > 0 ? 'catalogo__filtro--activo' : ''}`}
            onClick={() => setMarcasAbierto((abierto) => !abierto)}
          >
            Marcas
            {marcasActivas.length > 0 && (
              <span className="catalogo__contador">{marcasActivas.length}</span>
            )}
            <ChevronDown size={16} strokeWidth={2} />
          </button>

          {marcasAbierto && (
            <div className="catalogo__marcas-panel">
              {marcas.map((marca) => (
                <label key={marca} className="catalogo__marcas-opcion">
                  <input
                    type="checkbox"
                    checked={marcasActivas.includes(marca)}
                    onChange={() => setMarcasActivas((activas) => alternar(activas, marca))}
                  />
                  {marca}
                </label>
              ))}
            </div>
          )}
        </div>

        {categorias.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={categoriasActivas.includes(id)}
            className={`catalogo__filtro ${categoriasActivas.includes(id) ? 'catalogo__filtro--activo' : ''}`}
            onClick={() => setCategoriasActivas((activas) => alternar(activas, id))}
          >
            {label}
          </button>
        ))}

        {hayFiltrosActivos && (
          <button type="button" className="catalogo__limpiar" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        )}
      </div>

      {resultado.length > 0 ? (
        <div className="catalogo__grid">
          {resultado.map((frame) => (
            <FrameCard key={frame.id} frame={frame} />
          ))}
        </div>
      ) : (
        <p className="catalogo__vacio">No hay gafas que coincidan con estos filtros.</p>
      )}
    </section>
  )
}
