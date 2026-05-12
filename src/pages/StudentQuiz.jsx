import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../utils/firebase'
import { doc, collection, addDoc, onSnapshot, updateDoc, query, where, getDocs } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Send, User, AlertTriangle, Trophy, Star } from 'lucide-react'

const StudentQuiz = () => {
  const { quizId } = useParams()
  const [quiz, setQuiz] = useState(null)
  const [studentName, setStudentName] = useState('')
  const [step, setStep] = useState('name') 
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [finalResult, setFinalResult] = useState(null)
  const [responseId, setResponseId] = useState(null)

  useEffect(() => {
    if (step !== 'quiz' || !responseId) return
    const handleVisibilityChange = () => { if (document.hidden) handleCheating('الخروج من الصفحة') }
    const handleBlur = () => { handleCheating('فتح نافذة أخرى') }
    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
    }
  }, [step, responseId])

  useEffect(() => {
    if (!quizId) return
    
    // Sync Quiz
    const unsubQuiz = onSnapshot(doc(db, "quizzes", quizId), (docSnap) => {
      if (docSnap.exists()) setQuiz(docSnap.data())
    })

    return () => unsubQuiz()
  }, [quizId])

  // Listen for "Unlocking" by teacher
  useEffect(() => {
    if (!responseId || !quizId) return
    const unsubResp = onSnapshot(doc(db, `quizzes/${quizId}/responses`, responseId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data.status === 'active' && step === 'cheated') {
          setStep('quiz') // Resumed by teacher!
          alert('لقد منحك المعلم فرصة ثانية. يرجى عدم مغادرة الصفحة مرة أخرى!')
        }
      }
    })
    return () => unsubResp()
  }, [responseId, quizId, step])

  const handleCheating = async (reason) => {
    setStep('cheated')
    if (responseId) {
      await updateDoc(doc(db, `quizzes/${quizId}/responses`, responseId), {
        status: 'cheated',
        cheatReason: reason,
        cheatCount: (quiz?.cheatCount || 0) + 1
      })
    }
  }

  const handleStart = async () => {
    if (!studentName.trim()) return
    
    // Create initial response doc
    const respRef = await addDoc(collection(db, `quizzes/${quizId}/responses`), {
      studentName,
      answers: {},
      status: 'active',
      timestamp: new Date().toISOString()
    })
    setResponseId(respRef.id)
    setStep('quiz')
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    let score = 0
    quiz.questions.forEach((q, i) => {
      if (q.type !== 'text' && answers[i] === q.correctAnswer) {
        score += (parseInt(q.points) || 1)
      }
    })

    const totalPoints = quiz.questions.reduce((acc, q) => acc + (parseInt(q.points) || 0), 0)
    
    try {
      await updateDoc(doc(db, `quizzes/${quizId}/responses`, responseId), {
        answers,
        status: 'completed',
        score,
        totalPoints,
        completedAt: new Date().toISOString()
      })
      setFinalResult({ score, totalPoints })
      setStep('done')
    } catch (err) { console.error(err) }
    setSubmitting(false)
  }

  if (step === 'cheated') return (
    <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
      <AlertTriangle size={60} color="#ff4444" style={{ marginBottom: '20px' }} />
      <h2 style={{ color: '#ff4444', fontSize: '1.5rem' }}>⚠️ تم قفل الامتحان!</h2>
      <p style={{ fontSize: '1.1rem', margin: '20px 0' }}>لقد حاولت الغش بمغادرة الصفحة. تم إرسال تنبيه للمعلم.</p>
      <div className="glass-morphism" style={{ padding: '20px', background: 'rgba(255,68,68,0.05)', fontSize: '0.95rem' }}>
        انتظر المعلم ليعطيك "فرصة ثانية" إذا وافق على ذلك. ستفتح الصفحة تلقائياً عند فك القفل.
      </div>
    </div>
  )

  return (
    <div className="student-quiz-page" style={{ minHeight: '100vh', background: 'white', padding: '20px' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <AnimatePresence mode="wait">
          {step === 'name' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-morphism" style={{ padding: '30px 20px', textAlign: 'center', background: 'white', boxShadow: 'none', border: '1px solid #eee' }}>
              <User size={40} color="var(--primary)" style={{ marginBottom: '15px' }} />
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)' }}>{quiz?.title}</h2>
              <div style={{ margin: '20px 0', padding: '12px', background: '#fff9f0', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                نظام التصحيح التلقائي مفعل. ستظهر نتيجتك فور الانتهاء.
              </div>
              <input type="text" placeholder="اسمك الكامل..." value={studentName} onChange={(e) => setStudentName(e.target.value)} style={{ width: '100%', padding: '12px', textAlign: 'center', marginBottom: '20px', fontSize: '1.1rem', background: '#f9f9f9', border: '1px solid #ddd' }} />
              <button className="btn-primary" style={{ width: '100%', padding: '16px' }} onClick={handleStart} disabled={!studentName.trim()}>دخول الامتحان</button>
            </motion.div>
          )}

          {step === 'quiz' && quiz && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="quiz-content">
              {quiz.questions.map((q, i) => (
                <div key={i} className="glass-morphism" style={{ padding: '25px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <span style={{ fontWeight: 'bold' }}>سؤال {i+1}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{q.points} درجة</span>
                  </div>
                  <h3 style={{ marginBottom: '20px' }}>{q.question}</h3>
                  {/* ... choice/tf/text logic same as before ... */}
                  {q.type === 'choice' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {q.options.map((opt, oi) => (
                        <button key={oi} onClick={() => setAnswers({...answers, [i]: opt})} style={{ padding: '15px', borderRadius: '12px', border: answers[i] === opt ? '2px solid var(--primary)' : '1px solid var(--border-color)', background: answers[i] === opt ? 'rgba(59, 130, 246, 0.05)' : 'white', textAlign: 'right', cursor: 'pointer' }}>{opt}</button>
                      ))}
                    </div>
                  )}
                  {q.type === 'tf' && (
                    <div style={{ display: 'flex', gap: '15px' }}>
                      {['صح', 'خطأ'].map(opt => (
                        <button key={opt} onClick={() => setAnswers({...answers, [i]: opt})} style={{ flex: 1, padding: '20px', borderRadius: '15px', border: answers[i] === opt ? `2px solid ${opt === 'صح' ? '#10b981' : '#ff4444'}` : '1px solid #ccc', background: answers[i] === opt ? (opt === 'صح' ? '#e8f5e9' : '#ffebee') : 'white', fontWeight: 'bold' }}>{opt}</button>
                      ))}
                    </div>
                  )}
                  {q.type === 'text' && (
                    <textarea maxLength={150} placeholder="اكتب إجابتك هنا..." value={answers[i] || ''} onChange={(e) => setAnswers({...answers, [i]: e.target.value})} style={{ width: '100%', height: '120px', padding: '15px' }} />
                  )}
                </div>
              ))}
              <button className="btn-primary" style={{ width: '100%', padding: '20px' }} onClick={handleSubmit} disabled={submitting}>{submitting ? 'جاري التصحيح...' : 'إنهاء وتصحيح تلقائي'}</button>
            </motion.div>
          )}

          {step === 'done' && finalResult && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-morphism" style={{ padding: '40px 20px', textAlign: 'center' }}>
              <Trophy size={60} color="#f59e0b" style={{ marginBottom: '20px' }} />
              <h2 style={{ marginBottom: '10px', fontSize: '1.5rem' }}>مبروك يا {studentName}!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '0.95rem' }}>لقد أتممت الاختبار بنجاح. إليك نتيجتك:</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', background: 'rgba(59, 130, 246, 0.1)', padding: '20px 30px', borderRadius: '20px', border: '2px solid var(--primary)', margin: '0 auto', maxWidth: '250px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>الدرجة النهائية</span>
                <span style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary)' }}>{finalResult.score} / {finalResult.totalPoints}</span>
              </div>
              
              <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '5px' }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={24} fill={s <= (finalResult.score/finalResult.totalPoints * 5) ? "#f59e0b" : "none"} color="#f59e0b" />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default StudentQuiz
