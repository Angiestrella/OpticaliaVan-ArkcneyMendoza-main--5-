import { expect, it } from 'vitest'
import { alternar } from './alternar'

it('agrega lo que no está y quita lo que ya está, sin cambiar la lista original', () => {
  const original = ['a']
  expect(alternar(original, 'b')).toEqual(['a', 'b'])
  expect(alternar(['a', 'b'], 'a')).toEqual(['b'])
  expect(original).toEqual(['a'])
})
