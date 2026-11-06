import { asset } from '../../utils/asset'

export interface Modelo3D {
  model: string
  // Punto del GLB que debe quedar entre los ojos (centro del frente, a la
  // altura de los lentes). Cada archivo trae su origen en un sitio distinto.
  centro: [number, number, number]
  // Ajuste de tamaño de un modelo: 1.1 = 10 % más grande. Sin escala se dibuja en
  // proporción a su tamaño real (el GLB debe estar en metros, como la gafa de
  // verdad); el tamaño final depende del ancho del rostro (ver useModelo3D.ts).
  escala?: number
  // Color de la montura que es el modelo (id en frames.json), si tiene varios.
  // Sin él, el modelo vale para todos sus colores.
  color?: string
  // Gafas 2 en 1 (Easy Click): el mismo modelo con el clip de sol puesto.
  // Con él, el probador muestra el botón "Oftálmica / Con clip de sol".
  sol?: Modelo3D
}

// Montura de muestra que aparece primera en la lista del probador.
export const monturaReferencia: { id: string; name: string; image: string; modelo: Modelo3D } = {
  id: 'montura-3d',
  name: 'Modelo 3D con patas',
  image: asset('/gafas/montura-referencia.webp'),
  modelo: {
    model: asset('/gafas/3d/montura-3d.glb'),
    centro: [0, 0.02284, 0.06702],
    escala: 1,
  },
}

// El archivo es public/gafas/3d/<nombre>-3d.glb.
const modelo = (nombre: string, centro: Modelo3D['centro'], color?: string): Modelo3D => ({ model: asset(`/gafas/3d/${nombre}-3d.glb`), centro, color })

// Gafas 2 en 1: public/gafas/3d/<nombre>-3d.glb (oftálmica) y <nombre>-sol-3d.glb
// (con el clip de sol). Los dos archivos tienen la montura en el mismo sitio,
// así que comparten el centro y el clip queda justo encima.
const dosEnUno = (nombre: string, centro: Modelo3D['centro'], color?: string): Modelo3D => ({
  ...modelo(nombre, centro, color),
  sol: modelo(`${nombre}-sol`, centro, color),
})

// Monturas del catálogo que tienen modelo 3D, por su id en frames.json (una
// por color si la montura viene en varios colores con modelo propio).
// Al elegirlas en el probador se usa el modelo 3D, ajustado al rostro.
// Para añadir otra: guardar el .glb como public/gafas/3d/<id>-3d.glb (en metros,
// con el frente hacia +Z) y medir su centro: x = 0, y = mitad del alto del
// frente (o de los lentes, si es al aire), z = el plano del frente.
export const modelosPorMontura: Record<string, Modelo3D[]> = {
  'bahamas-blue-bimini': [modelo('bahamas-blue-bimini', [0, -0.0127, 0])],
  'bahamas-blue-eleuthera': [modelo('bahamas-blue-eleuthera', [0, -0.0061, 0])],
  'bahamas-blue-exuma': [modelo('bahamas-blue-exuma', [0, -0.0061, 0])],
  // Este archivo tiene el origen en el centro de toda la gafa: el frente está en z = 0.07.
  'bahamas-blue-nassau': [modelo('bahamas-blue-nassau', [0, 0, 0.07])],
  'the-look-bosque': [modelo('the-look-bosque', [0, -0.0134, 0])],
  'the-look-prisma': [modelo('the-look-prisma', [0, -0.0067, 0])],
  'trendi-aviador': [modelo('trendi-aviador', [0, -0.0181, 0])],
  'trendi-contraste': [modelo('trendi-contraste', [0, -0.0086, 0])],
  'trendi-dalia': [modelo('trendi-dalia', [0, -0.0071, 0])],
  'trendi-jade': [modelo('trendi-jade', [0, -0.008, 0])],
  'trendi-metro': [
    modelo('trendi-metro-morado', [0, -0.0087, 0], 'morado'),
    modelo('trendi-metro-verde', [0, -0.0097, 0], 'verde'),
  ],
  // Al aire (sin aro): el centro se mide con los lentes.
  'valentin-aire': [modelo('valentin-aire', [0, -0.0118, 0])],
  'valentin-florencia': [modelo('valentin-florencia', [0, -0.0108, 0])],
  'valentin-roma': [modelo('valentin-roma', [0, -0.0109, 0])],
  'valentin-siena': [modelo('valentin-siena', [0, -0.0076, 0])],
  'valentin-venecia': [modelo('valentin-venecia', [0, -0.0084, 0])],
  'dimilano-brera': [modelo('dimilano-brera', [0, -0.0072, 0])],
  'oakley-ridge': [modelo('oakley-ridge', [0, -0.0081, 0])],
  'oakley-torque': [modelo('oakley-torque', [0, -0.0086, 0])],
  'oakley-frost': [modelo('oakley-frost', [0, -0.0105, 0])],
  'pull-bear-oslo': [modelo('pull-bear-oslo', [0, -0.01, 0])],
  'arturo-calle-popayan': [modelo('arturo-calle-popayan', [0, -0.009, 0])],
  'arturo-calle-pereira': [modelo('arturo-calle-pereira', [0, -0.0094, 0])],
  'arturo-calle-cali': [modelo('arturo-calle-cali', [0, -0.0093, 0])],
  // 2 en 1 (Easy Click): se prueban como oftálmicas o con el clip de sol.
  'trendi-clip-solar': [dosEnUno('trendi-clip-solar', [0, -0.0088, 0])],
  // La montura dorada es la misma en los dos colores; el modelo trae el clip
  // carey (lentes café). El clip negro todavía no tiene modelo 3D.
  'the-look-piloto': [dosEnUno('the-look-piloto', [0, -0.0152, 0], 'carey')],
}

// ¿Esta montura del catálogo se puede probar en el probador? Solo las que
// tienen modelo 3D; las demás muestran "Prueba virtual: próximamente".
export const tienePruebaVirtual = (id: string) => id in modelosPorMontura
