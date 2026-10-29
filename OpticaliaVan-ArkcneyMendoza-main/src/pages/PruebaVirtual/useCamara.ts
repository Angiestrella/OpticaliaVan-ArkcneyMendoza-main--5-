import { useEffect, useState, type RefObject } from 'react'

export type CamaraEstado = 'cargando' | 'activa' | 'error'

// Pide permiso para la cámara frontal y la conecta al <video>.
// Al salir de la página se apaga la cámara.
export function useCamara(videoRef: RefObject<HTMLVideoElement | null>): CamaraEstado {
  const [estado, setEstado] = useState<CamaraEstado>('cargando')

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelado = false

    async function iniciarCamara() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setEstado('error')
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        })
        if (cancelado) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        if (videoRef.current) videoRef.current.srcObject = stream
        setEstado('activa')
      } catch {
        if (!cancelado) setEstado('error')
      }
    }

    iniciarCamara()
    return () => {
      cancelado = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [videoRef])

  return estado
}
