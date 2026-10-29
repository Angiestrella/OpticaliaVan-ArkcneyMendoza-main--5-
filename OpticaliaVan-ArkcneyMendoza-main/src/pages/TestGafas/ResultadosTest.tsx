import { Pencil, RotateCcw, Sparkles } from 'lucide-react'
import type { Frame } from '../../data/types'
import { ResultadoCard } from './ResultadoCard'

interface Props {
  ideales: Frame[]
  otras: Frame[]
  resumen: Array<{ paso: number; etiqueta: string; valor?: string }>
  onEditar: (paso: number) => void
  onReiniciar: () => void
  onCotizar: (id: string) => void
}

// Última vista del test: lo que respondió (se puede tocar para cambiarlo) y las monturas sugeridas.
export function ResultadosTest({ ideales, otras, resumen, onEditar, onReiniciar, onCotizar }: Props) {
  const idsRecomendadas = [...ideales, ...otras].map((frame) => frame.id)

  return (
    <>
      <div className="test-gafas__head test-gafas__head--results">
        <p className="test-gafas__eyebrow"><Sparkles size={15} aria-hidden="true" /> Tu resultado</p>
        <h1>Tus gafas recomendadas</h1>
        <p className="test-gafas__hint">Según lo que respondiste. Pruébatelas en vivo o cotízalas con un asesor.</p>
        <div className="test-gafas__answers" aria-label="Tus respuestas (toca una para cambiarla)">
          {resumen.map(({ paso, etiqueta, valor }) => (
            <button key={paso} type="button" className="test-gafas__answer" onClick={() => onEditar(paso)}>
              <span>{etiqueta}:</span> <strong>{valor || '—'}</strong>
              <Pencil size={13} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      {ideales.length > 0 && (
        <>
          <h2 className="test-gafas__results-title">Ideal para ti</h2>
          <div className="test-gafas__results">
            {ideales.map((frame, i) => (
              <ResultadoCard key={frame.id} frame={frame} indice={i} destacada={i === 0} idsRecomendadas={idsRecomendadas} onCotizar={onCotizar} />
            ))}
          </div>
        </>
      )}
      {otras.length > 0 && (
        <>
          <h2 className="test-gafas__results-title">También te pueden gustar</h2>
          <div className="test-gafas__results">
            {otras.map((frame, i) => (
              <ResultadoCard key={frame.id} frame={frame} indice={ideales.length + i} idsRecomendadas={idsRecomendadas} onCotizar={onCotizar} />
            ))}
          </div>
        </>
      )}

      <button type="button" className="test-gafas__again" onClick={onReiniciar}>
        <RotateCcw size={17} aria-hidden="true" /> Volver a hacer el test
      </button>
    </>
  )
}
