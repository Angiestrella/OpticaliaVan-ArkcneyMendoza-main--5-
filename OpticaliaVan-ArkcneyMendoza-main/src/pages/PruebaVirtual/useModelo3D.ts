import { useEffect, useRef, useState, type RefObject } from 'react'
import type { Group, Mesh, Object3D, PerspectiveCamera, Scene, Texture, WebGLRenderer } from 'three'
import type { CargaMontura } from './useMonturaPlana'

export type Patilla = { lado: 'izquierda' | 'derecha'; mesh: Object3D }
export type Escena3D = {
  renderer: WebGLRenderer
  scene: Scene
  camera: PerspectiveCamera
  group: Group
  modelWidth: number
  patillas: Patilla[]
}

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
// la escena sobre el <canvas>. Con url = null no carga nada y libera lo anterior.
export function useModelo3D(url: string | null, canvasRef: RefObject<HTMLCanvasElement | null>) {
  const escenaRef = useRef<Escena3D | null>(null)
  const [estado, setEstado] = useState<CargaMontura>('cargando')

  useEffect(() => {
    if (!url) return

    let cancelado = false
    let renderer: WebGLRenderer | null = null
    let root: Object3D | null = null
    const canvas = canvasRef.current

    async function cargarModelo(modelo: string) {
      try {
        // import() dinámico: three.js queda en un archivo aparte que solo se
        // descarga cuando alguien elige el modelo 3D.
        const [THREE, { GLTFLoader }] = await Promise.all([
          import('three'),
          import('three/examples/jsm/loaders/GLTFLoader.js'),
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

        const gltf = await new GLTFLoader().loadAsync(modelo)
        if (cancelado) {
          liberarModelo(gltf.scene)
          renderer.dispose()
          return
        }

        root = gltf.scene
        const patillas: Patilla[] = []
        root.traverse((obj) => {
          if (obj.name.toLowerCase().includes('shadow')) obj.visible = false
          // Sin una malla de profundidad del rostro, las patas se ven a
          // través de los lentes y parecen cruzar los ojos. Se revelan al girar.
          if ((obj as Mesh).isMesh && /^(Temple_|Code_[LR]_GEO)/.test(obj.name) && !/Hinge|Screws/i.test(obj.name)) {
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
        escenaRef.current = { renderer, scene, camera, group, modelWidth: size.x, patillas }
        renderer.render(scene, camera)
        setEstado('lista')
      } catch {
        if (!cancelado) setEstado('error')
      }
    }

    cargarModelo(url)
    return () => {
      cancelado = true
      if (root) liberarModelo(root)
      renderer?.dispose()
      if (canvas) {
        canvas.width = 1
        canvas.height = 1
      }
      escenaRef.current = null
      // La próxima vez que se elija el modelo vuelve a empezar en "cargando".
      setEstado('cargando')
    }
  }, [url, canvasRef])

  return { escenaRef, estado: url ? estado : 'cargando' as CargaMontura }
}
