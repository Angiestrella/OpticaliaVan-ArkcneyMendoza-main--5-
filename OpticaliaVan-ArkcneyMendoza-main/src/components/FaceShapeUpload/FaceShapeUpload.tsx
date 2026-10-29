import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { asset } from '../../utils/asset'
import { crearDetectorRostro, type DetectorRostro } from '../../utils/detectorRostro'
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

function cargarPerfilesReferencia(detector: DetectorRostro) {
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
    }))
      .then((perfiles) => perfiles.filter((perfil): perfil is PerfilRostro => perfil !== null))
      .catch((error: unknown) => {
        // Si falla (por ejemplo, sin internet), se olvida: el próximo intento vuelve a cargar.
        perfilesReferencia = null
        throw error
      })
  }
  return perfilesReferencia
}

async function clasificar(p: Landmark[], detector: DetectorRostro): Promise<FaceShape> {
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
  const previewRef = useRef<string | null>(null)

  // La vista previa se crea al elegir la foto (en el evento, no en un efecto)
  // y la URL temporal anterior se libera para no gastar memoria.
  function elegirFoto(archivo: File | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = archivo ? URL.createObjectURL(archivo) : null
    setFile(archivo)
    setPreview(previewRef.current)
  }

  // Al salir de esta pantalla también se libera la última vista previa.
  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
  }, [])

  async function analizar() {
    if (!file) return
    setLoading(true)
    setError('')
    setShape(null)
    let bitmap: ImageBitmap | null = null
    let detector: DetectorRostro | null = null
    try {
      bitmap = await createImageBitmap(file)
      // Hasta 2 rostros: así se puede avisar si en la foto aparece más de una persona.
      detector = await crearDetectorRostro('IMAGE', 2)
      const result = detector.detect(bitmap)
      if (!result.faceLandmarks?.length) setError('No encontramos un rostro. Prueba con una foto frontal, bien iluminada y sin gafas oscuras.')
      else if (result.faceLandmarks.length > 1) setError('La foto muestra más de un rostro. Sube una imagen donde aparezcas solo tú.')
      else setShape(await clasificar(result.faceLandmarks[0], detector))
    } catch {
      setError('No pudimos analizar la foto. Revisa tu conexión e inténtalo de nuevo, o elige la forma manualmente.')
    } finally {
      detector?.close()
      bitmap?.close()
      setLoading(false)
    }
  }

  function alElegirArchivo(event: ChangeEvent<HTMLInputElement>) {
    const elegido = event.target.files?.[0] ?? null
    if (elegido && elegido.size > 10 * 1024 * 1024) {
      setError('La foto debe pesar menos de 10 MB.')
      event.currentTarget.value = ''
      return
    }
    elegirFoto(elegido)
    setShape(null)
    setError('')
  }

  return (
    <div className="face-upload">
      <h1>Identifica tu tipo de rostro con una foto</h1>
      <p className="test-gafas__hint">
        Sube una foto frontal, con buena luz y sin otras personas. Comparamos las proporciones de tu rostro
        con los retratos de referencia. La foto se analiza en este dispositivo y no se guarda.
      </p>

      <label className="face-upload__picker">
        <span>{file ? 'Cambiar foto' : 'Elegir una foto'}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={alElegirArchivo} />
      </label>

      {preview && <img className="face-upload__preview" src={preview} alt="Vista previa de tu foto" />}
      {file && (
        <button type="button" className="test-gafas__next" onClick={analizar} disabled={loading}>
          {loading ? 'Analizando foto…' : 'Identificar mi rostro'}
        </button>
      )}
      {error && <p className="face-upload__error" role="alert">{error}</p>}

      {shape && (
        <div className="face-upload__result">
          {/* <output>: resultado que el lector de pantalla anuncia apenas aparece. */}
          <output>Por las proporciones medidas, tu rostro parece ser <strong>{labels[shape]}</strong>.</output>
          <small>Es una estimación: la pose, el cabello y la iluminación pueden influir. Puedes elegir otra forma manualmente.</small>
          <button type="button" className="test-gafas__next" onClick={() => onSelect(shape)}>
            Continuar con esta forma
          </button>
        </div>
      )}

      <button type="button" className="test-gafas__restart face-upload__manual" onClick={onManual}>
        Prefiero elegir mi rostro manualmente
      </button>
    </div>
  )
}
