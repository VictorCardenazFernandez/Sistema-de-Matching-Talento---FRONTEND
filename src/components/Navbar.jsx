import {
  useState,
  useEffect
} from 'react'
import {
  Link,
  useLocation
} from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { user, logout, role } = useAuth()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          <img src="/logo.png" alt="Humantyx Jobs" className="navbar__logo-img" />
        </Link>

        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          <Link to="/" className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}>
            Vacantes
          </Link>
          {user && role === 'admin' && (
            <Link to="/admin" className={`navbar__link ${location.pathname === '/admin' ? 'navbar__link--active' : ''}`}>
              Admin Panel
            </Link>
          )}
          {user && role === 'candidate' && (
            <>
              <Link to="/mis-postulaciones" className={`navbar__link ${location.pathname === '/mis-postulaciones' ? 'navbar__link--active' : ''}`}>
                Mis Postulaciones
              </Link>
              <Link to="/profile" className={`navbar__link ${location.pathname === '/profile' ? 'navbar__link--active' : ''}`}>
                Mi Perfil
              </Link>
            </>
          )}
          {user && role === 'company' && (
            <Link to="/dashboard" className={`navbar__link ${location.pathname === '/dashboard' ? 'navbar__link--active' : ''}`}>
              Dashboard
            </Link>
          )}
        </nav>

        <div className="navbar__actions">
          {user ? (
            <div className="navbar__user">
              <div className="navbar__avatar">
                {user.picture
                  ? <img src={user.picture} alt={user.name} />
                  : <span>{(user.name || user.email || 'U')[0].toUpperCase()}</span>
                }
              </div>
              <button className="navbar__btn navbar__btn--ghost" onClick={logout}>Salir</button>
            </div>
          ) : (
            <Link to="/login" className="navbar__btn navbar__btn--primary">
              <span>Ingresar</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
          <button className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  )
}