import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.scss'

// Debe coincidir con $navbar-height en src/styles/_variables.scss
const NAVBAR_HEIGHT = 72

export function Navbar() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const headerRef = useRef<HTMLElement>(null)
  const [collapsed, setCollapsed] = useState(!isHome)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    // Fuera de Inicio no hay video que encoger: el navbar nace ya colapsado.
    if (!isHome) {
      header.style.setProperty('--navbar-progress', '1')
      setCollapsed(true)
      return
    }

    function handleScroll() {
      const maxScroll = window.innerHeight - NAVBAR_HEIGHT
      const progress =
        maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 1
      header!.style.setProperty('--navbar-progress', String(progress))
      setCollapsed(progress > 0.6)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHome])

  return (
    <header
      ref={headerRef}
      className={`navbar ${collapsed ? 'navbar--collapsed' : ''}`}
    >
      {isHome && (
        <>
          <video
            className="navbar__video"
            autoPlay
            loop
            muted
            playsInline
            src="/hero.mp4"
          />
          <div className="navbar__scrim" />
          <div className="navbar__hero-content">
            <h1 className="navbar__hero-title">Ver mejor es vivir mejor.</h1>
            <Link className="navbar__hero-cta" to="/encuentra-tus-gafas">
              Encuentra tus gafas ideales
            </Link>
          </div>
        </>
      )}

      <nav className="navbar__nav">
        <Link className="navbar__brand" to="/">
          <img
            className="navbar__logo"
            src="/logo-opticalia.svg"
            alt="Opticalia Van-Arcken & Mendoza"
          />
        </Link>

        <div className="navbar__right">
          <ul className="navbar__links">
            <li>
              <Link to="/catalogo">Catálogo</Link>
            </li>
          </ul>

          <Link className="navbar__cta" to="/agenda">
            Agenda tu cita
          </Link>
        </div>
      </nav>
    </header>
  )
}
