import { Fragment, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Clock } from 'lucide-react'
// lens-options.json: precios de ejemplo, pendientes de definir con la óptica.
import { contacto, opcionesLente } from '../../data'
import type { Frame } from '../../data/types'
import { formatPrice } from '../../utils/formatPrice'
import { alternar } from '../../utils/alternar'
import { useFlechas } from '../../utils/useFlechas'
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
  const [tinteId, setTinteId] = useState<string | null>(null)
  const flechasOpciones = useFlechas<HTMLDivElement>('.cotizar__option, .cotizar__tinte')

  const material = opcionesLente.materiales.find((m) => m.id === materialId)
  const filtros = opcionesLente.filtros.filter((f) => filtroIds.includes(f.id))
  const tinte = opcionesLente.tintes.find((t) => t.id === tinteId)
  const detalleTinteRef = useRef<HTMLDivElement>(null)

  // La explicación aparece debajo de las 12 tarjetas: se muestra al elegir un tinte.
  useEffect(() => {
    if (tinteId) detalleTinteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [tinteId])

  const dialogoRef = useRef<HTMLDivElement>(null)
  const cerrarRef = useRef<HTMLButtonElement>(null)

  // Al abrirse, el foco del teclado entra a la ventana (botón Cerrar); al
  // cerrarse, vuelve a donde estaba (por ejemplo, el botón "Cotizar").
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null
    cerrarRef.current?.focus({ preventScroll: true })
    return () => anterior?.focus({ preventScroll: true })
  }, [])

  // Como toda ventana emergente: Escape la cierra y Tab no se sale de ella.
  useEffect(() => {
    const alPresionarTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialogoRef.current) return
      const enfocables = dialogoRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      const primero = enfocables[0]
      const ultimo = enfocables[enfocables.length - 1]
      if (!primero) return
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    }
    window.addEventListener('keydown', alPresionarTecla)
    return () => window.removeEventListener('keydown', alPresionarTecla)
  }, [onClose])

  const total =
    frame.price +
    (material?.price ?? 0) +
    filtros.reduce((sum, f) => sum + f.price, 0)

  function toggleMaterial(id: string) {
    setMaterialId((actual) => (actual === id ? null : id))
  }

  function toggleFiltro(id: string) {
    // Al quitar "Tinte terapéutico" también se olvida el tinte elegido.
    if (id === 'tinte' && filtroIds.includes(id)) setTinteId(null)
    setFiltroIds((actual) => alternar(actual, id))
  }

  function nombreFiltro(f: { id: string; label: string }) {
    if (f.id !== 'tinte') return f.label
    return `${f.label}: ${tinte ? `${tinte.nombre}, ${tinte.color.toLowerCase()}` : 'por definir con el optómetra'}`
  }

  const mensaje = [
    'Hola, quiero cotizar unas gafas:',
    `• Montura (sin lentes): ${frame.name} (${frame.brand}) — ${formatPrice(frame.price)}`,
    material
      ? `• Material del lente: ${material.label} (${priceLabel(material.price)})`
      : '',
    filtros.length > 0
      ? `• Filtros: ${filtros.map((f) => `${nombreFiltro(f)} (${priceLabel(f.price)})`).join(', ')}`
      : '',
    `Total aproximado: ${formatPrice(total)}`,
    'Te enviaré mi fórmula por este chat para confirmar el precio exacto.',
  ]
    .filter((linea) => linea !== '')
    .join('\n')

  // Se dibuja directo en <body>: así se ve bien aunque se abra desde una
  // tarjeta con movimiento (catálogo) o encima de la cámara (probador).
  // Tocar el fondo oscuro (fuera de la ventana) la cierra; con teclado, Escape.
  return createPortal(
    <div className="cotizar__backdrop" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      {/* role="dialog" + aria-modal: los lectores de pantalla lo anuncian como ventana.
          El foco, Tab y Escape se manejan arriba (patrón de diálogo de WAI-ARIA), así que
          no hace falta la etiqueta <dialog>. */}
      <div
        ref={dialogoRef}
        className="cotizar"
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="dialog"
        aria-modal="true"
        aria-labelledby="cotizar-titulo"
      >
        <div className="cotizar__header">
          <h2 id="cotizar-titulo">Cotizar</h2>
          <button
            ref={cerrarRef}
            type="button"
            className="cotizar__close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            &times;
          </button>
        </div>

        <div className="cotizar__body" ref={flechasOpciones}>
          <div className="cotizar__frame">
            <div>
              <p className="cotizar__label">Montura (sin lentes)</p>
              <p className="cotizar__frame-name">{frame.name}</p>
            </div>
            <p className="cotizar__frame-price">
              {formatPrice(frame.price)}
            </p>
          </div>

          <h3 className="cotizar__group-title">Material del lente</h3>
          <div className="cotizar__options">
            {opcionesLente.materiales.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={materialId === m.id}
                className={`cotizar__option ${materialId === m.id ? 'cotizar__option--selected' : ''}`}
                onClick={() => toggleMaterial(m.id)}
              >
                <span className="cotizar__option-copy"><strong>{m.label}</strong><small>{m.descripcion}</small></span>
                <span className="cotizar__option-price">{priceLabel(m.price)}</span>
              </button>
            ))}
          </div>

          <h3 className="cotizar__group-title">Filtros</h3>
          <div className="cotizar__options">
            {opcionesLente.filtros.map((f) => (
              <Fragment key={f.id}>
                <button
                  type="button"
                  aria-pressed={filtroIds.includes(f.id)}
                  className={`cotizar__option ${filtroIds.includes(f.id) ? 'cotizar__option--selected' : ''}`}
                  onClick={() => toggleFiltro(f.id)}
                >
                  <span className="cotizar__option-copy"><strong>{f.label}</strong><small>{f.descripcion}</small></span>
                  <span className="cotizar__option-price">{priceLabel(f.price)}</span>
                </button>
                {f.id === 'tinte' && filtroIds.includes('tinte') && (
                  <fieldset className="cotizar__tintes" aria-labelledby="cotizar-tintes-title">
                    <p id="cotizar-tintes-title" className="cotizar__tintes-title">Elige el tinte terapéutico</p>
                    <div className="cotizar__tintes-list">
                      {opcionesLente.tintes.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          aria-pressed={tinteId === t.id}
                          aria-label={`${t.nombre}: ${t.uso}`}
                          className={`cotizar__tinte ${tinteId === t.id ? 'cotizar__tinte--selected' : ''}`}
                          onClick={() => setTinteId(t.id)}
                        >
                          <span className="cotizar__tinte-ball" style={{ backgroundColor: t.swatch }} aria-hidden="true" />
                          <span className="cotizar__tinte-copy">
                            <strong>{t.nombre}</strong>
                            <small>{t.uso}</small>
                          </span>
                        </button>
                      ))}
                    </div>
                    {tinte && (
                      <div ref={detalleTinteRef} className="cotizar__tinte-detail" aria-live="polite">
                        <span className="cotizar__tinte-ball cotizar__tinte-ball--big" style={{ backgroundColor: tinte.swatch }} aria-hidden="true" />
                        <div>
                          <strong>{tinte.nombre} · {tinte.color}</strong>
                          <p>{tinte.detalle}</p>
                        </div>
                      </div>
                    )}
                    <p className="cotizar__tintes-note">
                      Los colores son aproximados. El optómetra confirma qué filtro te conviene según tu caso.
                    </p>
                  </fieldset>
                )}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="cotizar__footer">
          <div className="cotizar__total">
            <span>Total aproximado</span>
            <span>{formatPrice(total)}</span>
          </div>
          <p className="cotizar__note">
            El precio de la montura no incluye los lentes. El total suma los
            lentes y filtros que elegiste y es aproximado: el valor exacto se
            confirma con tu fórmula.
          </p>
          <a
            className="cotizar__advisor"
            href={buildWhatsappUrl(contacto.whatsapp, mensaje)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Contactar con asesor
          </a>
          <p className="cotizar__response">
            <Clock size={14} aria-hidden="true" />
            Te respondemos en {contacto.tiempoRespuesta} por WhatsApp.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
