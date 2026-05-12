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

  return (
    <nav className="glass-morphism" style={{ position: 'sticky', top: 0, zIndex: 1000, margin: '10px 20px', padding: '10px 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--primary)' }}>
          <img src="/Logo.png" alt="Logo" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{lang === 'ar' ? 'حصتي' : 'Hissati'} <span style={{ color: 'var(--accent)' }}>AI</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className="desktop-menu" style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              style={{ 
                textDecoration: 'none', 
                color: 'var(--text-dark)', 
                fontWeight: '500',
                transition: 'var(--transition)',
                borderBottom: location.pathname === link.path ? '2px solid var(--primary)' : '2px solid transparent'
              }}
              onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
              onMouseOut={(e) => e.target.style.color = location.pathname === link.path ? 'var(--primary)' : 'var(--text-dark)'}
            >
              {link.name}
            </Link>
          ))}
          <div style={{ display: 'flex', gap: '15px' }}>
            {currentUser ? (
              <Link to="/dashboard" className="btn-primary" style={{ fontSize: '0.9rem' }}>
                <LayoutDashboard size={18} style={{ [lang === 'ar' ? 'marginLeft' : 'marginRight']: '8px' }} /> {t.dashboard}
              </Link>
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
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Content */}
      {isOpen && (
        <div className="mobile-menu" style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          right: 0, 
          background: 'var(--glass)', 
          backdropFilter: 'blur(10px)',
          padding: '20px', 
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          boxShadow: 'var(--shadow)',
          borderRadius: '0 0 20px 20px'
        }}>
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} style={{ textDecoration: 'none', color: 'var(--text-dark)', fontWeight: '500', padding: '10px 0' }}>{link.name}</Link>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)' }} />
          {currentUser ? (
            <Link to="/dashboard" className="btn-primary" onClick={() => setIsOpen(false)} style={{ justifyContent: 'center' }}>{t.dashboard}</Link>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/login" className="btn-outline" onClick={() => setIsOpen(false)} style={{ textAlign: 'center' }}>{t.login}</Link>
              <Link to="/register" className="btn-primary" onClick={() => setIsOpen(false)} style={{ justifyContent: 'center' }}>{t.signup}</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar
