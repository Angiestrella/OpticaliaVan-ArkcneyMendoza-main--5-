// Las fotos de las monturas tienen fondo blanco. Para ponerlas sobre la cara
// se vuelve transparente ese fondo y se recorta el espacio vacío alrededor.
export function recortarFondoClaro(imagen: HTMLImageElement): HTMLCanvasElement {
  const origen = document.createElement('canvas')
  origen.width = imagen.naturalWidth
  origen.height = imagen.naturalHeight
  const contexto = origen.getContext('2d', { willReadFrequently: true })
  if (!contexto) return origen
  contexto.drawImage(imagen, 0, 0)

  const datos = contexto.getImageData(0, 0, origen.width, origen.height)
  const pixeles = datos.data
  let minX = origen.width
  let minY = origen.height
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < origen.height; y += 1) {
    for (let x = 0; x < origen.width; x += 1) {
      const i = (y * origen.width + x) * 4
      const r = pixeles[i]
      const g = pixeles[i + 1]
      const b = pixeles[i + 2]
      const minimo = Math.min(r, g, b)
      const maximo = Math.max(r, g, b)
      if (minimo > 215 && maximo - minimo < 34) {
        pixeles[i + 3] = Math.min(pixeles[i + 3], Math.max(0, Math.min(255, (246 - minimo) * 12)))
      }
      if (pixeles[i + 3] > 24) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }
  contexto.putImageData(datos, 0, 0)

  if (maxX <= minX || maxY <= minY) return origen
  const padding = 6
  const x = Math.max(0, minX - padding)
  const y = Math.max(0, minY - padding)
  const ancho = Math.min(origen.width - x, maxX - minX + padding * 2)
  const alto = Math.min(origen.height - y, maxY - minY + padding * 2)
  const recorte = document.createElement('canvas')
  recorte.width = ancho
  recorte.height = alto
  recorte.getContext('2d')?.drawImage(origen, x, y, ancho, alto, 0, 0, ancho, alto)
  return recorte
}
