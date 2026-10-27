import { MessageCircle } from 'lucide-react'
import contact from '../../data/contact.json'
import { buildWhatsappUrl } from '../../utils/whatsapp'
import './WhatsAppFloat.scss'

export function WhatsAppFloat() {
  const whatsappUrl = buildWhatsappUrl(contact.whatsapp, 'Hola, quiero recibir información sobre sus gafas.')

  return (
    <a
      className="whatsapp-float"
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      title="Escríbenos por WhatsApp"
    >
      <span className="whatsapp-float__icon" aria-hidden="true"><MessageCircle size={25} strokeWidth={2.2} /></span>
      <span className="whatsapp-float__label">¿Necesitas ayuda? <strong>Escríbenos</strong></span>
    </a>
  )
}
