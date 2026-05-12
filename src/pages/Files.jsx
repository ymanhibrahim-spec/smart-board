import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import { FileText, Download, Eye, Image as ImageIcon, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { db } from '../utils/firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { translations } from '../utils/translations'

const Files = () => {
  const { currentUser } = useAuth()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  
  const lang = localStorage.getItem('app-lang') || 'ar'
  const t = translations[lang]

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return
      try {
        const qL = query(collection(db, "lessons"), where("teacherId", "==", currentUser.uid), orderBy("createdAt", "desc"))
        const snapL = await getDocs(qL)
        const fileList = []
        snapL.forEach((doc) => {
          const data = doc.data()
          if (data.whiteboardImage) {
            fileList.push({
              id: doc.id,
              title: data.title,
              date: data.date,
              url: data.whiteboardImage,
              type: 'image'
            })
          }
        })
        setFiles(fileList)
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    fetchData()
  }, [currentUser])

  const downloadFile = (url, name) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `${name}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container" style={{ display: 'flex', gap: '30px', padding: '20px 0' }}>
      <Sidebar />
      <div className="main-content" style={{ flex: 1 }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--primary)' }}>{lang === 'ar' ? 'مكتبة الملفات' : 'File Library'} 📁</h1>
          <p style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'جميع لقطات السبورة والملفات المحفوظة.' : 'All whiteboard captures and saved files.'}</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {loading ? <p>{t.loading}</p> : files.length > 0 ? (
            files.map((file) => (
              <motion.div key={file.id} whileHover={{ scale: 1.02 }} className="glass-morphism" style={{ padding: '15px', overflow: 'hidden' }}>
                <div 
                  onClick={() => setSelectedImage(file.url)}
                  style={{ 
                    height: '140px', 
                    background: '#f0f0f0', 
                    borderRadius: '12px', 
                    marginBottom: '12px', 
                    cursor: 'pointer',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <img src={file.url} alt={file.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', opacity: 0, transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => e.currentTarget.style.opacity = 0}>
                    <Eye color="white" />
                  </div>
                </div>
                
                <h4 style={{ fontSize: '0.9rem', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.title}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{file.date}</p>
                
                <button 
                  onClick={() => downloadFile(file.url, file.title)}
                  className="btn-outline" 
                  style={{ width: '100%', padding: '8px', fontSize: '0.8rem', justifyContent: 'center', gap: '5px' }}
                >
                  <Download size={14} /> {lang === 'ar' ? 'تحميل' : 'Download'}
                </button>
              </motion.div>
            ))
          ) : <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>لا توجد ملفات حالياً.</p>}
        </div>

        {/* Image Preview Modal */}
        {selectedImage && (
          <div 
            onClick={() => setSelectedImage(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}
          >
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              src={selectedImage} 
              style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '15px', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }} 
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Files
