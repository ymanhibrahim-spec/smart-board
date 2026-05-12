import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, School, ArrowLeft, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const nameRef = useRef()
  const schoolRef = useRef()
  const emailRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const { signup } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('كلمات المرور غير متطابقة')
    }

    try {
      setError('')
      setLoading(true)
      await signup(
        emailRef.current.value, 
        passwordRef.current.value, 
        nameRef.current.value, 
        schoolRef.current.value
      )
      navigate('/dashboard')
    } catch (err) {
      setError('فشل إنشاء الحساب. قد يكون البريد الإلكتروني مستخدماً بالفعل.')
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
        style={{ width: '100%', maxWidth: '500px', padding: '40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: 'var(--primary)', marginBottom: '10px' }}>إنشاء حساب جديد</h1>
          <p style={{ color: 'var(--text-muted)' }}>ابدأ رحلتك التعليمية الذكية اليوم</p>
        </div>

        {error && (
          <div style={{ background: '#fff5f5', color: '#c53030', padding: '12px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', border: '1px solid #feb2b2' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="two-col-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>الاسم الكامل</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
              <input type="text" ref={nameRef} placeholder="أ. محمد علي" required style={{ width: '100%', padding: '12px 45px 12px 15px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }} />
            </div>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>اسم المدرسة</label>
            <div style={{ position: 'relative' }}>
              <School size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
              <input type="text" ref={schoolRef} placeholder="مدرسة التميز الثانوية" required style={{ width: '100%', padding: '12px 45px 12px 15px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }} />
            </div>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>البريد الإلكتروني</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
              <input type="email" ref={emailRef} placeholder="example@school.com" required style={{ width: '100%', padding: '12px 45px 12px 15px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }} />
            </div>
          </div>

          <div className="form-group mobile-full-width">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
              <input type="password" ref={passwordRef} placeholder="••••••••" required style={{ width: '100%', padding: '12px 45px 12px 15px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }} />
            </div>
          </div>

          <div className="form-group mobile-full-width">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>تأكيد الكلمة</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
              <input type="password" ref={passwordConfirmRef} placeholder="••••••••" required style={{ width: '100%', padding: '12px 45px 12px 15px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }} />
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="btn-primary" 
            style={{ gridColumn: 'span 2', justifyContent: 'center', padding: '15px', marginTop: '10px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem' }}>
          لديك حساب بالفعل؟ <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>سجل دخولك</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Register
