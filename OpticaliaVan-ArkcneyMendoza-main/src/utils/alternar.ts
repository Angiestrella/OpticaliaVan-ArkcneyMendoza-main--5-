// Agrega el valor a la lista si no está, o lo quita si ya está.
// Se usa en los filtros del catálogo, la agenda, el test y el cotizador.
export function alternar<T>(lista: T[], valor: T): T[] {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]
}
