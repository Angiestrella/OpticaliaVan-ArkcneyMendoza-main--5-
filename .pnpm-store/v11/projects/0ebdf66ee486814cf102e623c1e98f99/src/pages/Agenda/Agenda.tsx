import { useState } from 'react'
import {
  Calendar,
  Check,
  Clock,
  Droplet,
  Eye,
  Glasses,
  MessageCircle,
  RefreshCw,
  Sun,
  Sunset,
  User,
} from 'lucide-react'
import contact from '../../data/contact.json'
import { formatLongDate, toInputDate } from '../../utils/formatDate'
import { buildWhatsappUrl } from '../../utils/whatsapp'
import './Agenda.scss'

const necesidades = [
  { id: 'examen', label: 'Examen visual', Icon: Eye },
  { id: 'gafas', label: 'Comprar gafas', Icon: Glasses },
  { id: 'lentes-contacto', label: 'Lentes de contacto', Icon: Droplet },
  { id: 'control', label: 'Control / seguimiento', Icon: RefreshCw },
]

const horarios = [
  { id: 'manana', label: 'Mañana', Icon: Sun },
  { id: 'tarde', label: 'Tarde', Icon: Sunset },
  { id: 'sin-preferencia', label: 'Sin preferencia', Icon: Clock },
]

const MAX_MENSAJE = 200

export function Agenda() {
  const [nombre, setNombre] = useState('')
  const [necesidadIds, setNecesidadIds] = useState<string[]>([])
  const [fecha, setFecha] = useState('')
  const [horarioId, setHorarioId] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState('')

  function toggleNecesidad(id: string) {
    setNecesidadIds((actuales) =>
      actuales.includes(id) ? actuales.filter((n) => n !== id) : [...actuales, id],
    )
  }

  const necesidadesElegidas = necesidades.filter((n) => necesidadIds.includes(n.id))
  const horario = horarios.find((h) => h.id === horarioId)

  // Solo hay mensaje (y botón activo) cuando están los 4 datos obligatorios;
  // la nota del final es la única parte opcional.
  const mensajeWhatsapp =
    nombre.trim() && necesidadesElegidas.length > 0 && fecha && horario
      ? [
          'Hola, quiero agendar una cita.',
          `• Nombre: ${nombre.trim()}`,
          `• Necesito: ${necesidadesElegidas.map((n) => n.label).join(', ')}`,
          `• Día: ${formatLongDate(fecha)}`,
          `• Horario preferido: ${horario.label}`,
          mensaje.trim() ? `• Nota: ${mensaje.trim()}` : '',
          '¿Tienen disponibilidad?',
        ]
          .filter((linea) => linea !== '')
          .join('\n')
      : null

  return (
    <section className="agenda">
      <div className="agenda__card">
        <header className="agenda__header">
          <h1>Agenda tu cita</h1>
          <p className="agenda__intro">
            Selecciona lo que necesitas y elige la fecha y el horario. Al
            finalizar, te llevará a WhatsApp para que confirmemos tu cita.
          </p>
        </header>

        <div className="agenda__section">
          <div className="agenda__section-head">
            <span className="agenda__step">1</span>
            <h2>¿Cómo te llamas?</h2>
          </div>
          <div className="agenda__field">
            <User className="agenda__field-icon" size={18} strokeWidth={1.8} />
            <input
              type="text"
              className="agenda__input"
              placeholder="Tu nombre"
              aria-label="¿Cómo te llamas?"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
        </div>

        <div className="agenda__section">
          <div className="agenda__section-head">
            <span className="agenda__step">2</span>
            <h2>¿Qué necesitas?</h2>
          </div>
          <div className="agenda__options">
            {necesidades.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={necesidadIds.includes(id)}
                className={`agenda__option ${necesidadIds.includes(id) ? 'agenda__option--selected' : ''}`}
                onClick={() => toggleNecesidad(id)}
              >
                {necesidadIds.includes(id) && (
                  <span className="agenda__option-check">
                    <Check size={11} strokeWidth={3} />
                  </span>
                )}
                <Icon size={22} strokeWidth={1.8} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="agenda__section">
          <div className="agenda__section-head">
            <span className="agenda__step">3</span>
            <h2>¿Qué día te gustaría venir?</h2>
          </div>
          <div className="agenda__field">
            <Calendar
              className="agenda__field-icon"
              size={18}
              strokeWidth={1.8}
            />
            <input
              type="date"
              className="agenda__input"
              aria-label="¿Qué día te gustaría venir?"
              value={fecha}
              min={toInputDate(new Date())}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
        </div>

        <div className="agenda__section">
          <div className="agenda__section-head">
            <span className="agenda__step">4</span>
            <h2>¿Qué horario prefieres?</h2>
          </div>
          <div className="agenda__options">
            {horarios.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={horarioId === id}
                className={`agenda__option ${horarioId === id ? 'agenda__option--selected' : ''}`}
                onClick={() => setHorarioId(id)}
              >
                {horarioId === id && (
                  <span className="agenda__option-check">
                    <Check size={11} strokeWidth={3} />
                  </span>
                )}
                <Icon size={22} strokeWidth={1.8} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="agenda__section">
          <div className="agenda__section-head">
            <span className="agenda__step">5</span>
            <h2>
              ¿Quieres contarnos algo más?{' '}
              <span className="agenda__optional">(opcional)</span>
            </h2>
          </div>
          <textarea
            className="agenda__textarea"
            placeholder="Ej. Es mi primera consulta / necesito lentes de contacto."
            aria-label="¿Quieres contarnos algo más? (opcional)"
            value={mensaje}
            maxLength={MAX_MENSAJE}
            onChange={(e) => setMensaje(e.target.value)}
          />
          <p className="agenda__counter">
            {mensaje.length}/{MAX_MENSAJE}
          </p>
        </div>

        {mensajeWhatsapp ? (
          <a
            className="agenda__submit"
            href={buildWhatsappUrl(contact.whatsapp, mensajeWhatsapp)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} strokeWidth={1.8} />
            Consultar disponibilidad
          </a>
        ) : (
          <button type="button" className="agenda__submit" disabled>
            <MessageCircle size={18} strokeWidth={1.8} />
            Consultar disponibilidad
          </button>
        )}
      </div>
    </section>
  )
}
