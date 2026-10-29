import { useEffect, useRef, useState, type RefObject } from 'react'
import { crearDetectorRostro, type DetectorRostro } from '../../utils/detectorRostro'
import type { Escena3D } from './useModelo3D'

export type SeguimientoEstado = 'cargando' | 'listo' | 'sin-rostro' | 'error'

interface Opciones {
  activo: boolean // la cámara ya está encendida
  usar3d: boolean // true = modelo 3D; false = foto de una montura del catálogo
  videoRef: RefObject<HTMLVideoElement | null>
  overlayRef: RefObject<HTMLCanvasElement | null>
  overlay3dRef: RefObject<HTMLCanvasElement | null>
  monturaRef: RefObject<HTMLCanvasElement | null>
  escena3dRef: RefObject<Escena3D | null>
}

// Busca la cara en cada cuadro del video (MediaPipe) y pone encima la montura:
// la foto sin fondo en el canvas 2D, o el modelo 3D girando con la cabeza.
export function useSeguimientoRostro({
  activo, usar3d, videoRef, overlayRef, overlay3dRef, monturaRef, escena3dRef,
}: Opciones): SeguimientoEstado {
  const [estado, setEstado] = useState<SeguimientoEstado>('cargando')
  // El ciclo de dibujo corre fuera de React: lee el modo actual desde una ref.
  const usar3dRef = useRef(usar3d)
  useEffect(() => { usar3dRef.current = usar3d }, [usar3d])

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
          const canvas = overlayRef.current
          if (video && canvas && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && ahora - ultimoAnalisis > 35) {
            ultimoAnalisis = ahora
            if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
            }
            const contexto = canvas.getContext('2d')
            contexto?.clearRect(0, 0, canvas.width, canvas.height)
            const resultado = detector?.detectForVideo(video, ahora)
            const puntos = resultado?.faceLandmarks?.[0]
            if (puntos && contexto) {
              // Centro de cada ojo (puntos 33/133 y 263/362 de MediaPipe).
              const ojoIzquierdo = { x: (puntos[33].x + puntos[133].x) / 2 * canvas.width, y: (puntos[33].y + puntos[133].y) / 2 * canvas.height }
              const ojoDerecho = { x: (puntos[263].x + puntos[362].x) / 2 * canvas.width, y: (puntos[263].y + puntos[362].y) / 2 * canvas.height }
              const distanciaOjos = Math.hypot(ojoDerecho.x - ojoIzquierdo.x, ojoDerecho.y - ojoIzquierdo.y)
              const centroX = (ojoIzquierdo.x + ojoDerecho.x) / 2
              const centroY = (ojoIzquierdo.y + ojoDerecho.y) / 2
              const ancho = distanciaOjos * 2.3
              const angulo = Math.atan2(ojoDerecho.y - ojoIzquierdo.y, ojoDerecho.x - ojoIzquierdo.x)
              if (usar3dRef.current) {
                const modelo = escena3dRef.current
                const canvas3d = overlay3dRef.current
                if (modelo && canvas3d && distanciaOjos > 0) {
                  if (canvas3d.width !== canvas.width || canvas3d.height !== canvas.height) {
                    modelo.renderer.setSize(canvas.width, canvas.height, false)
                    modelo.camera.aspect = canvas.width / canvas.height
                    modelo.camera.position.z = canvas.height / (2 * Math.tan(modelo.camera.fov * Math.PI / 360))
                    modelo.camera.updateProjectionMatrix()
                  }
                  const nariz = puntos[1]
                  const desplazamientoNariz = nariz ? nariz.x * canvas.width - centroX : 0
                  // Permitir giros más amplios para que el frente no quede
                  // casi de cara mientras el rostro ya está de perfil.
                  const yaw = Math.max(-1.1, Math.min(1.1, (desplazamientoNariz / distanciaOjos) * 1.8))
                  // Las ocultamos de frente: el navegador no conoce la
                  // profundidad de la piel y las dibujaría sobre los ojos.
                  const ladoVisible = Math.abs(yaw) > 0.35
                    ? (yaw > 0 ? 'derecha' : 'izquierda')
                    : null
                  modelo.patillas.forEach((patilla) => {
                    patilla.mesh.visible = patilla.lado === ladoVisible
                  })
                  modelo.group.visible = true
                  modelo.group.position.set(centroX - canvas.width / 2, canvas.height / 2 - centroY, 0)
                  modelo.group.scale.setScalar(ancho / modelo.modelWidth)
                  // El frente del GLB está en +Z y las patas se extienden por
                  // -Z. Mantener esa orientación las deja detrás de los lentes.
                  modelo.group.rotation.y = yaw
                  modelo.group.rotation.z = -angulo
                  modelo.renderer.render(modelo.scene, modelo.camera)
                }
              } else {
                const montura = monturaRef.current
                if (montura && distanciaOjos > 0) {
                  const alto = ancho * (montura.height / montura.width)
                  contexto.save()
                  contexto.translate(centroX, centroY)
                  contexto.rotate(angulo)
                  contexto.drawImage(montura, -ancho / 2, -alto / 2, ancho, alto)
                  contexto.restore()
                }
              }
              setEstado((actual) => actual === 'listo' ? actual : 'listo')
            } else {
              const modelo = escena3dRef.current
              if (usar3dRef.current && modelo) {
                modelo.group.visible = false
                modelo.renderer.render(modelo.scene, modelo.camera)
              }
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
  }, [activo, videoRef, overlayRef, overlay3dRef, monturaRef, escena3dRef])

  return estado
}
