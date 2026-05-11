import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Whiteboard from '../components/Whiteboard'
import SpeechRecorder from '../components/SpeechRecorder'
import { Save, FileText, Award, FileDown, ArrowLeft, Smartphone, X, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { db } from '../utils/firebase'
import { collection, addDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { translations } from '../utils/translations'
import { generateQuiz } from '../utils/aiMock'
import { QRCodeSVG } from 'qrcode.react'
import { motion, AnimatePresence } from 'framer-motion'

const Lesson = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [lessonInfo, setLessonInfo] = useState({ title: '', subject: '', grade: '' })
  const [transcript, setTranscript] = useState('')
  const [boardImage, setBoardImage] = useState(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  
  // Quiz Modal State
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [currentQuizId, setCurrentQuizId] = useState(null)
  
  // Remote Mic State
  const [showRemoteMicModal, setShowRemoteMicModal] = useState(false)

  const lang = localStorage.getItem('app-lang') || 'ar'
  const t = translations[lang] || translations['ar']

  // Listen for remote mic transcriptions
  useEffect(() => {
    if (!currentUser) return
    const unsub = onSnapshot(doc(db, "remote_mic", currentUser.uid), (doc) => {
      if (doc.exists() && doc.data().lastSegment) {
        setTranscript(prev => prev + ' ' + doc.data().lastSegment)
      }
    })
    return () => unsub()
  }, [currentUser])

  const handleStartQuiz = async () => {
    if (!transcript) return alert(lang === 'ar' ? 'يرجى تسجيل بعض الشرح أولاً ليتمكن الذكاء الاصطناعي من إنشاء الأسئلة' : 'Please record some explanation first so AI can generate questions')
    
    setLoading(true)
    try {
      const generatedQuestions = generateQuiz(transcript)
      const quizRef = await addDoc(collection(db, "quizzes"), {
        teacherId: currentUser.uid,
        title: lessonInfo.title || (lang === 'ar' ? 'اختبار سريع' : 'Quick Quiz'),
        questions: generatedQuestions,
        status: 'open',
        createdAt: new Date().toISOString()
      })
      setCurrentQuizId(quizRef.id)
      setShowQuizModal(true)
    } catch (err) {
      console.error("Error creating quiz:", err)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!lessonInfo.title) return alert(lang === 'ar' ? 'يرجى إدخال عنوان للدرس' : 'Please enter a lesson title')
    setLoading(true)
    try {
      const lessonData = {
        ...lessonInfo,
        transcript,
        boardImage,
        teacherId: currentUser?.uid || 'anonymous',
        createdAt: new Date().toISOString(),
        date: new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')
      }
      const docRef = await addDoc(collection(db, "lessons"), lessonData)
      localStorage.setItem('currentLesson', JSON.stringify({ ...lessonData, id: docRef.id }))
      navigate('/lesson-summary')
    } catch (err) {
      console.error("Error saving lesson:", err)
    }
    setLoading(false)
  }

  return (
    <div className="lesson-page" style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: isFullScreen ? '0' : '15px', background: 'var(--bg-light)', position: 'relative' }}>
      
      {/* Top Header */}
      {!isFullScreen && (
        <header className="glass-morphism" style={{ padding: '12px 25px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
              <ArrowLeft size={24} className="rtl-flip" />
            </button>
            <input 
              type="text" 
              placeholder={lang === 'ar' ? "أدخل عنوان الدرس..." : "Enter lesson title..."}
              value={lessonInfo.title}
              onChange={(e) => setLessonInfo({...lessonInfo, title: e.target.value})}
              style={{ border: 'none', borderBottom: '2px solid var(--primary)', padding: '5px 10px', fontSize: '1.2rem', fontWeight: 'bold', background: 'transparent', color: 'var(--text-dark)', outline: 'none', width: '300px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button className="btn-primary" onClick={handleSave} disabled={loading}>
              <Save size={20} /> {loading ? t.loading : (lang === 'ar' ? 'حفظ وإنهاء الحصة' : 'Save & Finish')}
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, gap: '15px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ flex: 1, height: '100%', position: 'relative' }}>
          <Whiteboard 
            onSave={setBoardImage} 
            isFullScreen={isFullScreen} 
            toggleFullScreen={() => setIsFullScreen(!isFullScreen)}
            isListening={isListening}
            toggleMic={() => setIsListening(!isListening)}
          />
        </div>

        {!isFullScreen && (
          <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="glass-morphism" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', fontWeight: 'bold' }}>
                <FileText size={20} /> {lang === 'ar' ? 'مسجل الشرح الذكي' : 'Smart Recorder'}
              </h3>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <SpeechRecorder 
                  onTranscriptUpdate={setTranscript} 
                  externalListening={isListening}
                  setExternalListening={setIsListening}
                />
              </div>
              
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button className="btn-outline" onClick={() => setShowRemoteMicModal(true)} style={{ justifyContent: 'center' }}>
                  <Smartphone size={18} /> {lang === 'ar' ? 'استخدام الهاتف كمايك' : 'Use Phone as Mic'}
                </button>
                <button className="btn-primary" onClick={handleStartQuiz} style={{ justifyContent: 'center', background: 'var(--secondary)' }}>
                  <Award size={18} /> {lang === 'ar' ? 'بدء كويز تفاعلي' : 'Start Live Quiz'}
                </button>
              </div>
            </div>

            <div className="glass-morphism" style={{ padding: '20px' }}>
              <input 
                type="text" 
                placeholder={lang === 'ar' ? "المادة" : "Subject"}
                value={lessonInfo.subject}
                onChange={(e) => setLessonInfo({...lessonInfo, subject: e.target.value})}
                style={{ width: '100%', padding: '12px', marginBottom: '10px' }}
              />
              <select 
                style={{ width: '100%', padding: '12px' }}
                value={lessonInfo.grade}
                onChange={(e) => setLessonInfo({...lessonInfo, grade: e.target.value})}
              >
                <option value="">{lang === 'ar' ? 'اختر الصف' : 'Select Grade'}</option>
                <option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* QUIZ MODAL */}
      <AnimatePresence>
        {showQuizModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-morphism" style={{ width: '100%', maxWidth: '500px', padding: '40px', textAlign: 'center', background: 'var(--white)' }}>
              <button onClick={() => setShowQuizModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)' }}><X size={24} /></button>
              <Award size={50} color="var(--secondary)" style={{ marginBottom: '20px' }} />
              <h2 style={{ marginBottom: '15px' }}>{lang === 'ar' ? 'الاختبار جاهز!' : 'Quiz is Ready!'}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>{lang === 'ar' ? 'اطلب من الطلاب مسح الباركود بهواتفهم للدخول بالاسم الحقيقي' : 'Ask students to scan the QR code to join with their real names'}</p>
              
              <div style={{ background: 'white', padding: '20px', borderRadius: '20px', display: 'inline-block', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <QRCodeSVG value={`${window.location.origin}/quiz/${currentQuizId}`} size={250} />
              </div>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={() => setShowQuizModal(false)} className="btn-outline" style={{ flex: 1, justifyContent: 'center' }}>{lang === 'ar' ? 'إغلاق' : 'Close'}</button>
                <button onClick={() => navigate(`/quiz-monitor/${currentQuizId}`)} className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'var(--secondary)' }}>
                   {lang === 'ar' ? 'مراقبة النتائج' : 'Monitor Results'} <ExternalLink size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REMOTE MIC MODAL */}
      <AnimatePresence>
        {showRemoteMicModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-morphism" style={{ width: '100%', maxWidth: '500px', padding: '40px', textAlign: 'center', background: 'var(--white)' }}>
              <button onClick={() => setShowRemoteMicModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)' }}><X size={24} /></button>
              <Smartphone size={50} color="var(--primary)" style={{ marginBottom: '20px' }} />
              <h2 style={{ marginBottom: '15px' }}>{lang === 'ar' ? 'استخدم هاتفك كمايكروفون' : 'Use Phone as Microphone'}</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>{lang === 'ar' ? 'امسح الباركود بهاتفك ليصبح هو المايكروفون الخاص بالدرس' : 'Scan this QR code with your phone to turn it into your lesson microphone'}</p>
              
              <div style={{ background: 'white', padding: '20px', borderRadius: '20px', display: 'inline-block', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <QRCodeSVG value={`${window.location.origin}/remote-mic/${currentUser.uid}`} size={250} />
              </div>
              
              <button onClick={() => setShowRemoteMicModal(false)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>{lang === 'ar' ? 'تم، العودة للسبورة' : 'Done, Back to Board'}</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Lesson
