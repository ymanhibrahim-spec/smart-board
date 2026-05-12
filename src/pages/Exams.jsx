import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { Award, Eye, ClipboardCheck, Share2, Copy, Check, Trash2, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { db } from '../utils/firebase'
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { translations } from '../utils/translations'

const Exams = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  
  const lang = localStorage.getItem('app-lang') || 'ar'
  const t = translations[lang]

  const fetchData = async () => {
    if (!currentUser) return
    try {
      const qQ = query(collection(db, "quizzes"), where("teacherId", "==", currentUser.uid), orderBy("createdAt", "desc"))
      const snapQ = await getDocs(qQ)
      const quizList = []
      snapQ.forEach((doc) => quizList.push({ id: doc.id, ...doc.data() }))
      setQuizzes(quizList)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [currentUser])

  const copyLink = (id) => {
    const link = `${window.location.origin}/smart-board/quiz/${id}`
    navigator.clipboard.writeText(link)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الامتحان؟' : 'Are you sure you want to delete this quiz?')) {
      await deleteDoc(doc(db, "quizzes", id))
      fetchData()
    }
  }

  return (
    <div className="container" style={{ display: 'flex', gap: '30px', padding: '20px 0' }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1 }}>
        <header className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--primary)' }}>{lang === 'ar' ? 'بنك الاختبارات' : 'Exam Bank'} 📝</h1>
            <p style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'إدارة الاختبارات والنتائج الخاصة بك.' : 'Manage your exams and results.'}</p>
          </div>
          <button onClick={() => navigate('/create-quiz')} className="btn-primary" style={{ padding: '12px 25px' }}>
            <ClipboardCheck size={18} /> {lang === 'ar' ? 'إنشاء امتحان جديد' : 'Create New Exam'}
          </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {loading ? <p>{t.loading}</p> : quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <motion.div key={quiz.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-morphism" style={{ padding: '25px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '8px 12px', borderRadius: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Award size={14} /> {quiz.questions?.length || 0} {lang === 'ar' ? 'أسئلة' : 'Questions'}
                  </div>
                  <button onClick={() => handleDelete(quiz.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{quiz.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={14} /> {quiz.createdAt?.toDate ? quiz.createdAt.toDate().toLocaleDateString() : 'اليوم'}
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => navigate(`/quiz-monitor/${quiz.id}`)} className="btn-outline" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', gap: '5px' }}>
                    <Eye size={16} /> {lang === 'ar' ? 'مراقبة' : 'Monitor'}
                  </button>
                  <button onClick={() => copyLink(quiz.id)} className="btn-outline" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', gap: '5px', borderColor: copiedId === quiz.id ? '#10b981' : 'var(--border-color)', color: copiedId === quiz.id ? '#10b981' : 'var(--text-dark)' }}>
                    {copiedId === quiz.id ? <Check size={16} /> : <Share2 size={16} />}
                    {lang === 'ar' ? (copiedId === quiz.id ? 'تم النسخ!' : 'مشاركة') : (copiedId === quiz.id ? 'Copied!' : 'Share')}
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
              <Award size={60} color="var(--text-muted)" style={{ marginBottom: '20px', opacity: 0.3 }} />
              <p style={{ color: 'var(--text-muted)' }}>لا توجد اختبارات منشأة بعد.</p>
              <button onClick={() => navigate('/create-quiz')} className="btn-primary" style={{ marginTop: '20px' }}>أنشئ اختبارك الأول</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Exams
