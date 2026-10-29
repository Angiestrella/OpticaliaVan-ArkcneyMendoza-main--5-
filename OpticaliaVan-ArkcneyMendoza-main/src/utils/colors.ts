import { opcionesColor } from '../data'
import type { ColorOption } from '../data/types'

export function getPalette(ids: string[]): ColorOption[] {
  return ids
    .map((id) => opcionesColor.find((c) => c.id === id))
    .filter((c): c is ColorOption => c !== undefined)
}
