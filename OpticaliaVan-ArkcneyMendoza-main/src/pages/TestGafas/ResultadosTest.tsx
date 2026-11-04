import { Pencil, RotateCcw, Sparkles } from 'lucide-react'
import type { Frame } from '../../data/types'
import type { Sugerencia } from '../../utils/recomendar'
import { ResultadoCard } from './ResultadoCard'

interface Props {
  ideales: Frame[]
  otras: Sugerencia[]
  colores: string[]
  resumen: Array<{ paso: number; etiqueta: string; valor?: string }>
  onEditar: (paso: number) => void
  onReiniciar: () => void
}

// Última vista del test: lo que respondió (se puede tocar para cambiarlo) y las monturas sugeridas.
export function ResultadosTest({ ideales, otras, colores, resumen, onEditar, onReiniciar }: Props) {
  const idsRecomendadas = [...ideales, ...otras.map(({ frame }) => frame)].map((frame) => frame.id)

  return (
    <>
      <div className="test-gafas__head test-gafas__head--results">
        <p className="test-gafas__eyebrow"><Sparkles size={15} aria-hidden="true" /> Tu resultado</p>
        <h1>Tus gafas recomendadas</h1>
        <p className="test-gafas__hint">Según lo que respondiste. Mira sus detalles y cotízalas; las que dicen "Probar en 3D" puedes probártelas en vivo.</p>
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
          <p className="test-gafas__hint test-gafas__results-hint">Del tipo que buscas y en los colores que elegiste.</p>
          <div className="test-gafas__results">
            {ideales.map((frame, i) => (
              <ResultadoCard key={frame.id} frame={frame} indice={i} colores={colores} destacada={i === 0} idsRecomendadas={idsRecomendadas} />
            ))}
          </div>
        </>
      )}
      {ideales.length === 0 && otras.length > 0 && (
        // Pasa cuando ninguna montura de ese tipo viene en los colores elegidos.
        <p className="test-gafas__hint test-gafas__sin-tipo">
          Por ahora no tenemos gafas de ese tipo en los colores que elegiste. Estas se acercan a lo
          que buscas; también puedes tocar "Colores" arriba para elegir otros. En la óptica te
          mostramos más opciones.
        </p>
      )}
      {otras.length > 0 && (
        <>
          <h2 className="test-gafas__results-title">También te pueden gustar</h2>
          <div className="test-gafas__results">
            {otras.map(({ frame, motivo }, i) => (
              <ResultadoCard key={frame.id} frame={frame} indice={ideales.length + i} colores={colores} motivo={motivo} idsRecomendadas={idsRecomendadas} />
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
