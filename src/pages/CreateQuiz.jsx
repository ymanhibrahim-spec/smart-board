import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../utils/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Plus, Trash2, Save, Sparkles, ShieldCheck, Type, List, CheckCircle, HelpCircle, X, ExternalLink, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'

const CreateQuiz = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState([
    { type: 'choice', question: '', options: ['', '', '', ''], correctAnswer: '', points: 1 }
  ])
  const [loading, setLoading] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishedQuiz, setPublishedQuiz] = useState(null)

  const addQuestion = (type = 'choice') => {
    let newQ = { type, question: '', options: [], correctAnswer: '', points: 1 }
    if (type === 'choice') newQ.options = ['', '', '', '']
    if (type === 'tf') newQ.options = ['صح', 'خطأ']
    setQuestions([...questions, newQ])
  }

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions]
    newQuestions[index][field] = value
    setQuestions(newQuestions)
  }

  const handleSave = async () => {
    if (!title) return alert('يرجى إدخال عنوان للاختبار')
    setLoading(true)
    const shortCode = Math.floor(100000 + Math.random() * 900000).toString()
    try {
      const docRef = await addDoc(collection(db, "quizzes"), {
        teacherId: currentUser.uid,
        title,
        questions,
        status: 'open',
        type: 'formal',
        shortCode: shortCode,
        totalPoints: questions.reduce((acc, q) => acc + (parseInt(q.points) || 0), 0),
        createdAt: new Date().toISOString()
      })
      setPublishedQuiz({ id: docRef.id, title, shortCode })
      setShowPublishModal(true)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  return (
    <div className="container section-padding">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
            <ArrowLeft size={24} className="rtl-flip" />
          </button>
          <h1 style={{ fontSize: '2rem' }}>تصميم الامتحان الذكي</h1>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={loading} style={{ padding: '12px 40px' }}>
          <Save size={18} /> {loading ? 'جاري الحفظ...' : 'نشر وتصحيح تلقائي'}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input 
            type="text" 
            placeholder="عنوان الامتحان..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="glass-morphism"
            style={{ width: '100%', padding: '20px', fontSize: '1.4rem', border: 'none' }}
          />

          {questions.map((q, qIndex) => (
            <motion.div key={qIndex} className="glass-morphism" style={{ padding: '30px', position: 'relative', borderRight: `8px solid ${q.type === 'tf' ? '#10b981' : q.type === 'text' ? '#f59e0b' : '#3b82f6'}` }}>
              <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.05)', padding: '5px 10px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.8rem' }}>الدرجة:</span>
                  <input 
                    type="number" 
                    value={q.points} 
                    onChange={(e) => handleQuestionChange(qIndex, 'points', e.target.value)}
                    style={{ width: '40px', border: 'none', background: 'transparent', textAlign: 'center', fontWeight: 'bold' }}
                  />
                </div>
                <button onClick={() => removeQuestion(qIndex)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}><Trash2 size={20} /></button>
              </div>

              <h3 style={{ marginBottom: '20px', color: 'var(--primary)' }}>سؤال {qIndex + 1} ({q.type === 'choice' ? 'اختيارات' : q.type === 'tf' ? 'صح وخطأ' : 'مقالي'})</h3>
              <textarea 
                placeholder="نص السؤال..."
                value={q.question}
                onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                style={{ width: '100%', padding: '15px', height: '80px', marginBottom: '20px' }}
              />
              
              {q.type === 'choice' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input type="radio" name={`correct-${qIndex}`} checked={q.correctAnswer === opt && opt !== ''} onChange={() => handleQuestionChange(qIndex, 'correctAnswer', opt)} />
                      <input type="text" placeholder={`خيار ${oIndex + 1}`} value={opt} onChange={(e) => {
                        const newQuestions = [...questions]; newQuestions[qIndex].options[oIndex] = e.target.value; setQuestions(newQuestions);
                      }} style={{ flex: 1, padding: '10px' }} />
                    </div>
                  ))}
                </div>
              )}

              {q.type === 'tf' && (
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                  {['صح', 'خطأ'].map(opt => (
                    <button key={opt} onClick={() => handleQuestionChange(qIndex, 'correctAnswer', opt)} style={{ padding: '10px 40px', borderRadius: '12px', border: q.correctAnswer === opt ? '2px solid #10b981' : '1px solid #ccc', background: q.correctAnswer === opt ? '#e8f5e9' : 'white', cursor: 'pointer', fontWeight: 'bold' }}>{opt}</button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}

          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => addQuestion('choice')} className="btn-outline" style={{ flex: 1 }}><List size={18} /> اختيارات</button>
            <button onClick={() => addQuestion('tf')} className="btn-outline" style={{ flex: 1 }}><CheckCircle size={18} /> صح وخطأ</button>
            <button onClick={() => addQuestion('text')} className="btn-outline" style={{ flex: 1 }}><Type size={18} /> مقالي</button>
          </div>
        </div>

        <aside>
          <div className="glass-morphism" style={{ padding: '25px', position: 'sticky', top: '20px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Trophy size={22} color="var(--primary)" /> مجموع الدرجات</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)', textAlign: 'center', marginBottom: '20px' }}>
              {questions.reduce((acc, q) => acc + (parseInt(q.points) || 0), 0)}
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />
            <h4 style={{ marginBottom: '15px' }}><ShieldCheck size={18} color="#00cc66" /> الأنظمة المفعلة:</h4>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>✓ التصحيح التلقائي للاختيارات</li>
              <li>✓ حماية الغش مع خيار "العفو"</li>
              <li>✓ لوحة متصدرين حية للطلاب</li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Modal is the same but with the new features */}
      <AnimatePresence>
        {showPublishModal && publishedQuiz && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-morphism" style={{ width: '100%', maxWidth: '600px', padding: '50px', textAlign: 'center', background: 'white' }}>
              <button onClick={() => navigate('/dashboard')} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-dark)' }}><X size={24} /></button>
              <h1 style={{ fontSize: '2rem', marginBottom: '30px', color: 'var(--primary)' }}>الامتحان جاهز للانطلاق!</h1>
              <div style={{ background: 'white', padding: '20px', borderRadius: '25px', display: 'inline-block', marginBottom: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                <QRCodeSVG value={`${window.location.origin}/quiz/${publishedQuiz.id}`} size={280} />
              </div>
              <div style={{ marginBottom: '30px' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>رقم الانضمام السريع:</p>
                <div style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '10px', color: 'var(--secondary)' }}>{publishedQuiz.shortCode}</div>
              </div>
              <button onClick={() => navigate(`/quiz-monitor/${publishedQuiz.id}`)} className="btn-primary" style={{ width: '100%', padding: '18px', fontSize: '1.2rem', background: 'var(--secondary)' }}>بدء مراقبة الطلاب والنتائج</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CreateQuiz
