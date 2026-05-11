import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { generateAISummary, generateQuiz } from '../utils/aiMock'
import { FileDown, Share2, ArrowRight, Printer, CheckCircle2, MessageSquare, ListTodo, QrCode } from 'lucide-react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'

const LessonSummary = () => {
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [summary, setSummary] = useState('')
  const [quiz, setQuiz] = useState([])
  const [exporting, setExporting] = useState(false)
  const reportRef = useRef(null)

  const lang = localStorage.getItem('app-lang') || 'ar'

  useEffect(() => {
    const savedLesson = localStorage.getItem('currentLesson')
    if (savedLesson) {
      const data = JSON.parse(savedLesson)
      setLesson(data)
      setSummary(generateAISummary(data.transcript))
      setQuiz(generateQuiz(data.transcript))
    } else {
      navigate('/dashboard')
    }
  }, [navigate])

  const exportPDF = async () => {
    if (!reportRef.current) return
    setExporting(true)
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: lang === 'ar' ? '#ffffff' : null
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${lesson?.title || 'lesson'}-hissati-ai.pdf`)
    } catch (err) {
      console.error("PDF Export failed:", err)
    }
    setExporting(false)
  }

  if (!lesson) return <div className="container" style={{ padding: '100px', textAlign: 'center' }}>{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>

  return (
    <div className="container section-padding">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: 'var(--primary)', marginBottom: '10px' }}>
            <ArrowRight size={18} className="rtl-flip" /> {lang === 'ar' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
          </Link>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-dark)' }}>{lang === 'ar' ? 'ملخص الحصة الذكي' : 'Smart Lesson Summary'}</h1>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn-outline" onClick={() => window.print()}>
            <Printer size={18} /> {lang === 'ar' ? 'طباعة' : 'Print'}
          </button>
          <button className="btn-primary" onClick={exportPDF} disabled={exporting}>
            <FileDown size={18} /> {exporting ? (lang === 'ar' ? 'جاري التصدير...' : 'Exporting...') : (lang === 'ar' ? 'تصدير PDF' : 'Export PDF')}
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Main Report Area (This is what gets exported to PDF) */}
        <div ref={reportRef} className="glass-morphism" style={{ padding: '40px', background: 'white', color: '#1a1a1a' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #f0f0f0', paddingBottom: '20px' }}>
            <img src="/Logo.png" alt="Logo" style={{ width: '60px', marginBottom: '10px' }} />
            <h2 style={{ fontSize: '1.8rem', color: '#003366' }}>حصتي AI - تقرير درس رقمي</h2>
            <p style={{ color: '#666' }}>{lesson.date} | {lesson.subject} | {lesson.grade}</p>
          </div>

          <section style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#003366', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={22} color="#00cc66" /> {lang === 'ar' ? 'مخرجات السبورة الذكية' : 'Whiteboard Output'}
            </h3>
            {lesson.boardImage ? (
              <img src={lesson.boardImage} alt="Board" style={{ width: '100%', borderRadius: '15px', border: '1px solid #eee', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }} />
            ) : (
              <div style={{ padding: '40px', background: '#f9f9f9', borderRadius: '15px', textAlign: 'center', color: '#999' }}>لم يتم حفظ صورة للسبورة</div>
            )}
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '1.4rem', color: '#003366', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={22} color="#3b82f6" /> {lang === 'ar' ? 'تلخيص الذكاء الاصطناعي للشرح' : 'AI Content Summary'}
            </h3>
            <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '15px', lineHeight: '1.8', fontSize: '1.1rem', whiteSpace: 'pre-line' }}>
              {summary}
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: '1.4rem', color: '#003366', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ListTodo size={22} color="#f59e0b" /> {lang === 'ar' ? 'الأسئلة المقترحة (Quiz)' : 'Suggested Quiz Questions'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {quiz.map((q, i) => (
                <div key={i} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>{i+1}. {q.question}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {q.options.map((opt, oi) => (
                      <div key={oi} style={{ fontSize: '0.9rem', color: '#64748b', padding: '5px 10px', background: '#f1f5f9', borderRadius: '6px' }}>{opt}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '0.8rem', color: '#999' }}>
            تم إنشاء هذا التقرير بواسطة منصة حصتي AI - جميع الحقوق محفوظة لعام 2026
          </div>
        </div>

        {/* Sidebar Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-morphism" style={{ padding: '25px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '15px' }}>{lang === 'ar' ? 'مشاركة مع الطلاب' : 'Share with Students'}</h3>
            <div style={{ background: 'white', padding: '15px', borderRadius: '15px', display: 'inline-block', marginBottom: '15px' }}>
              <QRCodeSVG value={`https://hissati-ai.web.app/lesson/${lesson.id}`} size={150} />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lang === 'ar' ? 'امسح الكود لعرض الدرس على الهواتف' : 'Scan to view on mobile'}</p>
            <button className="btn-outline" style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}>
              <Share2 size={18} /> {lang === 'ar' ? 'نسخ رابط الدرس' : 'Copy Lesson Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonSummary
