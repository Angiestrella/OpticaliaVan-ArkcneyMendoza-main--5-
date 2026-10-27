import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDownUp, ChevronDown, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
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
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState('recomendados')
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
    generosActivos.length > 0 || categoriasActivas.length > 0 || marcasActivas.length > 0 || busqueda.trim().length > 0

  function limpiarFiltros() {
    setGenerosActivos([])
    setCategoriasActivas([])
    setMarcasActivas([])
    setBusqueda('')
  }

  const resultado = frames.filter((frame) => {
    const pasaGenero =
      generosActivos.length === 0 ||
      frame.genero === 'unisex' ||
      generosActivos.includes(frame.genero)
    const pasaCategoria =
      categoriasActivas.length === 0 || categoriasActivas.includes(frame.category)
    const pasaMarca = marcasActivas.length === 0 || marcasActivas.includes(frame.brand)
    const termino = busqueda.trim().toLocaleLowerCase('es')
    const pasaBusqueda = !termino || `${frame.name} ${frame.brand} ${frame.silhouette}`.toLocaleLowerCase('es').includes(termino)
    return pasaGenero && pasaCategoria && pasaMarca && pasaBusqueda
  }).sort((a, b) => {
    if (orden === 'precio-menor') return a.price - b.price
    if (orden === 'precio-mayor') return b.price - a.price
    return Number(b.trending) - Number(a.trending)
  })

  return (
    <section className="catalogo">
      <header className="catalogo__intro">
        <div>
          <p className="catalogo__eyebrow"><Sparkles size={15} /> Encuentra tu estilo</p>
          <h1 className="catalogo__title">Catálogo de gafas</h1>
          <p className="catalogo__descripcion">Explora monturas para cada momento y encuentra la que mejor va contigo.</p>
        </div>
        <span className="catalogo__intro-mark" aria-hidden="true">O</span>
      </header>

      <div className="catalogo__tools">
        <label className="catalogo__search">
          <Search size={19} aria-hidden="true" />
          <input type="search" placeholder="Buscar por modelo, marca o estilo" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} aria-label="Buscar gafas por modelo, marca o estilo" />
        </label>
        <label className="catalogo__sort">
          <ArrowDownUp size={17} aria-hidden="true" />
          <span>Ordenar:</span>
          <select value={orden} onChange={(event) => setOrden(event.target.value)} aria-label="Ordenar catálogo">
            <option value="recomendados">Recomendados</option>
            <option value="precio-menor">Menor precio</option>
            <option value="precio-mayor">Mayor precio</option>
          </select>
        </label>
      </div>

      <div className="catalogo__filter-heading"><SlidersHorizontal size={17} /><span>Filtra la colección</span></div>

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

      <div className="catalogo__results">
        <p><strong>{resultado.length}</strong> {resultado.length === 1 ? 'modelo encontrado' : 'modelos encontrados'}</p>
        {hayFiltrosActivos && <span>Filtros aplicados</span>}
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
