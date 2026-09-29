// Sin número configurado, wa.me abre WhatsApp para que la persona elija a quién enviarlo.
export function buildWhatsappUrl(number: string, text: string): string {
  const base = number ? `https://wa.me/${number}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(text)}`
}
