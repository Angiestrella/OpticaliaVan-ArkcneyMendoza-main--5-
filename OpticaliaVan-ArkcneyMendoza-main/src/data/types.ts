export interface FrameColor {
  id: string
  label: string
  image: string
  photos: FramePhoto[]
}

export interface FramePhoto {
  id: string
  label: string
  image: string
  placeholder: boolean
}

export interface Frame {
  id: string
  name: string
  price: number
  brand: string
  category: string
  genero: string
  trending: boolean
  silhouette: string
  description: string
  colors: FrameColor[]
}

export interface ColorOption {
  id: string
  label: string
  hex: string
}

// lens-options.json
export interface OpcionLente {
  id: string
  label: string
  price: number
  descripcion: string
}

export interface TinteTerapeutico {
  id: string
  nombre: string
  color: string
  swatch: string
  uso: string
  detalle: string
}

export interface OpcionesLente {
  materiales: OpcionLente[]
  filtros: OpcionLente[]
  tintes: TinteTerapeutico[]
}

// contact.json
export interface Contacto {
  whatsapp: string
  tiempoRespuesta: string
}
