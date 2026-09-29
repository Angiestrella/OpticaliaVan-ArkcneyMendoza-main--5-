import colors from '../data/colors.json'
import type { ColorOption } from '../data/types'

export function getPalette(ids: string[]): ColorOption[] {
  return ids
    .map((id) => colors.find((c) => c.id === id))
    .filter((c): c is ColorOption => c !== undefined)
}
