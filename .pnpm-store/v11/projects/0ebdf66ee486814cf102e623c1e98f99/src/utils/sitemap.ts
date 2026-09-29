export interface EnlaceSitio {
  href: string
  label: string
}

// Lee el XML de navegación (public/navegacion.xml) con el parser nativo del
// navegador -- es la contraparte en XML de cómo leemos los JSON en src/data/.
export function parseEnlacesSitio(xml: string): EnlaceSitio[] {
  const documento = new DOMParser().parseFromString(xml, 'application/xml')
  const nodos = Array.from(documento.getElementsByTagName('enlace'))

  return nodos.map((nodo) => ({
    href: nodo.getAttribute('href') ?? '',
    label: nodo.getAttribute('label') ?? '',
  }))
}
