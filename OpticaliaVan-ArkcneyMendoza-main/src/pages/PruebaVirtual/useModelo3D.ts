import { useEffect, useRef, useState, type RefObject } from 'react'
import type { Mesh, MeshPhysicalMaterial, Object3D, Texture, WebGLRenderer } from 'three'
import type { Modelo3D } from './modelos3d'

export type CargaMontura = 'cargando' | 'lista' | 'error'

// Dónde está la cabeza en un cuadro del video (lo calcula useSeguimientoRostro).
export interface PoseCabeza {
  x: number // centro entre los ojos, en píxeles del video
  y: number
  distanciaOjos: number // tal como se ve en el video (se acorta al girar)
  rotacion: number[] // orientación de la cabeza: matriz 4×4 de MediaPipe
}

export interface Escena3D {
  // Dibuja las gafas sobre la cabeza; con pose = null las oculta (no hay rostro).
  dibujar: (pose: PoseCabeza | null, ancho: number, alto: number) => void
}

// El modelo ocupa 2,3 veces la distancia entre los ojos (con escala 1, ver modelos3d.ts).
const ANCHO_POR_DISTANCIA_OJOS = 2.3
// Distancia promedio entre pupilas de un adulto, en metros. Con ella, un modelo
// hecho en metros se dibuja a su tamaño real sobre cualquier rostro.
const DISTANCIA_OJOS_PROMEDIO = 0.063
// Cuánto se acerca a la posición nueva en cada cuadro (1 = de golpe). Menos
// tiembla menos pero se queda atrás al moverse rápido.
const SUAVIZADO = 0.5

// Libera de la memoria de la tarjeta gráfica las mallas, materiales y texturas del modelo.
function liberarModelo(raiz: Object3D) {
  raiz.traverse((obj) => {
    const mesh = obj as Mesh
    if (!mesh.isMesh) return
    mesh.geometry?.dispose()
    const materiales = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    materiales.forEach((material) => {
      material?.dispose()
      Object.values(material ?? {}).forEach((valor) => {
        if ((valor as Texture | null)?.isTexture) (valor as Texture).dispose()
      })
    })
  })
}

