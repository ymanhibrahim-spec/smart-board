import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Lesson from './pages/Lesson'
import LessonSummary from './pages/LessonSummary'
import Login from './pages/Login'
import Register from './pages/Register'
import Settings from './pages/Settings'
import StudentQuiz from './pages/StudentQuiz'
import QuizMonitor from './pages/QuizMonitor'
import RemoteMic from './pages/RemoteMic'
import CreateQuiz from './pages/CreateQuiz'
import Navbar from './components/Navbar'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Apply saved theme
    const savedTheme = localStorage.getItem('app-theme') || 'light'
    document.documentElement.setAttribute('data-theme', savedTheme)
    
    // Apply saved language
    const savedLang = localStorage.getItem('app-lang') || 'ar'
    document.documentElement.setAttribute('lang', savedLang)
    document.body.style.direction = savedLang === 'ar' ? 'rtl' : 'ltr'
  }, [])

  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/lesson" element={<PrivateRoute><Lesson /></PrivateRoute>} />
              <Route path="/lesson-summary" element={<PrivateRoute><LessonSummary /></PrivateRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
              <Route path="/quiz/:quizId" element={<StudentQuiz />} />
              <Route path="/quiz-monitor/:quizId" element={<PrivateRoute><QuizMonitor /></PrivateRoute>} />
              <Route path="/remote-mic/:teacherId" element={<RemoteMic />} />
              <Route path="/create-quiz" element={<PrivateRoute><CreateQuiz /></PrivateRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
