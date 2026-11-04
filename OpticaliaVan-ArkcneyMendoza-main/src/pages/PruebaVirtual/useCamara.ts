import { useEffect, useState, type RefObject } from 'react'

export type CamaraEstado = 'cargando' | 'activa' | 'error'
// Por qué no se pudo encender, para decirle a la persona qué hacer.
export type CamaraFallo = 'bloqueada' | 'ocupada' | 'sin-camara' | 'no-soportada'

// Traduce el error del navegador (getUserMedia) a un motivo entendible.
function motivoDelError(error: unknown): CamaraFallo {
  const nombre = (error as { name?: string } | null)?.name
  // Permiso negado por el navegador o por la privacidad de Windows/macOS.
  if (nombre === 'NotAllowedError' || nombre === 'SecurityError') return 'bloqueada'
  if (nombre === 'NotFoundError' || nombre === 'OverconstrainedError') return 'sin-camara'
  // Con permiso, pero otra aplicación o pestaña la está usando (Teams, Zoom…).
  return 'ocupada'
}

// Pide permiso para la cámara frontal y la conecta al <video>.
// Al salir de la página se apaga la cámara. "reintentar" vuelve a pedirla.
export function useCamara(videoRef: RefObject<HTMLVideoElement | null>) {
  const [estado, setEstado] = useState<CamaraEstado>('cargando')
  const [fallo, setFallo] = useState<CamaraFallo | null>(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelado = false

    async function iniciarCamara() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setFallo('no-soportada')
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
      } catch (error) {
        if (cancelado) return
        setFallo(motivoDelError(error))
        setEstado('error')
      }
    }

    iniciarCamara()
    return () => {
      cancelado = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [videoRef, intento])

  function reintentar() {
    setFallo(null)
    setEstado('cargando')
    setIntento((n) => n + 1)
  }

  return { estado, fallo, reintentar }
}