// Carga el modelo 3D (.glb) con three.js (librería instalada: three) y prepara
// la escena sobre el <canvas>. Con modelo = null no carga nada y libera lo anterior.
export function useModelo3D(modelo: Modelo3D | null, canvasRef: RefObject<HTMLCanvasElement | null>) {
  const escenaRef = useRef<Escena3D | null>(null)
  const [estado, setEstado] = useState<CargaMontura>('cargando')

  useEffect(() => {
    if (!modelo) return

    let cancelado = false
    let renderer: WebGLRenderer | null = null
    let contenido: Object3D | null = null
    let reflejos: Texture | null = null
    const canvas = canvasRef.current

    const { model, centro, escala } = modelo

    async function cargarModelo() {
      try {
        // import() dinámico: three.js queda en un archivo aparte que solo se
        // descarga cuando alguien elige el modelo 3D.
        const [THREE, { GLTFLoader }, { RoomEnvironment }, { RoundedBoxGeometry }] = await Promise.all([
          import('three'),
          import('three/examples/jsm/loaders/GLTFLoader.js'),
          import('three/examples/jsm/environments/RoomEnvironment.js'),
          import('three/examples/jsm/geometries/RoundedBoxGeometry.js'),
        ])
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

        const gltf = await new GLTFLoader().loadAsync(model)
        if (cancelado) {
          liberarModelo(gltf.scene)
          renderer.dispose()
          return
        }

        const root = gltf.scene
        // El metal se ve del color de lo que refleja: sin nada alrededor queda
        // casi café. Una habitación virtual le da el brillo dorado o plateado real.
        const pmrem = new THREE.PMREMGenerator(renderer)
        reflejos = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
        pmrem.dispose()
        root.traverse((obj) => {
          if (obj.name.toLowerCase().includes('shadow')) obj.visible = false
          const mesh = obj as Mesh
          if (!mesh.isMesh) return
          // La transmisión (vidrio) toma lo que hay detrás dentro del canvas,
          // que es transparente: se vería negra. Se cambia por transparencia,
          // sin volver más opaco lo que el modelo ya trae casi invisible (lentes).
          const materiales = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
          materiales.forEach((material) => {
            const vidrio = material as MeshPhysicalMaterial
            if (vidrio.metalness > 0.5) vidrio.envMap = reflejos
            if (!vidrio.transmission) return
            vidrio.transparent = true
            // Vidrio del todo transparente y sin textura (lentes, plaquetas de
            // silicona): casi invisible, como un lente real. El acetato de color
            // o con degradado (textura) conserva su color, solo translúcido.
            const transparenteDelTodo = vidrio.transmission >= 0.99 && !vidrio.map
            vidrio.opacity = Math.min(vidrio.opacity, transparenteDelTodo ? 0.1 : 1 - vidrio.transmission * 0.6)
            vidrio.transmission = 0
          })
        })
        const bounds = new THREE.Box3().setFromObject(root)
        const size = bounds.getSize(new THREE.Vector3())
        // Alineamos el centro del frente (entre los lentes) con el centro de los ojos.
        root.position.sub(new THREE.Vector3(...centro))

        const group = new THREE.Group()
        group.add(root)

        // Cabeza invisible: no se dibuja, pero tapa lo que queda detrás de ella.
        // Así, al girar, la pata del lado de la cámara se ve por fuera de la
        // mejilla y la del otro lado queda oculta tras la cara, como en la vida
        // real (y de frente las patas no se ven cruzando los ojos). Medidas en
        // metros, como los modelos: una cabeza promedio detrás de los lentes.
        // Es una caja de bordes redondeados (no un óvalo): una cabeza es ancha
        // y plana a los lados justo detrás de los ojos, donde se apoyan las
        // patas; un óvalo ahí es angosto y dejaría ver las patas a través de
        // los lentes. Las orejas tapan las puntas, que van detrás de ellas.
        const invisible = new THREE.MeshBasicMaterial({ colorWrite: false })
        const cabeza = new THREE.Mesh(new RoundedBoxGeometry(0.126, 0.2, 0.19, 4, 0.02), invisible)
        cabeza.position.set(0, -0.01, -0.115) // de 2 cm detrás de los lentes hacia atrás
        const esfera = new THREE.SphereGeometry(1, 24, 16)
        const orejas = [0.075, -0.075].map((x) => {
          const oreja = new THREE.Mesh(esfera, invisible)
          oreja.position.set(x, -0.02, -0.127)
          oreja.scale.set(0.012, 0.032, 0.032)
          return oreja
        })
        for (const parte of [cabeza, ...orejas]) {
          parte.renderOrder = -1 // primero la cabeza, después las gafas
          group.add(parte)
        }

        group.visible = false
        scene.add(group)
        contenido = group

        // Un ancho "de referencia" menor hace que el seguimiento lo dibuje más grande.
        // Sin escala, tamaño real: 1 metro del modelo = la distancia entre tus
        // ojos dividida por la distancia promedio (crece o se achica con tu rostro).
        const anchoModelo = escala ? size.x / escala : ANCHO_POR_DISTANCIA_OJOS * DISTANCIA_OJOS_PROMEDIO
        const matriz = new THREE.Matrix4()
        const giro = new THREE.Quaternion()
        const posicion = new THREE.Vector3()
        const escalaMatriz = new THREE.Vector3()
        const ejeOjos = new THREE.Vector3()

        const dibujar = (pose: PoseCabeza | null, ancho: number, alto: number) => {
          if (!renderer) return
          if (canvas.width !== ancho || canvas.height !== alto) {
            renderer.setSize(ancho, alto, false)
            camera.aspect = ancho / alto
            camera.position.z = alto / (2 * Math.tan(camera.fov * Math.PI / 360))
            camera.updateProjectionMatrix()
          }
          if (!pose) {
            group.visible = false
            renderer.render(scene, camera)
            return
          }

          // MediaPipe entrega la orientación de la cabeza en el mismo sistema
          // que esta escena (x a la derecha, y hacia arriba, z hacia la cámara).
          matriz.fromArray(pose.rotacion)
          matriz.decompose(posicion, giro, escalaMatriz)

          // Al girar, los ojos se ven más juntos en el video aunque la cabeza
          // no se aleje. Se corrige con cuánto del eje de los ojos queda de
          // frente a la cámara, para que las gafas no se encojan al girar.
          ejeOjos.set(1, 0, 0).applyQuaternion(giro)
          const deFrente = Math.max(Math.hypot(ejeOjos.x, ejeOjos.y), 0.45)
          const escalaNueva = (pose.distanciaOjos / deFrente) * ANCHO_POR_DISTANCIA_OJOS / anchoModelo
          posicion.set(pose.x - ancho / 2, alto / 2 - pose.y, 0)

          // Suavizado: se acerca a la posición nueva sin saltar, así no tiembla.
          // Si estaban ocultas (rostro recién encontrado), van directo a su sitio.
          const k = group.visible ? SUAVIZADO : 1
          group.position.lerp(posicion, k)
          group.quaternion.slerp(giro, k)
          group.scale.setScalar(group.scale.x + (escalaNueva - group.scale.x) * k)
          group.visible = true
          renderer.render(scene, camera)
        }

        escenaRef.current = { dibujar }
        renderer.render(scene, camera)
        setEstado('lista')
      } catch {
        if (!cancelado) setEstado('error')
      }
    }

    cargarModelo()
    return () => {
      cancelado = true
      if (contenido) liberarModelo(contenido)
      reflejos?.dispose()
      renderer?.dispose()
      if (canvas) {
        canvas.width = 1
        canvas.height = 1
      }
      escenaRef.current = null
      // La próxima vez que se elija el modelo vuelve a empezar en "cargando".
      setEstado('cargando')
    }
  }, [modelo, canvasRef])

  return { escenaRef, estado: modelo ? estado : 'cargando' as CargaMontura }
}
