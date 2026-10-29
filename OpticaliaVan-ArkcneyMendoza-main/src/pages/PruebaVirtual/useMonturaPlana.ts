import { useEffect, useRef, useState } from 'react'
import { asset } from '../../utils/asset'
import { recortarFondoClaro } from './recortarFondoClaro'

export type CargaMontura = 'cargando' | 'lista' | 'error'

// Carga la foto de una montura del catálogo y la deja lista (sin fondo) para
// dibujarla sobre la cara. El resultado se guarda junto a la imagen que lo
// produjo: al cambiar de montura vuelve a "cargando" sin tener que reiniciarlo.
export function useMonturaPlana(imagen: string | undefined) {
  const monturaRef = useRef<HTMLCanvasElement | null>(null)
  const [resultado, setResultado] = useState<{ imagen: string; estado: CargaMontura } | null>(null)

  useEffect(() => {
    monturaRef.current = null
    if (!imagen) return

    let cancelado = false
    const foto = new Image()
    foto.onload = () => {
      if (cancelado) return
      monturaRef.current = recortarFondoClaro(foto)
      setResultado({ imagen, estado: 'lista' })
    }
    foto.onerror = () => {
      if (!cancelado) setResultado({ imagen, estado: 'error' })
    }
    foto.src = asset(imagen)
    return () => { cancelado = true }
  }, [imagen])

  const estado: CargaMontura = resultado && resultado.imagen === imagen ? resultado.estado : 'cargando'
  return { monturaRef, estado }
}
