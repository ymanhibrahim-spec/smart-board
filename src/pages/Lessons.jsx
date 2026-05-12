import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { BookOpen, Plus, ChevronRight, Calendar, Book, Trash2, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { db } from '../utils/firebase'
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { translations } from '../utils/translations'

const Lessons = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  const lang = localStorage.getItem('app-lang') || 'ar'
  const t = translations[lang]

  const fetchData = async () => {
    if (!currentUser) return
    try {
      const qL = query(collection(db, "lessons"), where("teacherId", "==", currentUser.uid), orderBy("createdAt", "desc"))
      const snapL = await getDocs(qL)
      const lessonList = []
      snapL.forEach((doc) => lessonList.push({ id: doc.id, ...doc.data() }))
      setLessons(lessonList)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [currentUser])

  const handleDelete = async (id) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا الدرس؟' : 'Are you sure you want to delete this lesson?')) {
      await deleteDoc(doc(db, "lessons", id))
      fetchData()
    }
  }

  const filteredLessons = lessons.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container" style={{ display: 'flex', gap: '30px', padding: '20px 0' }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--primary)' }}>{lang === 'ar' ? 'أرشيف الدروس' : 'Lesson Archive'} 📚</h1>
            <p style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'جميع دروسك المشروحة على السبورة الذكية.' : 'All your lessons explained on the smart board.'}</p>
          </div>
          <button onClick={() => navigate('/lesson')} className="btn-primary" style={{ padding: '12px 25px' }}>
            <Plus size={18} /> {lang === 'ar' ? 'درس جديد' : 'New Lesson'}
          </button>
        </header>

        <div className="glass-morphism" style={{ padding: '15px 25px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Search size={20} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder={lang === 'ar' ? 'ابحث عن درس...' : 'Search lessons...'} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1rem', padding: '10px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {loading ? <p>{t.loading}</p> : filteredLessons.length > 0 ? (
            filteredLessons.map((lesson) => (
              <motion.div key={lesson.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-morphism" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
                    <Book size={24} />
                  </div>
                  <button onClick={() => handleDelete(lesson.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '5px' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{lesson.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <BookOpen size={14} /> {lesson.subject}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={14} /> {lesson.date}
                  </span>
                </div>

                <Link 
                  to="/lesson-summary" 
                  onClick={() => localStorage.setItem('currentLesson', JSON.stringify(lesson))}
                  className="btn-outline" 
                  style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                >
                  {lang === 'ar' ? 'عرض الملخص والسبورة' : 'View Summary & Board'} <ChevronRight size={16} className="rtl-flip" />
                </Link>
              </motion.div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
              <BookOpen size={60} color="var(--text-muted)" style={{ marginBottom: '20px', opacity: 0.3 }} />
              <p style={{ color: 'var(--text-muted)' }}>لا توجد دروس مطابقة للبحث.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Lessons
