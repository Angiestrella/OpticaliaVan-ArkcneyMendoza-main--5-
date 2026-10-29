import type { FaceLandmarker } from '@mediapipe/tasks-vision'

// MediaPipe (librería instalada: @mediapipe/tasks-vision) detecta los puntos
// del rostro. Lo usan el probador (video en vivo) y la ayuda con foto.
// Los archivos .wasm y el modelo se descargan aparte; la versión de los .wasm
// debe ser la misma que la instalada en package.json.
const URL_WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm'
const URL_MODELO = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

export type DetectorRostro = FaceLandmarker

export async function crearDetectorRostro(modo: 'IMAGE' | 'VIDEO', rostros: number): Promise<DetectorRostro> {
  // import() dinámico: Vite deja la librería en un archivo aparte que solo se
  // descarga cuando se necesita (no hace más lenta la carga de la página).
  const { FilesetResolver, FaceLandmarker } = await import('@mediapipe/tasks-vision')
  const vision = await FilesetResolver.forVisionTasks(URL_WASM)
  return FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: URL_MODELO },
    runningMode: modo,
    numFaces: rostros,
  })
}
