import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import frames from '../../data/frames.json'
import { formatPrice } from '../../utils/formatPrice'
import { asset } from '../../utils/asset'
import './PruebaVirtual.scss'

interface PruebaState {
  recomendadas?: string[]
  seleccionada?: string
}

type CamaraEstado = 'cargando' | 'activa' | 'error'
type SeguimientoEstado = 'cargando' | 'listo' | 'sin-rostro' | 'error'

const monturaReferencia = {
  id: 'montura-3d',
  name: 'Modelo 3D con patas',
  image: asset('/gafas/montura-referencia.png'),
  model: asset('/gafas/montura-3d.glb'),
}

function recortarFondoClaro(imagen: HTMLImageElement): HTMLCanvasElement {
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

export function PruebaVirtual() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state ?? null) as PruebaState | null

  // Con test: solo las monturas recomendadas. Sin test: el catálogo general.
  const catalogo = state?.recomendadas
    ? frames.filter((frame) => state.recomendadas?.includes(frame.id))
    : frames

  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(
    state?.seleccionada ?? null,
  )
  const [camara, setCamara] = useState<CamaraEstado>('cargando')
  const [seguimiento, setSeguimiento] = useState<SeguimientoEstado>('cargando')
  const [monturaLista, setMonturaLista] = useState(false)
  const [monturaError, setMonturaError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const overlay3dRef = useRef<HTMLCanvasElement>(null)
  const monturaRef = useRef<HTMLCanvasElement | null>(null)
  const escena3dRef = useRef<any>(null)
  const seleccionadaIdRef = useRef<string | null>(state?.seleccionada ?? null)

  function seleccionarMontura(id: string) {
    if (id !== seleccionadaIdRef.current) {
      setMonturaLista(false)
      setMonturaError(false)
      setSeguimiento('cargando')
    }
    seleccionadaIdRef.current = id
    setSeleccionadaId(id)
  }

  const seleccionada = frames.find((frame) => frame.id === seleccionadaId)
  const esMonturaReferencia = seleccionadaId === monturaReferencia.id
  const nombreMontura = seleccionada?.name ?? (esMonturaReferencia ? monturaReferencia.name : null)
  const imagenMontura = seleccionada?.colors[0]?.image

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelado = false

    async function iniciarCamara() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCamara('error')
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
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setCamara('activa')
      } catch {
        if (!cancelado) setCamara('error')
      }
    }

    iniciarCamara()

    // Al salir de la página se apaga la cámara.
    return () => {
      cancelado = true
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    monturaRef.current = null
    if (!imagenMontura) return

    let cancelado = false
    const imagen = new Image()
    imagen.onload = () => {
      if (cancelado) return
      monturaRef.current = recortarFondoClaro(imagen)
      setMonturaLista(true)
    }
    imagen.onerror = () => {
      if (!cancelado) {
        setMonturaLista(false)
        setMonturaError(true)
      }
    }
    imagen.src = asset(imagenMontura)
    return () => { cancelado = true }
  }, [imagenMontura])

  useEffect(() => {
    if (!esMonturaReferencia) return

    let cancelado = false
    let renderer: any = null
    let root: any = null
    const canvas = overlay3dRef.current

    async function cargarModelo() {
      try {
        const threeUrl = 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js'
        const loaderUrl = 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js'
        const THREE = await import(/* @vite-ignore */ threeUrl)
        const { GLTFLoader } = await import(/* @vite-ignore */ loaderUrl)
        if (!canvas || cancelado) return

        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
        renderer.setPixelRatio(1)
        renderer.setSize(640, 480, false)
        renderer.setClearColor(0x000000, 0)
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.15

        const scene = new THREE.Scene()
        scene.add(new THREE.HemisphereLight(0xffffff, 0x667080, 2.2))
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.4)
        keyLight.position.set(-1, 2, 4)
        scene.add(keyLight)
        const fillLight = new THREE.DirectionalLight(0xffffff, 1.2)
        fillLight.position.set(2, 0, -3)
        scene.add(fillLight)

        // La perspectiva hace que las patas se acorten al mirar de frente y
        // ganen longitud visible cuando la cabeza gira. La distancia equivale
        // a la proyección en píxeles del plano donde se ancla la montura.
        const camera = new THREE.PerspectiveCamera(45, 640 / 480, 0.1, 20000)
        camera.position.set(0, 0, 480 / (2 * Math.tan(45 * Math.PI / 360)))
        camera.lookAt(0, 0, 0)

        const loader = new GLTFLoader()
        const gltf = await loader.loadAsync(monturaReferencia.model)
        if (cancelado) {
          gltf.scene.traverse((obj: any) => {
            obj.geometry?.dispose()
            const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
            materials.forEach((material: any) => material?.dispose())
          })
          renderer.dispose()
          return
        }

        root = gltf.scene
        const patillas: { lado: 'izquierda' | 'derecha'; mesh: any }[] = []
        root.traverse((obj: any) => {
          if (obj.name.toLowerCase().includes('shadow')) obj.visible = false
          // Sin una malla de profundidad del rostro, las patas se ven a
          // través de los lentes y parecen cruzar los ojos. Se revelan al girar.
          if (obj.isMesh && /^(Temple_|Code_[LR]_GEO)/.test(obj.name) && !/Hinge|Screws/i.test(obj.name)) {
            obj.visible = false
            const lado = /(?:^|_)L(?:_|$)/.test(obj.name) ? 'izquierda' : 'derecha'
            patillas.push({ lado, mesh: obj })
          }
        })
        const bounds = new THREE.Box3().setFromObject(root)
        const size = bounds.getSize(new THREE.Vector3())
        // El origen del GLB está en mitad de las patas. Alineamos el centro
        // del frente (entre los lentes) con el centro de los ojos.
        root.position.sub(new THREE.Vector3(0, 0.02284, 0.06702))

        const group = new THREE.Group()
        group.add(root)
        group.rotation.order = 'ZYX'
        group.visible = false
        scene.add(group)
        escena3dRef.current = { renderer, scene, camera, group, modelWidth: size.x, patillas }
        renderer.render(scene, camera)
        setMonturaLista(true)
      } catch {
        if (!cancelado) {
          setMonturaLista(false)
          setMonturaError(true)
        }
      }
    }

    cargarModelo()
    return () => {
      cancelado = true
      if (root) {
        root.traverse((obj: any) => {
          obj.geometry?.dispose()
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
          materials.forEach((material: any) => {
            material?.dispose()
            Object.values(material ?? {}).forEach((value: any) => {
              if (value?.isTexture) value.dispose()
            })
          })
        })
      }
      renderer?.dispose()
      if (canvas) {
        canvas.width = 1
        canvas.height = 1
      }
      escena3dRef.current = null
    }
  }, [esMonturaReferencia])

  useEffect(() => {
    if (camara !== 'activa') return

    let cancelado = false
    let animationId = 0
    let ultimoAnalisis = 0
    let landmarker: {
      detectForVideo: (video: HTMLVideoElement, timestamp: number) => { faceLandmarks?: Array<Array<{ x: number; y: number }>> }
      close: () => void
    } | null = null

    async function iniciarSeguimiento() {
      try {
        const url = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/vision_bundle.mjs'
        const { FilesetResolver, FaceLandmarker } = await import(/* @vite-ignore */ url)
        const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm')
        landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task' },
          runningMode: 'VIDEO',
          numFaces: 1,
        })

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
            const resultado = landmarker?.detectForVideo(video, ahora)
            const puntos = resultado?.faceLandmarks?.[0]
            if (puntos && contexto) {
              const ojoIzquierdo = { x: (puntos[33].x + puntos[133].x) / 2 * canvas.width, y: (puntos[33].y + puntos[133].y) / 2 * canvas.height }
              const ojoDerecho = { x: (puntos[263].x + puntos[362].x) / 2 * canvas.width, y: (puntos[263].y + puntos[362].y) / 2 * canvas.height }
              const distanciaOjos = Math.hypot(ojoDerecho.x - ojoIzquierdo.x, ojoDerecho.y - ojoIzquierdo.y)
              const centroX = (ojoIzquierdo.x + ojoDerecho.x) / 2
              const centroY = (ojoIzquierdo.y + ojoDerecho.y) / 2
              const ancho = distanciaOjos * 2.3
              const angulo = Math.atan2(ojoDerecho.y - ojoIzquierdo.y, ojoDerecho.x - ojoIzquierdo.x)
              if (seleccionadaIdRef.current === monturaReferencia.id) {
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
                  modelo.patillas.forEach((patilla: any) => {
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
                  contexto?.save()
                  contexto?.translate(centroX, centroY)
                  contexto?.rotate(angulo)
                  contexto?.drawImage(montura, -ancho / 2, -alto / 2, ancho, alto)
                  contexto?.restore()
                }
              }
              setSeguimiento((estado) => estado === 'listo' ? estado : 'listo')
            } else {
              const modelo = escena3dRef.current
              if (seleccionadaIdRef.current === monturaReferencia.id && modelo) {
                modelo.group.visible = false
                modelo.renderer.render(modelo.scene, modelo.camera)
              }
              setSeguimiento((estado) => estado === 'sin-rostro' ? estado : 'sin-rostro')
            }
          }
          animationId = window.requestAnimationFrame(detectar)
        }
        animationId = window.requestAnimationFrame(detectar)
      } catch {
        if (!cancelado) setSeguimiento('error')
      }
    }

    iniciarSeguimiento()
    return () => {
      cancelado = true
      window.cancelAnimationFrame(animationId)
      landmarker?.close()
    }
  }, [camara])

  return (
    <section className="camara">
      <aside className="camara__catalogo">
        {/* Con una montura elegida vuelve a su página; sin ninguna, un paso atrás. */}
        {seleccionada ? (
          <Link className="camara__back" to={`/producto/${seleccionada.id}`}>
            &lt; Volver a {seleccionada.name}
          </Link>
        ) : esMonturaReferencia ? (
          <button type="button" className="camara__back" onClick={() => navigate('/catalogo')}>
            &lt; Volver al catálogo
          </button>
        ) : (
          <button
            type="button"
            className="camara__back"
            onClick={() => navigate(-1)}
          >
            &lt; Volver
          </button>
        )}

        <h1>{state?.recomendadas ? 'Recomendadas para ti' : 'Catálogo'}</h1>
        <p className="camara__catalogo-hint">
          {state?.recomendadas
            ? 'Según el test que hiciste.'
            : 'Elige una montura para probártela.'}
        </p>

        <div className="camara__lista">
            <button
              type="button"
              aria-pressed={esMonturaReferencia}
              className={`camara__item ${esMonturaReferencia ? 'camara__item--selected' : ''}`}
              onClick={() => seleccionarMontura(monturaReferencia.id)}
            >
              <span className="camara__item-photo">
                <img src={monturaReferencia.image} alt="" />
              </span>
              <span className="camara__item-name">{monturaReferencia.name}</span>
              <span className="camara__item-price">Modelo 3D</span>
            </button>
          {catalogo.map((frame) => (
            <button
              key={frame.id}
              type="button"
              aria-pressed={frame.id === seleccionadaId}
              className={`camara__item ${frame.id === seleccionadaId ? 'camara__item--selected' : ''}`}
              onClick={() => seleccionarMontura(frame.id)}
            >
              <span className="camara__item-photo">
                <img src={asset(frame.colors[0].image)} alt="" />
              </span>
              <span className="camara__item-name">{frame.name}</span>
              <span className="camara__item-price">
                Desde {formatPrice(frame.price)}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <div className="camara__stage">
        <video
          ref={videoRef}
          className={`camara__video ${camara === 'activa' ? 'camara__video--activa' : ''}`}
          autoPlay
          playsInline
          muted
        />
        <canvas ref={overlayRef} className="camara__overlay" aria-hidden="true" />
        <canvas ref={overlay3dRef} className="camara__overlay camara__overlay--three" aria-hidden="true" />

        {camara === 'cargando' && (
          <p className="camara__status">Activando la cámara…</p>
        )}
        {camara === 'error' && (
          <p className="camara__status">
            No pudimos activar la cámara. Revisa los permisos del navegador y
            vuelve a intentarlo — mientras tanto puedes ver el catálogo.
          </p>
        )}

        {camara === 'activa' && (
          <p className="camara__note">
            {!nombreMontura
              ? 'Elige una montura del catálogo para verla puesta.'
              : monturaError
                ? 'No pudimos cargar la montura. Revisa tu conexión y vuelve a seleccionarla.'
              : !monturaLista
                ? 'Preparando la imagen de la montura…'
                : seguimiento === 'cargando'
                  ? 'Iniciando el seguimiento del rostro…'
                  : seguimiento === 'sin-rostro'
                    ? 'Centra tu rostro frente a la cámara para ajustar las gafas.'
                    : seguimiento === 'error'
                      ? 'No pudimos iniciar el seguimiento. Revisa tu conexión y vuelve a intentarlo.'
                      : `${nombreMontura} está sobrepuesta a tu rostro. Mueve suavemente la cabeza para probar el ajuste.`}
            {seleccionada && seguimiento === 'listo' && <small>Vista de referencia; el ajuste puede variar según la cámara y la posición.</small>}
          </p>
        )}
      </div>
    </section>
  )
}
