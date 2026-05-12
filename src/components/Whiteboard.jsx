import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Pencil, Eraser, RotateCcw, RotateCw, Trash2, Download, Grid, Maximize2, Minimize2, Mic, MicOff, Move, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Whiteboard = ({ onSave, isFullScreen, toggleFullScreen, isListening, toggleMic }) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [ctx, setCtx] = useState(null)
  
  // Drawing State
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(6)
  const [tool, setTool] = useState('pen') 
  const [paths, setPaths] = useState([]) // Store all drawings as vectors
  const [currentPath, setCurrentPath] = useState(null)
  const [history, setHistory] = useState([])
  
  // Transform State (Zoom & Pan)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastTouch, setLastTouch] = useState(null)
  const [showGrid, setShowGrid] = useState(false)

  // Initialize Canvas with High DPI
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const parent = canvas.parentElement
    
    const resize = () => {
      const rect = parent.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      context.scale(dpr, dpr)
      render()
    }

    window.addEventListener('resize', resize)
    resize()
    setCtx(context)
    return () => window.removeEventListener('resize', resize)
  }, [isFullScreen])

  // Core Rendering Logic (Vector-based for "No Pixels" quality)
  const render = useCallback(() => {
    if (!ctx || !canvasRef.current) return
    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1
    
    // Clear and reset transform
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr)

    // Apply Zoom & Pan
    ctx.translate(transform.x, transform.y)
    ctx.scale(transform.scale, transform.scale)

    // Draw Grid if enabled
    if (showGrid) {
      drawGrid(ctx)
    }

    // Draw all completed paths
    paths.forEach(drawPath)
    
    // Draw current active path
    if (currentPath) drawPath(currentPath)
  }, [ctx, paths, currentPath, transform, showGrid])

  useEffect(() => { render() }, [render])

  const drawGrid = (context) => {
    context.beginPath()
    context.strokeStyle = '#eee'
    context.lineWidth = 1 / transform.scale
    const size = 50
    const startX = -transform.x / transform.scale
    const startY = -transform.y / transform.scale
    const endX = startX + canvasRef.current.width / transform.scale
    const endY = startY + canvasRef.current.height / transform.scale

    for (let x = Math.floor(startX / size) * size; x < endX; x += size) {
      context.moveTo(x, startY)
      context.lineTo(x, endY)
    }
    for (let y = Math.floor(startY / size) * size; y < endY; y += size) {
      context.moveTo(startX, y)
      context.lineTo(endX, y)
    }
    context.stroke()
  }

  const drawPath = (path) => {
    if (!path.points.length) return
    ctx.beginPath()
    ctx.strokeStyle = path.tool === 'eraser' ? 'white' : path.color
    ctx.lineWidth = path.tool === 'eraser' ? path.size * 5 : path.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Smooth line using quadratic curves
    ctx.moveTo(path.points[0].x, path.points[0].y)
    if (path.points.length < 3) {
      ctx.lineTo(path.points[0].x, path.points[0].y)
    } else {
      for (let i = 1; i < path.points.length - 2; i++) {
        const xc = (path.points[i].x + path.points[i + 1].x) / 2
        const yc = (path.points[i].y + path.points[i + 1].y) / 2
        ctx.quadraticCurveTo(path.points[i].x, path.points[i].y, xc, yc)
      }
      ctx.quadraticCurveTo(
        path.points[path.points.length - 2].x, 
        path.points[path.points.length - 2].y, 
        path.points[path.points.length - 1].x, 
        path.points[path.points.length - 1].y
      )
    }
    ctx.stroke()
  }

  const screenToCanvas = (clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (clientX - rect.left - transform.x) / transform.scale,
      y: (clientY - rect.top - transform.y) / transform.scale
    }
  }

  // Handle Mouse/Touch Interaction
  const handleStart = (e) => {
    const touches = e.touches || [e]
    
    if (touches.length === 2) {
      setIsPanning(true)
      setIsDrawing(false)
      const dist = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY)
      const mid = { x: (touches[0].clientX + touches[1].clientX) / 2, y: (touches[0].clientY + touches[1].clientY) / 2 }
      setLastTouch({ dist, mid })
      return
    }

    if (touches.length === 1) {
      const { x, y } = screenToCanvas(touches[0].clientX, touches[0].clientY)
      setIsDrawing(true)
      setCurrentPath({ tool, color, size: brushSize, points: [{ x, y }] })
    }
  }

  const handleMove = (e) => {
    const touches = e.touches || [e]

    // Multi-touch Zoom & Pan
    if (touches.length === 2 && lastTouch) {
      e.preventDefault()
      const dist = Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY)
      const mid = { x: (touches[0].clientX + touches[1].clientX) / 2, y: (touches[0].clientY + touches[1].clientY) / 2 }
      
      const scaleFactor = dist / lastTouch.dist
      const newScale = Math.max(0.5, Math.min(transform.scale * scaleFactor, 5))
      
      const dx = mid.x - lastTouch.mid.x
      const dy = mid.y - lastTouch.mid.y

      setTransform(prev => ({
        scale: newScale,
        x: prev.x + dx,
        y: prev.y + dy
      }))
      setLastTouch({ dist, mid })
      return
    }

    if (isDrawing && touches.length === 1) {
      const { x, y } = screenToCanvas(touches[0].clientX, touches[0].clientY)
      setCurrentPath(prev => ({
        ...prev,
        points: [...prev.points, { x, y }]
      }))
    }
  }

  const handleEnd = () => {
    if (currentPath) {
      setPaths(prev => [...prev, currentPath])
      setHistory(prev => [...prev.slice(0, history.length), currentPath])
      setCurrentPath(null)
    }
    setIsDrawing(false)
    setIsPanning(false)
    setLastTouch(null)
  }

  const undo = () => {
    setPaths(prev => prev.slice(0, -1))
  }

  const resetZoom = () => setTransform({ x: 0, y: 0, scale: 1 })

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
      overflow: 'hidden',
      touchAction: 'none'
    }}>
      <canvas 
        ref={canvasRef}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        style={{ flex: 1, cursor: tool === 'move' ? 'grab' : 'crosshair' }}
      />

      {/* Floating Indicators for Mobile */}
      <div style={{ position: 'absolute', bottom: '110px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 100 }}>
        <div className="glass-morphism" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 40px)', gap: '5px', padding: '10px' }}>
          <div />
          <button onClick={() => setTransform(t => ({...t, y: t.y + 50}))} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><ArrowUp size={20} /></button>
          <div />
          <button onClick={() => setTransform(t => ({...t, x: t.x + 50}))} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><ArrowRight size={20} /></button>
          <button onClick={resetZoom} style={{ background: 'var(--primary)', border: 'none', color: 'white', borderRadius: '50%', fontSize: '0.6rem', fontWeight: 'bold', cursor: 'pointer' }}>1:1</button>
          <button onClick={() => setTransform(t => ({...t, x: t.x - 50}))} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><ArrowLeft size={20} /></button>
          <div />
          <button onClick={() => setTransform(t => ({...t, y: t.y - 50}))} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><ArrowDown size={20} /></button>
          <div />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => setTransform(t => ({...t, scale: t.scale * 1.2}))} className="glass-morphism" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: 'var(--primary)' }}><ZoomIn size={20} /></button>
          <button onClick={() => setTransform(t => ({...t, scale: t.scale / 1.2}))} className="glass-morphism" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: 'var(--primary)' }}><ZoomOut size={20} /></button>
        </div>
      </div>

      {/* Top Controls */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={undo} className="glass-morphism" style={{ padding: '10px', border: 'none', color: 'var(--text-dark)' }}><RotateCcw size={22} /></button>
          <button onClick={() => { setPaths([]); setTransform({x:0,y:0,scale:1}); }} className="glass-morphism" style={{ padding: '10px', border: 'none', color: '#ff4444' }}><Trash2 size={22} /></button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowGrid(!showGrid)} className="glass-morphism" style={{ padding: '10px', border: 'none', color: showGrid ? 'var(--primary)' : 'var(--text-dark)' }}><Grid size={22} /></button>
          <button onClick={toggleFullScreen} className="glass-morphism" style={{ padding: '10px', border: 'none', color: 'var(--primary)' }}>
            {isFullScreen ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
          </button>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="glass-morphism" style={{ 
        position: 'absolute', 
        bottom: '25px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 100, 
        padding: '10px 25px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px', 
        borderRadius: '30px', 
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        maxWidth: '95vw',
        overflowX: 'auto'
      }}>
        <div style={{ display: 'flex', gap: '8px', minWidth: 'max-content' }}>
          {palette.map(c => (
            <button key={c} onClick={() => { setColor(c); setTool('pen'); }} style={{ width: '28px', height: '28px', background: c, borderRadius: '50%', border: color === c ? '3px solid white' : 'none', boxShadow: color === c ? `0 0 0 2px ${c}` : 'none', cursor: 'pointer', transition: '0.2s' }} />
          ))}
        </div>
        <div style={{ width: '1px', height: '30px', background: 'var(--border-color)', flexShrink: 0 }} />
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button onClick={() => setTool('pen')} style={{ padding: '10px', background: tool === 'pen' ? 'var(--primary)' : 'transparent', color: tool === 'pen' ? 'white' : 'var(--text-dark)', border: 'none', borderRadius: '12px', cursor: 'pointer' }}><Pencil size={20} /></button>
          <button onClick={() => setTool('eraser')} style={{ padding: '10px', background: tool === 'eraser' ? 'var(--primary)' : 'transparent', color: tool === 'eraser' ? 'white' : 'var(--text-dark)', border: 'none', borderRadius: '12px', cursor: 'pointer' }}><Eraser size={20} /></button>
        </div>
        <div style={{ width: '1px', height: '30px', background: 'var(--border-color)', flexShrink: 0 }} />
        <div style={{ display: 'flex', gap: '8px', minWidth: 'max-content' }}>
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
