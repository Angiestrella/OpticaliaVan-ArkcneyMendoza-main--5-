import { useState } from 'react'
import contact from '../../data/contact.json'
// lens-options.json: precios de ejemplo, pendientes de definir con la óptica.
import lensOptions from '../../data/lens-options.json'
import type { Frame } from '../../data/types'
import { formatPrice } from '../../utils/formatPrice'
import { buildWhatsappUrl } from '../../utils/whatsapp'
import './CotizarPanel.scss'

function priceLabel(price: number) {
  return price > 0 ? `+ ${formatPrice(price)}` : 'Con el asesor'
}

export function CotizarPanel({
  frame,
  onClose,
}: {
  frame: Frame
  onClose: () => void
}) {
  const [materialId, setMaterialId] = useState<string | null>(null)
  const [filtroIds, setFiltroIds] = useState<string[]>([])

  const material = lensOptions.materiales.find((m) => m.id === materialId)
  const filtros = lensOptions.filtros.filter((f) => filtroIds.includes(f.id))
  const total =
    frame.price +
    (material?.price ?? 0) +
    filtros.reduce((sum, f) => sum + f.price, 0)

  function toggleMaterial(id: string) {
    setMaterialId((actual) => (actual === id ? null : id))
  }

  function toggleFiltro(id: string) {
    setFiltroIds((actual) =>
      actual.includes(id) ? actual.filter((f) => f !== id) : [...actual, id],
    )
  }

  const mensaje = [
    'Hola, quiero cotizar unas gafas:',
    `• Montura: ${frame.name} (${frame.brand}) — desde ${formatPrice(frame.price)}`,
    material
      ? `• Material del lente: ${material.label} (${priceLabel(material.price)})`
      : '',
    filtros.length > 0
      ? `• Filtros: ${filtros.map((f) => `${f.label} (${priceLabel(f.price)})`).join(', ')}`
      : '',
    `Total aproximado: ${formatPrice(total)}`,
    'Te enviaré mi fórmula por este chat para confirmar el precio exacto.',
  ]
    .filter((linea) => linea !== '')
    .join('\n')

  return (
    <div className="cotizar__backdrop" onClick={onClose}>
      <div className="cotizar" onClick={(e) => e.stopPropagation()}>
        <header className="cotizar__header">
          <h2>Cotizar</h2>
          <button
            className="cotizar__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            &times;
          </button>
        </header>

        <div className="cotizar__body">
          <div className="cotizar__frame">
            <div>
              <p className="cotizar__label">Montura</p>
              <p className="cotizar__frame-name">{frame.name}</p>
            </div>
            <p className="cotizar__frame-price">
              Desde {formatPrice(frame.price)}
            </p>
          </div>

          <h3 className="cotizar__group-title">Material del lente</h3>
          <div className="cotizar__options">
            {lensOptions.materiales.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={materialId === m.id}
                className={`cotizar__option ${materialId === m.id ? 'cotizar__option--selected' : ''}`}
                onClick={() => toggleMaterial(m.id)}
              >
                <span>{m.label}</span>
                <span>{priceLabel(m.price)}</span>
              </button>
            ))}
          </div>

          <h3 className="cotizar__group-title">Filtros</h3>
          <div className="cotizar__options">
            {lensOptions.filtros.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filtroIds.includes(f.id)}
                className={`cotizar__option ${filtroIds.includes(f.id) ? 'cotizar__option--selected' : ''}`}
                onClick={() => toggleFiltro(f.id)}
              >
                <span>{f.label}</span>
                <span>{priceLabel(f.price)}</span>
              </button>
            ))}
          </div>
        </div>

        <footer className="cotizar__footer">
          <div className="cotizar__total">
            <span>Total aproximado</span>
            <span>{formatPrice(total)}</span>
          </div>
          <p className="cotizar__note">
            Es un valor de referencia: el precio exacto se confirma con tu
            fórmula.
          </p>
          <a
            className="cotizar__advisor"
            href={buildWhatsappUrl(contact.whatsapp, mensaje)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Contactar con asesor
          </a>
        </footer>
      </div>
    </div>
  )
}
