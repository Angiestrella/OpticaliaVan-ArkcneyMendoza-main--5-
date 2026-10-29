import { useState, type FormEvent } from 'react'
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
import { contacto } from '../../data'
import { alternar } from '../../utils/alternar'
import { formatLongDate, toInputDate } from '../../utils/formatDate'
import { buildWhatsappUrl } from '../../utils/whatsapp'
import { GrupoOpciones, type OpcionAgenda } from './GrupoOpciones'
import './Agenda.scss'

const necesidades: OpcionAgenda[] = [
  { id: 'examen', label: 'Examen visual', Icon: Eye },
  { id: 'gafas', label: 'Comprar gafas', Icon: Glasses },
  { id: 'lentes-contacto', label: 'Lentes de contacto', Icon: Droplet },
  { id: 'control', label: 'Control / seguimiento', Icon: RefreshCw },
]

const horarios: OpcionAgenda[] = [
  { id: 'manana', label: 'Mañana', Icon: Sun },
  { id: 'tarde', label: 'Tarde', Icon: Sunset },
  { id: 'sin-preferencia', label: 'Sin preferencia', Icon: Clock },
]

const MAX_MENSAJE = 200

export function Agenda() {
  const [paso, setPaso] = useState(1)
  const [nombre, setNombre] = useState('')
  const [necesidadIds, setNecesidadIds] = useState<string[]>([])
  const [fecha, setFecha] = useState('')
  const [horarioId, setHorarioId] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState('')

  function toggleNecesidad(id: string) {
    setNecesidadIds((actuales) => alternar(actuales, id))
  }

  const necesidadesElegidas = necesidades.filter((n) => necesidadIds.includes(n.id))
  const horario = horarios.find((h) => h.id === horarioId)
  const puedeContinuarDatos = nombre.trim().length > 0 && necesidadesElegidas.length > 0
  // El atributo min del calendario no impide escribir una fecha pasada a mano:
  // por eso también se valida aquí (las fechas "AAAA-MM-DD" se comparan como texto).
  const hoy = toInputDate(new Date())
  const fechaValida = fecha !== '' && fecha >= hoy
  const puedeContinuarPreferencias = Boolean(fechaValida && horario)

  // Enter dentro del formulario avanza al siguiente paso (si ya se puede).
  function alEnviar(e: FormEvent) {
    e.preventDefault()
    if (paso === 1 && puedeContinuarDatos) setPaso(2)
    else if (paso === 2 && puedeContinuarPreferencias) setPaso(3)
  }

  // Solo hay mensaje (y botón activo) cuando están los 4 datos obligatorios;
  // la nota del final es la única parte opcional.
  const mensajeWhatsapp =
    nombre.trim() && necesidadesElegidas.length > 0 && fechaValida && horario
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
      <form className="agenda__card" onSubmit={alEnviar} noValidate>
        <header className="agenda__header">
          <h1>Agenda tu cita</h1>
          <p className="agenda__intro">
            Selecciona lo que necesitas y elige la fecha y el horario. Al
            finalizar, te llevará a WhatsApp para que confirmemos tu cita.
          </p>
        </header>

        <p className="agenda__notice">Enviarás una solicitud por WhatsApp. La cita queda confirmada cuando el equipo te responda con la disponibilidad. <strong>Te respondemos en {contacto.tiempoRespuesta}.</strong></p>

        <ol className="agenda__progress" aria-label="Progreso del agendamiento">
          {['Tus datos', 'Día y horario', 'Confirmación'].map((titulo, index) => (
            <li key={titulo} aria-current={paso === index + 1 ? 'step' : undefined} className={paso === index + 1 ? 'agenda__progress-item agenda__progress-item--active' : paso > index + 1 ? 'agenda__progress-item agenda__progress-item--done' : 'agenda__progress-item'}>
              <span>{paso > index + 1 ? <Check size={14} /> : index + 1}</span>
              <small>{titulo}</small>
            </li>
          ))}
        </ol>

        {paso === 1 && <div className="agenda__step-panel">

        <div className="agenda__section">
          <div className="agenda__section-head">
            <span className="agenda__step">1</span>
            <h2><label htmlFor="agenda-nombre">¿Cómo te llamas?</label></h2>
          </div>
          <div className="agenda__field">
            <User className="agenda__field-icon" size={18} strokeWidth={1.8} />
            <input
              id="agenda-nombre"
              name="nombre"
              type="text"
              autoComplete="name"
              required
              className="agenda__input"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
        </div>

        <div className="agenda__section">
          <div className="agenda__section-head">
            <span className="agenda__step">2</span>
            <h2 id="agenda-necesidades">¿Qué necesitas?</h2>
          </div>
          <GrupoOpciones
            tituloId="agenda-necesidades"
            opciones={necesidades}
            elegidas={necesidadIds}
            onElegir={toggleNecesidad}
          />
        </div>

        </div>}

        {paso === 2 && <div className="agenda__step-panel">
        <div className="agenda__section">
          <div className="agenda__section-head">
            <span className="agenda__step">3</span>
            <h2><label htmlFor="agenda-fecha">¿Qué día te gustaría venir?</label></h2>
          </div>
          <div className="agenda__field">
            <Calendar
              className="agenda__field-icon"
              size={18}
              strokeWidth={1.8}
            />
            <input
              id="agenda-fecha"
              name="fecha"
              type="date"
              required
              className="agenda__input"
              value={fecha}
              min={hoy}
              aria-invalid={fecha !== '' && !fechaValida}
              aria-describedby={fecha !== '' && !fechaValida ? 'agenda-fecha-error' : undefined}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
          {fecha !== '' && !fechaValida && (
            <p id="agenda-fecha-error" className="agenda__error" role="alert">Elige una fecha de hoy en adelante.</p>
          )}
        </div>

        <div className="agenda__section">
          <div className="agenda__section-head">
            <span className="agenda__step">4</span>
            <h2 id="agenda-horario">¿Qué horario prefieres?</h2>
          </div>
          <GrupoOpciones
            tituloId="agenda-horario"
            opciones={horarios}
            elegidas={horarioId ? [horarioId] : []}
            onElegir={setHorarioId}
          />
          <p className="agenda__schedule-note">
            <Clock size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>El horario que elijas es una preferencia. La hora exacta de tu cita la confirma el asesor por WhatsApp según la disponibilidad.</span>
          </p>
        </div>

        </div>}

        {paso === 3 && <div className="agenda__step-panel">
        <div className="agenda__summary">
          <h2>Revisa tu solicitud</h2>
          <dl>
            <div><dt>Nombre</dt><dd>{nombre.trim()}</dd></div>
            <div><dt>Necesitas</dt><dd>{necesidadesElegidas.map((necesidad) => necesidad.label).join(', ')}</dd></div>
            <div><dt>Fecha preferida</dt><dd>{formatLongDate(fecha)}</dd></div>
            <div><dt>Horario preferido</dt><dd>{horario?.label}</dd></div>
          </dl>
          <p>La fecha y el horario son preferencias. El equipo confirmará la disponibilidad por WhatsApp en {contacto.tiempoRespuesta}.</p>
        </div>

        <div className="agenda__section">
          <div className="agenda__section-head">
            <span className="agenda__step">5</span>
            <h2>
              <label htmlFor="agenda-nota">
                ¿Quieres contarnos algo más?{' '}
                <span className="agenda__optional">(opcional)</span>
              </label>
            </h2>
          </div>
          <textarea
            id="agenda-nota"
            name="nota"
            className="agenda__textarea"
            placeholder="Ej. Es mi primera consulta / necesito lentes de contacto."
            value={mensaje}
            maxLength={MAX_MENSAJE}
            onChange={(e) => setMensaje(e.target.value)}
          />
          <p className="agenda__counter">
            {mensaje.length}/{MAX_MENSAJE}
          </p>
        </div>

        </div>}

        <div className="agenda__navigation">
          {paso > 1 && (
            <button type="button" className="agenda__back" onClick={() => setPaso((actual) => actual - 1)}>Volver</button>
          )}
          {paso < 3 ? (
            <div className="agenda__next-wrap">
              {/* Botón de envío del formulario: el clic y la tecla Enter pasan por alEnviar. */}
              <button
                type="submit"
                className="agenda__submit"
                disabled={paso === 1 ? !puedeContinuarDatos : !puedeContinuarPreferencias}
              >
                Continuar
              </button>
              <p className="agenda__hint">
                {paso === 1 && !puedeContinuarDatos ? 'Escribe tu nombre y selecciona al menos una opción para continuar.' : ''}
                {paso === 2 && !puedeContinuarPreferencias ? 'Elige una fecha y un horario preferido para continuar.' : ''}
              </p>
            </div>
          ) : mensajeWhatsapp ? (
          <a
            className="agenda__submit"
            href={buildWhatsappUrl(contacto.whatsapp, mensajeWhatsapp)}
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
      </form>
    </section>
  )
}
