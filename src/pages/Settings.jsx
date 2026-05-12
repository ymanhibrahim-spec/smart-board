import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { User, Globe, Moon, Bell, Shield, Download, Trash2, Save, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { translations } from '../utils/translations'

const Settings = () => {
  const { currentUser } = useAuth()
  const [language, setLanguage] = useState(localStorage.getItem('app-lang') || 'ar')
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light')
  const [showToast, setShowToast] = useState(false)
  
  const t = translations[language]

  // Apply theme and language changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('app-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
    document.body.style.direction = language === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('app-lang', language)
  }, [language])

  const handleSave = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
    // Force a page reload to apply language changes globally if needed, 
    // or just rely on state if all components use the localStorage value
    // window.location.reload() 
  }

  const handleDeleteData = () => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف كافة الدروس؟' : 'Are you sure you want to delete all data?')) {
      alert(language === 'ar' ? 'تم حذف البيانات بنجاح' : 'Data deleted successfully')
    }
  }

  return (
    <div className="container" style={{ display: 'flex', gap: '30px', padding: '20px 0' }}>
      <Sidebar />
      
      <div className="main-content" style={{ flex: 1 }}>
        <header className="page-header-row" style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{t.settings}</h1>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Profile Section */}
          <div className="glass-morphism" style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={20} color="var(--primary)" /> {t.profile}
            </h3>
            <div className="two-col-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-dark)' }}>{t.name}</label>
                <input 
                  type="text" 
                  defaultValue={currentUser?.displayName || 'Yman'} 
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border-color)', 
                    background: 'var(--input-bg)', 
                    color: 'var(--text-dark)',
                    outline: 'none'
                  }} 
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-dark)' }}>{t.school}</label>
                <input 
                  type="text" 
                  defaultValue="مدرسة التميز" 
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border-color)', 
                    background: 'var(--input-bg)', 
                    color: 'var(--text-dark)',
                    outline: 'none'
                  }} 
                />
              </div>
            </div>
          </div>

          {/* App Settings */}
          <div className="glass-morphism" style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe size={20} color="var(--primary)" /> {t.appSettings}
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>{t.language}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'اختر لغة واجهة المستخدم' : 'Choose your UI language'}</p>
              </div>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                style={{ 
                  padding: '8px 15px', 
                  borderRadius: '10px', 
                  border: '1px solid var(--border-color)', 
                  background: 'var(--input-bg)', 
                  color: 'var(--text-dark)',
                  outline: 'none'
                }}
              >
                <option value="ar">العربية (RTL)</option>
                <option value="en">English (LTR)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0' }}>
              <div>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-dark)' }}>{t.darkMode}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'تبديل بين الوضع الفاتح والمظلم' : 'Toggle light and dark mode'}</p>
              </div>
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                style={{ 
                  width: '55px', 
                  height: '28px', 
                  background: theme === 'dark' ? 'var(--primary)' : '#ddd', 
                  borderRadius: '20px', 
                  position: 'relative',
                  border: 'none',
                  cursor: 'pointer',
                  transition: '0.3s'
                }}
              >
                <div style={{ 
                  width: '22px', 
                  height: '22px', 
                  background: 'white', 
                  borderRadius: '50%', 
                  position: 'absolute', 
                  top: '3px', 
                  left: theme === 'dark' ? '30px' : '3px',
                  transition: '0.3s',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                   {theme === 'dark' ? <Moon size={12} color="#003366" /> : <Globe size={12} color="#aaa" />}
                </div>
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="glass-morphism" style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ff4444' }}>
              <Shield size={20} /> {t.privacy}
            </h3>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => alert('Exporting data...')}>
                <Download size={18} /> {t.exportData}
              </button>
              <button 
                onClick={handleDeleteData}
                className="btn-outline" 
                style={{ color: '#ff4444', borderColor: '#ff4444', display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <Trash2 size={18} /> {t.deleteData}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button className="btn-primary" onClick={handleSave} style={{ padding: '12px 40px' }}>
              <Save size={18} /> {t.saveChanges}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{ 
              position: 'fixed', 
              bottom: '30px', 
              right: '30px', 
              background: 'var(--secondary)', 
              color: 'white', 
              padding: '15px 25px', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
              zIndex: 2000
            }}
          >
            <CheckCircle size={20} /> {language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Settings
