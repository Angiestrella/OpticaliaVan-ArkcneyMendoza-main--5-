export interface FrameColor {
  id: string
  label: string
  image: string
}

export interface Frame {
  id: string
  name: string
  price: number
  brand: string
  category: string
  genero: string
  trending: boolean
  colors: FrameColor[]
}

export interface ColorOption {
  id: string
  label: string
  hex: string
}
