// Guarda y lee datos en el navegador (localStorage) usando JSON:
// JSON.stringify convierte el objeto en texto y JSON.parse lo vuelve objeto.
// Si el navegador no deja guardar (modo privado, sin espacio), no pasa nada.

export function guardar<T>(clave: string, valor: T): void {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    /* sin almacenamiento disponible */
  }
}

export function leer<T>(clave: string, porDefecto: T): T {
  try {
    const texto = localStorage.getItem(clave)
    return texto ? (JSON.parse(texto) as T) : porDefecto
  } catch {
    return porDefecto
  }
}
