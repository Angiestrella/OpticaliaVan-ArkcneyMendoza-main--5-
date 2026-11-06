import { useEffect, useState, type RefObject } from 'react'
import { crearDetectorRostro, type DetectorRostro } from '../../utils/detectorRostro'
import type { Escena3D } from './useModelo3D'

export type SeguimientoEstado = 'cargando' | 'listo' | 'sin-rostro' | 'error'

interface Opciones {
  activo: boolean // la cámara ya está encendida
  videoRef: RefObject<HTMLVideoElement | null>
  escena3dRef: RefObject<Escena3D | null>
}

// Busca la cara en cada cuadro del video (MediaPipe) y le pone encima el
// modelo 3D de la montura, que gira con la cabeza.
export function useSeguimientoRostro({ activo, videoRef, escena3dRef }: Opciones): SeguimientoEstado {
  const [estado, setEstado] = useState<SeguimientoEstado>('cargando')

  useEffect(() => {
    if (!activo) return

    let cancelado = false
    let animationId = 0
    let ultimoAnalisis = 0
    let detector: DetectorRostro | null = null

    async function iniciarSeguimiento() {
      try {
        detector = await crearDetectorRostro('VIDEO', 1)
        if (cancelado) {
          detector.close()
          return
        }

        const detectar = (ahora: number) => {
          if (cancelado) return
          const video = videoRef.current
          if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && ahora - ultimoAnalisis > 35) {
            ultimoAnalisis = ahora
            const ancho = video.videoWidth
            const alto = video.videoHeight
            const resultado = detector?.detectForVideo(video, ahora)
            const puntos = resultado?.faceLandmarks?.[0]
            // Orientación de la cabeza (a los lados, arriba/abajo e inclinada).
            const rotacion = resultado?.facialTransformationMatrixes?.[0]?.data
            if (puntos && rotacion) {
              // Centro de cada ojo (puntos 33/133 y 263/362 de MediaPipe).
              const ojoIzquierdo = { x: (puntos[33].x + puntos[133].x) / 2 * ancho, y: (puntos[33].y + puntos[133].y) / 2 * alto }
              const ojoDerecho = { x: (puntos[263].x + puntos[362].x) / 2 * ancho, y: (puntos[263].y + puntos[362].y) / 2 * alto }
              // Ancho del rostro: los dos lados de la cara (puntos 234 y 454). Con la
              // profundidad (z) no se acorta al girar la cabeza.
              const anchoRostro = Math.hypot(
                (puntos[454].x - puntos[234].x) * ancho,
                (puntos[454].y - puntos[234].y) * alto,
                (puntos[454].z - puntos[234].z) * ancho,
              )
              const x = (ojoIzquierdo.x + ojoDerecho.x) / 2
              const y = (ojoIzquierdo.y + ojoDerecho.y) / 2
              if (anchoRostro > 0) escena3dRef.current?.dibujar({ x, y, anchoRostro, rotacion }, ancho, alto)
              setEstado((actual) => actual === 'listo' ? actual : 'listo')
            } else {
              escena3dRef.current?.dibujar(null, ancho, alto)
              setEstado((actual) => actual === 'sin-rostro' ? actual : 'sin-rostro')
            }
          }
          animationId = window.requestAnimationFrame(detectar)
        }
        animationId = window.requestAnimationFrame(detectar)
      } catch {
        if (!cancelado) setEstado('error')
      }
    }

    iniciarSeguimiento()
    return () => {
      cancelado = true
      window.cancelAnimationFrame(animationId)
      detector?.close()
    }
  }, [activo, videoRef, escena3dRef])

  return estado
}
