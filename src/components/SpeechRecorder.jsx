import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff } from 'lucide-react'

const SpeechRecorder = ({ onTranscriptUpdate, externalListening, setExternalListening }) => {
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const [recognition, setRecognition] = useState(null)
  
  // Use a ref to track listening state to avoid stale closure issues
  const isListeningRef = useRef(false)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'ar-SA'

      rec.onresult = (event) => {
        let currentTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript
        }
        setTranscript(currentTranscript)
        if (onTranscriptUpdate) onTranscriptUpdate(currentTranscript)
      }

      rec.onerror = (event) => {
        if (event.error === 'no-speech') return
        setError('حدث خطأ: ' + event.error)
        setExternalListening(false)
        isListeningRef.current = false
      }

      rec.onend = () => {
        if (isListeningRef.current) {
          try { rec.start() } catch (e) {}
        }
      }

      setRecognition(rec)
    }
  }, [])

  // Sync internal ref with external prop
  useEffect(() => {
    if (!recognition) return
    
    if (externalListening && !isListeningRef.current) {
      isListeningRef.current = true
      recognition.start()
    } else if (!externalListening && isListeningRef.current) {
      isListeningRef.current = false
      recognition.stop()
    }
  }, [externalListening, recognition])

  const toggleListening = () => {
    setExternalListening(!externalListening)
  }

  return (
    <div className="speech-recorder" style={{ padding: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
        <button 
          onClick={toggleListening}
          style={{ 
            background: externalListening ? '#ff4444' : 'var(--primary)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 'bold',
            transition: '0.3s',
            boxShadow: externalListening ? '0 0 15px rgba(255,68,68,0.4)' : 'none'
          }}
        >
          {externalListening ? <MicOff size={20} /> : <Mic size={20} />}
          {externalListening ? 'إيقاف التسجيل' : 'بدء التسجيل الصوتي'}
        </button>
      </div>

      {error && <p style={{ color: '#ff4444', fontSize: '0.85rem' }}>{error}</p>}
      
      <div style={{ 
        background: 'rgba(0,0,0,0.02)', 
        padding: '15px', 
        borderRadius: '12px', 
        minHeight: '80px', 
        maxHeight: '150px', 
        overflowY: 'auto',
        fontSize: '0.95rem',
        border: '1px solid var(--border-color)',
        color: transcript ? 'var(--text-dark)' : 'var(--text-muted)'
      }}>
        {transcript || 'سيظهر النص المحول من الصوت هنا...'}
      </div>
    </div>
  )
}

export default SpeechRecorder
