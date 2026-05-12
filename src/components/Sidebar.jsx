import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, FileText, Award, Settings, LogOut, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { translations } from '../utils/translations'

const Sidebar = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const lang = localStorage.getItem('app-lang') || 'ar'
  const t = translations[lang]

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Failed to log out', err)
    }
  }

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: t.dashboard, path: '/dashboard' },
    { icon: <BookOpen size={20} />, label: t.myLessons, path: '/lessons' },
    { icon: <FileText size={20} />, label: t.files, path: '/files' },
    { icon: <Award size={20} />, label: t.quizzes, path: '/exams' },
    { icon: <Settings size={20} />, label: t.settings, path: '/settings' },
  ]

  return (
    <div className="sidebar" style={{ 
      width: '260px', 
      height: 'calc(100vh - 100px)', 
      background: 'var(--card-bg)', 
      borderRadius: '24px', 
      padding: '30px 15px',
      margin: '10px',
      boxShadow: 'var(--shadow)',
      position: 'sticky',
      top: '90px',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid var(--border-color)',
      transition: 'var(--transition)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path
          return (
            <Link 
              key={index} 
              to={item.path} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px', 
                padding: '12px 20px', 
                textDecoration: 'none', 
                color: isActive ? 'var(--primary)' : 'var(--text-dark)', 
                borderRadius: '12px',
                transition: 'var(--transition)',
                background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                fontWeight: isActive ? '600' : '400'
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
        
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px', 
            padding: '12px 20px', 
            background: 'none',
            border: 'none',
            color: '#ff4444', 
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'var(--transition)',
            fontWeight: '500',
            marginTop: '5px',
            textAlign: lang === 'ar' ? 'right' : 'left'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,68,68,0.05)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
        >
          <LogOut size={20} />
          <span>{t.logout}</span>
        </button>
      </div>

      <div style={{ 
        marginTop: 'auto', 
        padding: '20px', 
        background: 'linear-gradient(135deg, var(--secondary), #059669)', 
        borderRadius: '20px',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '8px'
      }}>
        <CheckCircle size={24} />
        <h4 style={{ fontSize: '1rem' }}>{t.fullVersion}</h4>
        <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>{t.teacherAccount}</p>
      </div>
    </div>
  )
}

export default Sidebar
