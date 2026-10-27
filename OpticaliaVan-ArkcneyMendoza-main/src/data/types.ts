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
