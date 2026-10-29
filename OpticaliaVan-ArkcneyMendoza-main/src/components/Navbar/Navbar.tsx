import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronRight, Menu, Pause, Play, X } from 'lucide-react'
import { asset } from '../../utils/asset'
import { useEnlacesSitio } from '../../utils/sitemap'
import { useFlechas } from '../../utils/useFlechas'
import './Navbar.scss'

// Debe coincidir con $navbar-height en src/styles/_variables.scss
const NAVBAR_HEIGHT = 72

// El título de la portada aparece palabra por palabra (ver .navbar__hero-word).
const TITULO_PORTADA = 'Encuentra las gafas que van contigo.'

export function Navbar() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const headerRef = useRef<HTMLElement>(null)
  // En Inicio la portada se encoge al bajar; fuera de Inicio no hay video que
  // encoger y la barra siempre está colapsada (se calcula, no hace falta guardarlo).
  const [encogidaPorScroll, setEncogidaPorScroll] = useState(false)
  const collapsed = !isHome || encogidaPorScroll

  // Menú de celular: se guarda en qué página se abrió, así se cierra solo
  // al cambiar de página (también con el botón "atrás" del navegador).
  const [menuAbiertoEn, setMenuAbiertoEn] = useState<string | null>(null)
  const menuAbierto = menuAbiertoEn === pathname
  const cerrarMenu = () => setMenuAbiertoEn(null)
  const botonMenuRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Enlaces de public/navegacion.xml marcados con menu="si" (la misma fuente
  // que usa el pie de página). "seccion" = lleva a una parte de otra página
  // (con #), así que no se marca como la página actual.
  const enlaces = useEnlacesSitio().filter((enlace) => enlace.menu)
  // Flechas para moverse entre los enlaces (barra de escritorio y menú de celular).
  const flechasBarra = useFlechas<HTMLUListElement>('a')
  const flechasCelular = useFlechas<HTMLElement>('a')

  // Video de portada: se puede pausar (todo lo que se mueve más de 5 segundos
  // debe poder detenerse) y arranca quieto si el dispositivo pide "reducir movimiento".
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoEnPausa, setVideoEnPausa] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (videoEnPausa) {
      video.pause()
      return
    }
    // El video (4 MB) empieza a bajar cuando el resto de la página ya cargó:
    // así no le quita velocidad a lo importante y mientras tanto se ve la
    // imagen de portada (poster).
    const reproducir = () => { video.play().catch(() => {}) }
    if (document.readyState === 'complete') {
      reproducir()
      return
    }
    window.addEventListener('load', reproducir, { once: true })
    return () => window.removeEventListener('load', reproducir)
  }, [videoEnPausa, isHome])

  // Al abrir el menú, el foco del teclado entra al primer enlace; al cerrarlo,
  // vuelve al botón ☰. Escape lo cierra.
  useEffect(() => {
    if (!menuAbierto) return
    const boton = botonMenuRef.current
    menuRef.current?.querySelector<HTMLElement>('a')?.focus()
    const alPresionarTecla = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuAbiertoEn(null) }
    window.addEventListener('keydown', alPresionarTecla)
    return () => {
      window.removeEventListener('keydown', alPresionarTecla)
      boton?.focus()
    }
  }, [menuAbierto])

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    // Fuera de Inicio no hay video que encoger: la barra va compacta.
    if (!isHome) {
      header.style.setProperty('--navbar-progress', '1')
      return
    }

    function handleScroll() {
      const maxScroll = window.innerHeight - NAVBAR_HEIGHT
      const progress =
        maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 1
      header!.style.setProperty('--navbar-progress', String(progress))
      setEncogidaPorScroll(progress > 0.6)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHome])

  return (
    <>
    <header
      ref={headerRef}
      className={`navbar ${collapsed ? 'navbar--collapsed' : ''}`}
    >
      {/* Primero el menú y después la portada: así el orden del Tab es el mismo
          que se ve (arriba la barra, abajo el contenido de la portada). */}
      <nav className="navbar__nav" aria-label="Navegación principal">
        <Link className="navbar__brand" to="/" onClick={cerrarMenu}>
          <img
            className="navbar__logo"
            src={asset('/logo-opticalia.svg')}
            alt="Opticalia Van-Arcken & Mendoza"
          />
        </Link>

        <div className="navbar__right">
          <ul className="navbar__links" ref={flechasBarra}>
            {enlaces.map(({ href, label, seccion }) => (
              <li key={href}>
                {seccion ? <Link to={href}>{label}</Link> : <NavLink to={href} end={href === '/'}>{label}</NavLink>}
              </li>
            ))}
          </ul>

          <Link className="navbar__cta" to="/agenda" onClick={cerrarMenu}>
            Agenda tu cita
          </Link>

          {/* Solo se ve en celular (ver Navbar.scss). */}
          <button
            ref={botonMenuRef}
            type="button"
            className="navbar__menu-btn"
            aria-expanded={menuAbierto}
            aria-controls="menu-celular"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuAbiertoEn(menuAbierto ? null : pathname)}
          >
            {menuAbierto ? <X size={26} strokeWidth={2} /> : <Menu size={26} strokeWidth={2} />}
          </button>
        </div>
      </nav>

      {isHome && (
        <>
          <video
            ref={videoRef}
            className="navbar__video"
            preload="none"
            loop
            muted
            playsInline
            aria-hidden="true"
            // Primer cuadro como imagen: se ve al instante mientras carga el video.
            poster={asset('/hero-poster.webp')}
            src={asset('/hero.mp4')}
          />
          <div className="navbar__scrim" />
          <div className="navbar__hero-content">
            <p className="navbar__hero-eyebrow">Opticalia Van-Arcken &amp; Mendoza</p>
            <h1 className="navbar__hero-title" aria-label={TITULO_PORTADA}>
              {TITULO_PORTADA.split(' ').map((palabra, i) => (
                <span key={i} className="navbar__hero-word" style={{ '--i': i } as CSSProperties} aria-hidden="true">
                  {palabra}{' '}
                </span>
              ))}
            </h1>
            <p className="navbar__hero-description">Estilo, comodidad y asesoría para elegir tu próxima montura.</p>
            <Link className="navbar__hero-cta" to="/que-gafas-van-contigo">
              Encuentra tu estilo <span aria-hidden="true">→</span>
            </Link>
          </div>
          {/* Invisible para el mouse: aparece solo al llegar con Tab (como "Saltar al
              contenido"). Así quien lo necesita puede detener el video. */}
          <button
            type="button"
            className="navbar__video-pausa"
            onClick={() => setVideoEnPausa((enPausa) => !enPausa)}
          >
            {videoEnPausa ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
            {videoEnPausa ? 'Reproducir video' : 'Pausar video'}
          </button>
        </>
      )}

    </header>

    {/* Va fuera del <header> porque este recorta todo lo que se sale de la barra. */}
    {menuAbierto && (
      <>
        <div className="navbar__menu-backdrop" onClick={cerrarMenu} aria-hidden="true" />
        <div id="menu-celular" className="navbar__menu" ref={menuRef}>
          <nav aria-label="Menú principal" ref={flechasCelular}>
            {enlaces.map(({ href, label, seccion }) => seccion ? (
              <Link key={href} to={href} className="navbar__menu-link" onClick={cerrarMenu}>
                {label}
                <ChevronRight size={20} aria-hidden="true" />
              </Link>
            ) : (
              <NavLink key={href} to={href} end={href === '/'} className="navbar__menu-link" onClick={cerrarMenu}>
                {label}
                <ChevronRight size={20} aria-hidden="true" />
              </NavLink>
            ))}
            <Link className="navbar__menu-cta" to="/agenda" onClick={cerrarMenu}>
              Agenda tu cita
            </Link>
          </nav>
        </div>
      </>
    )}
    </>
  )
}
