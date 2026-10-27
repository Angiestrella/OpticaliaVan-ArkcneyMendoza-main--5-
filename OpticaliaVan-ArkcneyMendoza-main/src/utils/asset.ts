const base = import.meta.env.BASE_URL

/**
 * Ruta a un archivo de /public que funciona aunque el sitio no esté en la raíz
 * del dominio. En local la base es "/", pero en GitHub Pages el sitio vive en
 * /OpticaliaVan-ArkcneyMendoza-main--5-/ y una ruta como "/hero.mp4" no cargaría.
 */
export function asset(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith(base)) return path
  return base + path.slice(1)
}
