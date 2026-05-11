import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, School, ArrowLeft, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const emailRef = useRef()
  const passwordRef = useRef()
  const { login } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setError('')
      setLoading(true)
      await login(emailRef.current.value, passwordRef.current.value)
      navigate('/dashboard')
    } catch (err) {
      setError('فشل تسجيل الدخول. يرجى التأكد من البريد الإلكتروني وكلمة المرور.')
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <div className="auth-page" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(rgba(0,51,102,0.02), rgba(0,255,204,0.02))' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism" 
        style={{ width: '100%', maxWidth: '450px', padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: 'var(--primary)', marginBottom: '10px' }}>تسجيل الدخول</h1>
          <p style={{ color: 'var(--text-muted)' }}>أهلاً بك مجدداً في حصتي AI</p>
        </div>

        {error && (
          <div style={{ background: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', border: '1px solid #feb2b2' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>البريد الإلكتروني</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
              <input 
                type="email" 
                ref={emailRef}
                placeholder="example@school.com" 
                required
                style={{ width: '100%', padding: '12px 45px 12px 15px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
              <input 
                type="password" 
                ref={passwordRef}
                placeholder="••••••••" 
                required
                style={{ width: '100%', padding: '12px 45px 12px 15px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '15px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem' }}>
          ليس لديك حساب؟ <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>أنشئ حساباً جديداً</Link>
        </p>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>
            <ArrowLeft size={16} className="rtl-flip" /> العودة للرئيسية
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
