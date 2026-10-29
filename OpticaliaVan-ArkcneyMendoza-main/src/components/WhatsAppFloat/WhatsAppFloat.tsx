import { MessageCircle } from 'lucide-react'
import { contacto } from '../../data'
import { buildWhatsappUrl } from '../../utils/whatsapp'
import './WhatsAppFloat.scss'

export function WhatsAppFloat() {
  const whatsappUrl = buildWhatsappUrl(contacto.whatsapp, 'Hola, quiero recibir información sobre sus gafas.')

  // <aside>: es ayuda aparte del contenido principal; así el botón queda
  // dentro de una zona de la página que el lector de pantalla puede nombrar.
  return (
    <aside aria-label="Ayuda por WhatsApp">
      <a
        className="whatsapp-float"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        // El nombre que lee el lector de pantalla empieza con el texto que se ve.
        aria-label="¿Necesitas ayuda? Escríbenos por WhatsApp"
        title="Escríbenos por WhatsApp"
      >
        <span className="whatsapp-float__icon" aria-hidden="true"><MessageCircle size={25} strokeWidth={2.2} /></span>
        <span className="whatsapp-float__label">¿Necesitas ayuda? <strong>Escríbenos</strong></span>
      </a>
    </aside>
  )
}
