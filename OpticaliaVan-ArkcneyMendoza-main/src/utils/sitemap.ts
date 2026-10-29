import { useEffect, useState } from 'react'
import { asset } from './asset'

export interface EnlaceSitio {
  href: string
  label: string
  menu: boolean // también va en la barra superior
  seccion: boolean // lleva a una parte de otra página (con #)
}

// Lee el XML de navegación (public/navegacion.xml) con el parser nativo del
// navegador; es la contraparte en XML de cómo leemos los JSON en src/data/.
export function parseEnlacesSitio(xml: string): EnlaceSitio[] {
  const documento = new DOMParser().parseFromString(xml, 'application/xml')
  // DOMParser no lanza error si el XML está mal escrito: devuelve un <parsererror>.
  if (documento.querySelector('parsererror')) {
    throw new Error('navegacion.xml está mal formado')
  }

  return Array.from(documento.getElementsByTagName('enlace')).map((nodo) => {
    const href = nodo.getAttribute('href')
    const label = nodo.getAttribute('label')
    if (!href || !label) throw new Error('Cada <enlace> necesita los atributos href y label')
    return {
      href,
      label,
      menu: nodo.getAttribute('menu') === 'si',
      seccion: nodo.getAttribute('seccion') === 'si',
    }
  })
}

// Se pide una sola vez y lo comparten la barra y el pie de página.
let pedido: Promise<EnlaceSitio[]> | null = null

function cargarEnlaces(): Promise<EnlaceSitio[]> {
  pedido ??= fetch(asset('/navegacion.xml'))
    .then((respuesta) => {
      if (!respuesta.ok) throw new Error(`No se pudo leer navegacion.xml (${respuesta.status})`)
      return respuesta.text()
    })
    .then(parseEnlacesSitio)
  return pedido
}

export function useEnlacesSitio(): EnlaceSitio[] {
  const [enlaces, setEnlaces] = useState<EnlaceSitio[]>([])

  useEffect(() => {
    let activo = true
    cargarEnlaces()
      .then((lista) => { if (activo) setEnlaces(lista) })
      .catch((error: unknown) => {
        console.error(error)
        pedido = null // permite reintentar en la próxima página
      })
    return () => { activo = false }
  }, [])

  return enlaces
}
