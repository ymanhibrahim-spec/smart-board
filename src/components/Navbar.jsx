import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { translations } from '../utils/translations'

const Navbar = () => {
  const { currentUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const lang = localStorage.getItem('app-lang') || 'ar'
  const t = translations[lang]

  const isLessonPage = location.pathname === '/lesson'
  if (isLessonPage) return null

  const navLinks = [
    { name: t.home, path: '/' },
    { name: t.features, path: '/#features' },
    { name: t.contact, path: '/#contact' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="glass-morphism" style={{ position: 'sticky', top: 0, zIndex: 1000, margin: '10px 15px', padding: '10px 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--primary)' }}>
          <img src="/Logo.png" alt="Logo" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
          <span style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
            {lang === 'ar' ? 'حصتي' : 'Hissati'} <span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="desktop-menu" style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              style={{
                textDecoration: 'none',
                color: isActive(link.path) ? 'var(--primary)' : 'var(--text-dark)',
                fontWeight: '500',
                transition: 'var(--transition)',
                borderBottom: isActive(link.path) ? '2px solid var(--primary)' : '2px solid transparent',
                paddingBottom: '2px'
              }}
              onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
              onMouseOut={(e) => e.target.style.color = isActive(link.path) ? 'var(--primary)' : 'var(--text-dark)'}
            >
              {link.name}
            </Link>
          ))}

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {currentUser ? (
              <>
                <Link
                  to="/settings"
                  style={{
                    textDecoration: 'none',
                    color: isActive('/settings') ? 'var(--primary)' : 'var(--text-dark)',
                    fontWeight: '500',
                    borderBottom: isActive('/settings') ? '2px solid var(--primary)' : '2px solid transparent',
                    paddingBottom: '2px'
                  }}
                >
                  {t.settings}
                </Link>
                <Link to="/dashboard" className="btn-primary" style={{ fontSize: '0.9rem', padding: '10px 18px' }}>
                  <LayoutDashboard size={18} />
                  {t.dashboard}
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline" style={{ fontSize: '0.9rem' }}>{t.login}</Link>
                <Link to="/register" className="btn-primary" style={{ fontSize: '0.9rem' }}>{t.signup}</Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '5px' }}
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--glass)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          padding: '15px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
          borderRadius: '0 0 20px 20px',
          zIndex: 999
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              style={{
                textDecoration: 'none',
                color: isActive(link.path) ? 'var(--primary)' : 'var(--text-dark)',
                fontWeight: '500',
                padding: '13px 18px',
                borderRadius: '12px',
                background: isActive(link.path) ? 'rgba(255,174,66,0.1)' : 'transparent',
                fontSize: '1rem'
              }}
            >
              {link.name}
            </Link>
          ))}

          {currentUser && (
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              style={{
                textDecoration: 'none',
                color: isActive('/settings') ? 'var(--primary)' : 'var(--text-dark)',
                fontWeight: '500',
                padding: '13px 18px',
                borderRadius: '12px',
                background: isActive('/settings') ? 'rgba(255,174,66,0.1)' : 'transparent',
                fontSize: '1rem'
              }}
            >
              {t.settings}
            </Link>
          )}

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '5px' }}>
            {currentUser ? (
              <Link to="/dashboard" className="btn-primary" onClick={() => setIsOpen(false)} style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                {t.dashboard}
              </Link>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link to="/login" className="btn-outline" onClick={() => setIsOpen(false)} style={{ textAlign: 'center', width: '100%', padding: '12px' }}>{t.login}</Link>
                <Link to="/register" className="btn-primary" onClick={() => setIsOpen(false)} style={{ justifyContent: 'center', padding: '14px' }}>{t.signup}</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
