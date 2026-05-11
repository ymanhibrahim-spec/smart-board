import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { db } from '../utils/firebase'
import { doc, onSnapshot, collection, updateDoc, query, orderBy } from 'firebase/firestore'
import { Users, CheckCircle, XCircle, ArrowRight, Play, Square, Eye, EyeOff, MessageSquare, Trophy, ShieldAlert, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const QuizMonitor = () => {
  const { quizId } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [responses, setResponses] = useState([])
  const [showAnswers, setShowAnswers] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    if (!quizId) return
    const unsubQuiz = onSnapshot(doc(db, "quizzes", quizId), (docSnap) => {
      if (docSnap.exists()) setQuiz({ id: docSnap.id, ...docSnap.data() })
    })

    // Sort responses by score desc and then by time
    const unsubResp = onSnapshot(collection(db, `quizzes/${quizId}/responses`), (snapshot) => {
      const respList = []
      snapshot.forEach(docSnap => respList.push({ id: docSnap.id, ...docSnap.data() }))
      setResponses(respList)
    })

    return () => { unsubQuiz(); unsubResp(); }
  }, [quizId])

  const unlockStudent = async (respId) => {
    await updateDoc(doc(db, `quizzes/${quizId}/responses`, respId), {
      status: 'active',
      reason: 'عفو من المعلم'
    })
    alert('تم فك القفل عن الطالب بنجاح!')
  }

  // Analytics Calculations
  const completed = responses.filter(r => r.status === 'completed')
  const cheated = responses.filter(r => r.status === 'cheated')
  const avgScore = completed.length > 0 
    ? (completed.reduce((acc, r) => acc + (r.score || 0), 0) / completed.length).toFixed(1)
    : 0

  const leaderboard = [...completed].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5)

  if (!quiz) return <div className="container section-padding">جاري التحميل...</div>

  return (
    <div className="container section-padding">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <Link to="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ArrowRight size={18} className="rtl-flip" /> لوحة التحكم
          </Link>
          <h1 style={{ fontSize: '1.8rem' }}>مراقبة حية: {quiz.title}</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={() => updateDoc(doc(db, "quizzes", quizId), { status: quiz.status === 'open' ? 'closed' : 'open' })} style={{ background: quiz.status === 'open' ? '#ff4444' : '#00cc66' }}>
            {quiz.status === 'open' ? 'إغلاق الامتحان' : 'فتح الامتحان'}
          </button>
        </div>
      </header>

      {/* Top Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        {[
          { label: 'إجمالي الطلاب', value: responses.length, icon: <Users />, color: '#3b82f6' },
          { label: 'مكتمل', value: completed.length, icon: <CheckCircle />, color: '#10b981' },
          { label: 'محاولات غش', value: cheated.length, icon: <ShieldAlert />, color: '#ff4444' },
          { label: 'متوسط الدرجات', value: `${avgScore} / ${quiz.totalPoints || 0}`, icon: <Trophy />, color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={i} className="glass-morphism" style={{ padding: '20px', textAlign: 'center', borderBottom: `4px solid ${stat.color}` }}>
            <div style={{ color: stat.color, marginBottom: '10px' }}>{stat.icon}</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</p>
            <h3 style={{ fontSize: '1.5rem' }}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
        {/* Main Students List */}
        <div className="glass-morphism" style={{ padding: '25px' }}>
          <h3 style={{ marginBottom: '20px' }}>قائمة الطلاب والنتائج المباشرة</h3>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '15px' }}>الطالب</th>
                  <th style={{ padding: '15px' }}>النتيجة</th>
                  <th style={{ padding: '15px' }}>الحالة</th>
                  <th style={{ padding: '15px' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {responses.map((res) => (
                  <tr key={res.id} style={{ borderBottom: '1px solid var(--border-color)', background: res.status === 'cheated' ? 'rgba(255,68,68,0.05)' : 'transparent' }}>
                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{res.studentName}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{res.score || 0}</span> / {quiz.totalPoints || 0}
                    </td>
                    <td style={{ padding: '15px' }}>
                      {res.status === 'cheated' ? (
                        <span style={{ color: '#ff4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <ShieldAlert size={14} /> محاولة غش
                        </span>
                      ) : res.status === 'completed' ? (
                        <span style={{ color: '#00cc66' }}>✓ اكتمل</span>
                      ) : (
                        <span style={{ color: '#3b82f6' }}>جاري الحل...</span>
                      )}
                    </td>
                    <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                      {res.status === 'cheated' && (
                        <button onClick={() => unlockStudent(res.id)} className="btn-outline" style={{ padding: '5px 10px', fontSize: '0.75rem', borderColor: '#10b981', color: '#10b981' }}>
                          <RotateCcw size={14} /> عفو/فك قفل
                        </button>
                      )}
                      <button onClick={() => setSelectedStudent(res)} className="btn-outline" style={{ padding: '5px 10px', fontSize: '0.75rem' }}>التفاصيل</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: Leaderboard & Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-morphism" style={{ padding: '25px', background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.1) 0%, transparent 100%)' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b' }}>
              <Trophy size={20} /> لوحة المتصدرين (Top 5)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaderboard.map((r, i) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: i===0 ? '#f59e0b' : '#eee', color: i===0 ? 'white' : 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{i+1}</span>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{r.studentName}</span>
                  </div>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{r.score}</span>
                </div>
              ))}
              {leaderboard.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>في انتظار النتائج...</p>}
            </div>
          </div>

          <div className="glass-morphism" style={{ padding: '25px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1rem' }}>معاينة سريعة للإجابة</h3>
            {selectedStudent ? (
              <div style={{ fontSize: '0.85rem' }}>
                <p style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '10px' }}>الطالب: {selectedStudent.studentName}</p>
                {quiz.questions.slice(0, 3).map((q, i) => (
                  <div key={i} style={{ marginBottom: '10px', borderBottom: '1px solid var(--border-color)', pb: '5px' }}>
                    <p style={{ fontWeight: 'bold' }}>{q.question}</p>
                    <p style={{ color: selectedStudent.answers[i] === q.correctAnswer ? '#00cc66' : '#ff4444' }}>{selectedStudent.answers[i] || 'لم يجب'}</p>
                  </div>
                ))}
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>... اضغط "التفاصيل" لرؤية المزيد</p>
              </div>
            ) : <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>اختر طالباً للمعاينة</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizMonitor
