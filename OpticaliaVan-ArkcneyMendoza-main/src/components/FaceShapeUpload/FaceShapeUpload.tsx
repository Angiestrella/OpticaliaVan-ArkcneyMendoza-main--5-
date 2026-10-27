import { useEffect, useState } from 'react'
import { asset } from '../../utils/asset'
import './FaceShapeUpload.scss'

type FaceShape = 'redondo' | 'ovalado' | 'rectangular' | 'diamante' | 'corazon' | 'triangular'

const labels: Record<FaceShape, string> = {
  redondo: 'Redondo', ovalado: 'Ovalado',
  rectangular: 'Rectangular', diamante: 'Diamante', corazon: 'Corazón', triangular: 'Triangular',
}

function distancia(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

type Landmark = { x: number; y: number }
type FaceDetector = {
  detect: (image: ImageBitmap) => { faceLandmarks?: Landmark[][] }
  close: () => void
}
type PerfilRostro = { forma: FaceShape; medidas: number[] }

const imagenesReferencia: Array<{ forma: FaceShape; src: string }> = [
  { forma: 'diamante', src: '/Retrato%20minimalista%20de%20rostro%20diamante%20(1).png' },
  { forma: 'redondo', src: '/Retrato%20masculino%20con%20c%C3%ADrculo%20azul.png' },
  { forma: 'rectangular', src: '/rostro_rectangular_mujer_transparente.png' },
  { forma: 'ovalado', src: '/Retrato%20de%20rostro%20ovalado%20con%20contorno%20azul.png' },
  { forma: 'corazon', src: '/Retrato%20con%20contorno%20facial%20de%20coraz%C3%B3n.png' },
  { forma: 'triangular', src: '/Retrato%20con%20tri%C3%A1ngulo%20facial%20azul.png' },
]

function medir(p: Landmark[]): number[] {
  const largo = distancia(p[10], p[152])
  const pomulos = distancia(p[234], p[454])
  const frente = distancia(p[127], p[356])
  const mandibula = distancia(p[172], p[397])
  return [largo / pomulos, frente / pomulos, mandibula / pomulos]
}

let perfilesReferencia: Promise<PerfilRostro[]> | null = null

function cargarPerfilesReferencia(detector: FaceDetector) {
  if (!perfilesReferencia) {
    perfilesReferencia = Promise.all(imagenesReferencia.map(async ({ forma, src }) => {
      const response = await fetch(asset(src))
      if (!response.ok) return null
      const bitmap = await createImageBitmap(await response.blob())
      try {
        const landmarks = detector.detect(bitmap).faceLandmarks?.[0]
        return landmarks ? { forma, medidas: medir(landmarks) } : null
      } finally {
        bitmap.close()
      }
    })).then((perfiles) => perfiles.filter((perfil): perfil is PerfilRostro => perfil !== null))
  }
  return perfilesReferencia
}

async function clasificar(p: Landmark[], detector: FaceDetector): Promise<FaceShape> {
  const medidas = medir(p)
  // Clasifica comparando las proporciones con los retratos de referencia.
  const perfiles = await cargarPerfilesReferencia(detector)
  if (!perfiles.length) throw new Error('No se pudieron cargar las referencias de rostro.')
  const escalas = [0.22, 0.16, 0.18]
  const perfilCercano = perfiles.reduce((mejor, actual) => {
    const distanciaActual = Math.hypot(...actual.medidas.map((valor, i) => (valor - medidas[i]) / escalas[i]))
    const distanciaMejor = Math.hypot(...mejor.medidas.map((valor, i) => (valor - medidas[i]) / escalas[i]))
    return distanciaActual < distanciaMejor ? actual : mejor
  })
  return perfilCercano.forma
}

export function FaceShapeUpload({ onSelect, onManual }: { onSelect: (shape: FaceShape) => void; onManual: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [shape, setShape] = useState<FaceShape | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!file) { setPreview(null); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  async function analizar() {
    if (!file) return
    setLoading(true); setError(''); setShape(null)
    let bitmap: ImageBitmap | null = null
    let landmarker: FaceDetector | null = null
    try {
      bitmap = await createImageBitmap(file)
      const url = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/vision_bundle.mjs'
      const { FilesetResolver, FaceLandmarker } = await import(/* @vite-ignore */ url)
      const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm')
      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task' },
        runningMode: 'IMAGE', numFaces: 2,
      })
      landmarker = faceLandmarker
      const result = faceLandmarker.detect(bitmap)
      if (!result.faceLandmarks?.length) setError('No encontramos un rostro. Prueba con una foto frontal, bien iluminada y sin gafas oscuras.')
      else if (result.faceLandmarks.length > 1) setError('La foto muestra más de un rostro. Sube una imagen donde aparezcas solo tú.')
      else setShape(await clasificar(result.faceLandmarks[0], faceLandmarker))
    } catch {
      setError('No pudimos analizar la foto. Revisa tu conexión e inténtalo de nuevo, o elige la forma manualmente.')
    } finally {
      landmarker?.close(); bitmap?.close(); setLoading(false)
    }
  }

  return <div className="face-upload">
    <h1>Identifica tu tipo de rostro con una foto</h1>
    <p className="test-gafas__hint">Sube una foto frontal, con buena luz y sin otras personas. Comparamos las proporciones de tu rostro con los retratos de referencia. La foto se analiza en este dispositivo y no se guarda.</p>
    <label className="face-upload__picker"><span>{file ? 'Cambiar foto' : 'Elegir una foto'}</span>
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
        const selected = event.target.files?.[0] ?? null
        if (selected && selected.size > 10 * 1024 * 1024) { setError('La foto debe pesar menos de 10 MB.'); event.currentTarget.value = ''; return }
        setFile(selected); setShape(null); setError('')
      }} />
    </label>
    {preview && <img className="face-upload__preview" src={preview} alt="Vista previa de tu foto" />}
    {file && <button type="button" className="test-gafas__next" onClick={analizar} disabled={loading}>{loading ? 'Analizando foto…' : 'Identificar mi rostro'}</button>}
    {error && <p className="face-upload__error" role="alert">{error}</p>}
    {shape && <div className="face-upload__result" role="status"><p>Por las proporciones medidas, tu rostro parece ser <strong>{labels[shape]}</strong>.</p><small>Es una estimación: la pose, el cabello y la iluminación pueden influir. Puedes elegir otra forma manualmente.</small><button type="button" className="test-gafas__next" onClick={() => onSelect(shape)}>Continuar con esta forma</button></div>}
    <button type="button" className="test-gafas__restart face-upload__manual" onClick={onManual}>Prefiero elegir mi rostro manualmente</button>
  </div>
}
