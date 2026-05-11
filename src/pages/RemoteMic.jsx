import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../utils/firebase'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { Mic, MicOff, Smartphone, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const RemoteMic = () => {
  const { teacherId } = useParams()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recognition, setRecognition] = useState(null)
  const isListeningRef = useRef(false)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = false
      rec.lang = 'ar-SA'

      rec.onresult = async (event) => {
        const lastIndex = event.results.length - 1
        const segment = event.results[lastIndex][0].transcript
        setTranscript(segment)
        
        // Send this segment to the teacher's session in Firestore
        if (teacherId) {
          await setDoc(doc(db, "remote_mic", teacherId), {
            lastSegment: segment,
            timestamp: new Date().toISOString()
          })
        }
      }

      rec.onend = () => {
        if (isListeningRef.current) {
          try { rec.start() } catch (e) {}
        }
      }

      setRecognition(rec)
    }

    // Cleanup on unmount
    return () => {
      if (teacherId) deleteDoc(doc(db, "remote_mic", teacherId))
    }
  }, [teacherId])

  const toggleMic = () => {
    if (!recognition) return
    if (!isListening) {
      isListeningRef.current = true
      recognition.start()
    } else {
      isListeningRef.current = false
      recognition.stop()
    }
    setIsListening(!isListening)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--primary)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-morphism" style={{ padding: '40px', background: 'rgba(255,255,255,0.1)', border: 'none', width: '100%', maxWidth: '400px' }}>
        <Smartphone size={60} style={{ marginBottom: '20px' }} />
        <h1 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>مايكروفون حصتي AI</h1>
        <p style={{ opacity: 0.8, marginBottom: '40px', fontSize: '0.9rem' }}>هاتفك الآن مرتبط بالسبورة الذكية. كل ما تقوله سيظهر هناك مباشرة.</p>

        <button 
          onClick={toggleMic}
          style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            background: isListening ? '#ff4444' : 'white',
            color: isListening ? 'white' : 'var(--primary)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 30px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            transition: '0.3s'
          }}
        >
          {isListening ? <MicOff size={40} /> : <Mic size={40} />}
        </button>

        <div style={{ minHeight: '50px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', fontSize: '1.1rem' }}>
          {isListening ? (transcript || 'جاري الاستماع...') : 'اضغط على الزر للبدء'}
        </div>

        {isListening && (
          <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ marginTop: '20px', color: '#00cc66', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <CheckCircle size={18} /> متصل بالسبورة الآن
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default RemoteMic
