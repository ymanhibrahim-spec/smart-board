import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { Plus, BookOpen, FileText, Award, TrendingUp, Calendar, ChevronRight, ClipboardCheck, Share2, Copy, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { db } from '../utils/firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { translations } from '../utils/translations'

const Dashboard = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [lessons, setLessons] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  
  const lang = localStorage.getItem('app-lang') || 'ar'
  const t = translations[lang]

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return
      try {
        const qL = query(collection(db, "lessons"), where("teacherId", "==", currentUser.uid), orderBy("createdAt", "desc"))
        const snapL = await getDocs(qL)
        const lessonList = []
        snapL.forEach((doc) => lessonList.push({ id: doc.id, ...doc.data() }))
        setLessons(lessonList)

        const qQ = query(collection(db, "quizzes"), where("teacherId", "==", currentUser.uid), orderBy("createdAt", "desc"))
        const snapQ = await getDocs(qQ)
        const quizList = []
        snapQ.forEach((doc) => quizList.push({ id: doc.id, ...doc.data() }))
        setQuizzes(quizList)
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    fetchData()
  }, [currentUser])

  const copyStudentLink = () => {
    const link = `${window.location.origin}/smart-board`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container" style={{ display: 'flex', gap: '30px', padding: '20px 0' }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--primary)' }}>{t.welcome} {currentUser?.displayName || 'Yman'}! 👋</h1>
            <p style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'أهلاً بك في مركز التحكم الخاص بك.' : 'Welcome to your control center.'}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={copyStudentLink} 
              className="btn-outline" 
              style={{ padding: '12px 20px', display: 'flex', gap: '8px', alignItems: 'center', background: copied ? 'rgba(16, 185, 129, 0.1)' : 'transparent', borderColor: copied ? '#10b981' : 'var(--border-color)' }}
            >
              {copied ? <Check size={18} color="#10b981" /> : <Share2 size={18} />}
              {lang === 'ar' ? (copied ? 'تم النسخ!' : 'رابط الطلاب') : (copied ? 'Copied!' : 'Student Link')}
            </button>
            <button onClick={() => navigate('/create-quiz')} className="btn-outline" style={{ padding: '12px 20px', color: 'var(--secondary)', borderColor: 'var(--secondary)' }}>
              <ClipboardCheck size={18} /> {lang === 'ar' ? 'إنشاء امتحان' : 'Create Quiz'}
            </button>
            <Link to="/lesson" className="btn-primary" style={{ padding: '12px 25px' }}>
              <Plus size={18} /> {t.newLesson}
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {[
            { label: t.lessonCount, value: lessons.length, icon: <BookOpen />, color: '#3b82f6' },
            { label: lang === 'ar' ? 'الامتحانات الحية' : 'Live Quizzes', value: quizzes.length, icon: <Award />, color: '#10b981' },
            { label: t.savedFiles, value: lessons.length * 2, icon: <FileText />, color: '#f59e0b' },
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} className="glass-morphism" style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ background: `${stat.color}15`, color: stat.color, padding: '15px', borderRadius: '15px' }}>{stat.icon}</div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{stat.label}</p>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--text-dark)' }}>{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Lessons */}
        <div className="glass-morphism" style={{ padding: '30px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '25px' }}>{lang === 'ar' ? 'آخر الدروس والنشاطات' : 'Recent Lessons & Activities'}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {loading ? <p>{t.loading}</p> : lessons.length > 0 ? (
              lessons.slice(0, 5).map((lesson) => (
                <div key={lesson.id} className="lesson-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <BookOpen size={20} color="var(--primary)" />
                    <div>
                      <h4 style={{ fontSize: '1rem' }}>{lesson.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{lesson.subject} | {lesson.date}</p>
                    </div>
                  </div>
                  <Link to="/lesson-summary" onClick={() => localStorage.setItem('currentLesson', JSON.stringify(lesson))} style={{ color: 'var(--primary)' }}>
                    <ChevronRight size={20} className="rtl-flip" />
                  </Link>
                </div>
              ))
            ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>لا توجد دروس بعد.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
