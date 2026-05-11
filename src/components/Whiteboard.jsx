import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Pencil, Eraser, RotateCcw, RotateCw, Trash2, Download, Grid, Maximize2, Minimize2, Mic, MicOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Whiteboard = ({ onSave, isFullScreen, toggleFullScreen, isListening, toggleMic }) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [ctx, setCtx] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(6)
  const [tool, setTool] = useState('pen') 
  const [history, setHistory] = useState([])
  const [historyStep, setHistoryStep] = useState(-1)
  const [showGrid, setShowGrid] = useState(false)

  // Initialize and handle resizing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const context = canvas.getContext('2d')
    const parent = canvas.parentElement
    
    const initCanvas = () => {
      if (!parent) return
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
      
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.fillStyle = 'white'
      context.fillRect(0, 0, canvas.width, canvas.height)
      
      setCtx(context)
      
      // Save initial blank state to history
      const initialData = canvas.toDataURL()
      setHistory([initialData])
      setHistoryStep(0)
    }

    initCanvas()
    
    const handleResize = () => {
      const tempImage = canvas.toDataURL()
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.fillStyle = 'white'
      context.fillRect(0, 0, canvas.width, canvas.height)
      
      const img = new Image()
      img.src = tempImage
      img.onload = () => context.drawImage(img, 0, 0)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isFullScreen])

  const getCoordinates = (e) => {
    if (!canvasRef.current) return { offsetX: 0, offsetY: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    
    if (e.touches && e.touches.length > 0) {
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      }
    }
    
    return {
      offsetX: e.nativeEvent ? e.nativeEvent.offsetX : (e.clientX - rect.left),
      offsetY: e.nativeEvent ? e.nativeEvent.offsetY : (e.clientY - rect.top)
    }
  }

  const startDrawing = (e) => {
    if (!ctx) return
    const { offsetX, offsetY } = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(offsetX, offsetY)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing || !ctx) return
    const { offsetX, offsetY } = getCoordinates(e)
    
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color
    ctx.lineWidth = tool === 'eraser' ? brushSize * 10 : brushSize
    ctx.lineTo(offsetX, offsetY)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveToHistory()
    }
  }

  const saveToHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push(canvas.toDataURL())
    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)
    if (onSave) onSave(canvas.toDataURL())
  }

  const undo = () => {
    if (historyStep > 0 && ctx) {
      const step = historyStep - 1
      setHistoryStep(step)
      const img = new Image()
      img.src = history[step]
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        ctx.drawImage(img, 0, 0)
      }
    }
  }

  const palette = ['#000000', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b']
  const brushShapes = [
    { label: 'S', size: 3, iconSize: 5 },
    { label: 'M', size: 8, iconSize: 10 },
    { label: 'L', size: 16, iconSize: 18 },
    { label: 'XL', size: 32, iconSize: 28 },
  ]

  return (
    <div ref={containerRef} style={{ 
      position: isFullScreen ? 'fixed' : 'relative', 
      top: isFullScreen ? 0 : 'auto',
      left: isFullScreen ? 0 : 'auto',
      right: isFullScreen ? 0 : 'auto',
      bottom: isFullScreen ? 0 : 'auto',
      width: '100%', 
      height: '100%', 
      zIndex: isFullScreen ? 2000 : 1,
      background: 'white',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: isFullScreen ? 0 : '24px',
      overflow: 'hidden'
    }}>
      {showGrid && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#ddd 1.5px, transparent 1.5px)', backgroundSize: '40px 40px', opacity: 0.5, pointerEvents: 'none', zIndex: 1 }} />
      )}

      <canvas 
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ flex: 1, touchAction: 'none', background: 'transparent', zIndex: 2, cursor: 'crosshair' }}
      />

      {/* Top Controls */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={undo} className="glass-morphism" style={{ padding: '10px', border: 'none', color: 'var(--text-dark)' }}><RotateCcw size={22} /></button>
          <button onClick={() => { ctx.fillStyle='white'; ctx.fillRect(0,0,canvasRef.current.width, canvasRef.current.height); saveToHistory(); }} className="glass-morphism" style={{ padding: '10px', border: 'none', color: '#ff4444' }}><Trash2 size={22} /></button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowGrid(!showGrid)} className="glass-morphism" style={{ padding: '10px', border: 'none', color: showGrid ? 'var(--primary)' : 'var(--text-dark)' }}><Grid size={22} /></button>
          <button onClick={toggleFullScreen} className="glass-morphism" style={{ padding: '10px', border: 'none', color: 'var(--primary)' }}>
            {isFullScreen ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
          </button>
        </div>
      </div>

      {/* Center Mic (FullScreen only) */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: -100, opacity: 1 }} exit={{ y: 50, opacity: 0 }} style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
            <button onClick={toggleMic} style={{ width: '80px', height: '80px', borderRadius: '50%', background: isListening ? '#ff4444' : 'var(--primary)', color: 'white', border: '4px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isListening ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Toolbar */}
      <div className="glass-morphism" style={{ position: 'absolute', bottom: '25px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, padding: '10px 25px', display: 'flex', alignItems: 'center', gap: '20px', borderRadius: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {palette.map(c => (
            <button key={c} onClick={() => { setColor(c); setTool('pen'); }} style={{ width: '28px', height: '28px', background: c, borderRadius: '50%', border: color === c ? '3px solid white' : 'none', boxShadow: color === c ? `0 0 0 2px ${c}` : 'none', cursor: 'pointer', transition: '0.2s' }} />
          ))}
        </div>
        <div style={{ width: '1px', height: '30px', background: 'var(--border-color)' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setTool('pen')} style={{ padding: '10px', background: tool === 'pen' ? 'var(--primary)' : 'transparent', color: tool === 'pen' ? 'white' : 'var(--text-dark)', border: 'none', borderRadius: '12px', cursor: 'pointer' }}><Pencil size={20} /></button>
          <button onClick={() => setTool('eraser')} style={{ padding: '10px', background: tool === 'eraser' ? 'var(--primary)' : 'transparent', color: tool === 'eraser' ? 'white' : 'var(--text-dark)', border: 'none', borderRadius: '12px', cursor: 'pointer' }}><Eraser size={20} /></button>
        </div>
        <div style={{ width: '1px', height: '30px', background: 'var(--border-color)' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          {brushShapes.map(b => (
            <button key={b.label} onClick={() => { setBrushSize(b.size); setTool('pen'); }} style={{ width: '36px', height: '36px', background: brushSize === b.size && tool === 'pen' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', border: brushSize === b.size && tool === 'pen' ? '2px solid var(--primary)' : 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: b.iconSize, height: b.iconSize, background: tool === 'pen' ? color : '#ccc', borderRadius: b.label === 'XL' ? '4px' : '50%' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Whiteboard
