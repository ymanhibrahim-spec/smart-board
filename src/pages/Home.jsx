import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Award, Zap, Shield, ArrowRight, Smartphone, Camera, X, CheckCircle2 } from 'lucide-react'
import { db } from '../utils/firebase'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { Html5QrcodeScanner } from 'html5-qrcode'

const Home = () => {
  const navigate = useNavigate()
  const [quizCode, setQuizCode] = useState('')
  const [searching, setSearching] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const lang = localStorage.getItem('app-lang') || 'ar'

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      })

      scanner.render((decodedText) => {
        // Handle URL or raw ID
        if (decodedText.includes('/quiz/')) {
          const id = decodedText.split('/quiz/')[1]
          navigate(`/quiz/${id}`)
        } else {
          navigate(`/quiz/${decodedText}`)
        }
        scanner.clear()
        setShowScanner(false)
      }, (error) => {
        // silent error for continuous scanning
      })

      return () => scanner.clear()
    }
  }, [showScanner, navigate])

  const handleJoinQuiz = async (e) => {
    if (e) e.preventDefault()
    if (quizCode.length < 6) return
    
    setSearching(true)
    try {
      const q = query(collection(db, "quizzes"), where("shortCode", "==", quizCode), limit(1))
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        navigate(`/quiz/${querySnapshot.docs[0].id}`)
      } else {
        alert(lang === 'ar' ? "الكود غير صحيح" : "Invalid code")
      }
    } catch (err) { console.error(err) }
    setSearching(false)
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero section-padding" style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', color: 'white', paddingTop: 'min(120px, 15vh)', paddingBottom: 'min(120px, 15vh)', position: 'relative', overflow: 'hidden' }}>
        <div className="container">
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ fontSize: 'min(4rem, 12vw)', marginBottom: '20px', fontWeight: '900' }}>
            {lang === 'ar' ? 'حصتي AI' : 'Hissati AI'}
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} style={{ fontSize: 'min(1.4rem, 5vw)', opacity: 0.9, marginBottom: '60px', maxWidth: '800px', marginInline: 'auto' }}>
            {lang === 'ar' ? 'المنصة الذكية الأسرع لإدارة الحصص والامتحانات التفاعلية.' : 'The fastest smart platform for managing lessons and interactive quizzes.'}
          </motion.p>

          {/* Student Entrance Portal */}
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-morphism" style={{ maxWidth: '450px', margin: '0 auto', padding: 'min(40px, 8vw)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(15px)' }}>
            <h2 style={{ fontSize: 'min(1.5rem, 6vw)', marginBottom: '30px' }}>{lang === 'ar' ? 'بوابة دخول الطلاب' : 'Student Entrance'}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1, display: 'flex', background: 'white', borderRadius: '15px', overflow: 'hidden', padding: '5px' }}>
                  <input 
                    type="text" 
                    placeholder={lang === 'ar' ? "رقم الامتحان" : "Quiz Code"}
                    value={quizCode}
                    onChange={(e) => setQuizCode(e.target.value)}
                    maxLength={6}
                    style={{ flex: 1, border: 'none', padding: '12px', fontSize: '1.1rem', color: 'var(--text-dark)', outline: 'none', textAlign: 'center' }}
                  />
                </div>
                <button 
                  onClick={() => setShowScanner(true)}
                  style={{ width: '55px', background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Camera size={24} />
                </button>
              </div>

              <button 
                onClick={handleJoinQuiz}
                disabled={searching || quizCode.length < 6}
                className="btn-primary" 
                style={{ width: '100%', padding: '16px', fontSize: '1.1rem', background: '#00cc66', border: 'none', borderRadius: '15px', color: 'white', boxShadow: '0 10px 20px rgba(0,204,102,0.3)', justifyContent: 'center' }}
              >
                {searching ? (lang === 'ar' ? 'جاري التحقق...' : 'Checking...') : (lang === 'ar' ? 'دخول الآن' : 'Join Now')}
              </button>
            </div>

            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', opacity: 0.8 }}>
              {lang === 'ar' ? 'أو سجل دخولك كمعلم' : 'Or login as a teacher'} <Link to="/login" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'underline' }}>{lang === 'ar' ? 'من هنا' : 'here'}</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 5000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <button onClick={() => setShowScanner(false)} style={{ position: 'absolute', top: '-60px', right: '0', background: 'white', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer' }}>
                <X size={24} color="black" />
              </button>
              <div id="reader" style={{ borderRadius: '20px', overflow: 'hidden' }}></div>
              <p style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>{lang === 'ar' ? 'وجه الكاميرا نحو باركود الامتحان' : 'Point camera at the quiz QR code'}</p>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Features Grid */}
      <section className="section-padding container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {[
            { title: lang === 'ar' ? 'سبورة تفاعلية' : 'Smart Board', icon: <BookOpen />, color: '#3b82f6' },
            { title: lang === 'ar' ? 'امتحانات آمنة' : 'Secure Exams', icon: <Shield />, color: '#10b981' },
            { title: lang === 'ar' ? 'تقارير ذكية' : 'AI Reports', icon: <Zap />, color: '#f59e0b' }
          ].map((f, i) => (
            <motion.div key={i} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="glass-morphism" style={{ padding: '25px', textAlign: 'center' }}>
              <div style={{ color: f.color, marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.1rem' }}>{f.title}</h3>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
