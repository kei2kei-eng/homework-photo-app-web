import { useState, useRef } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function App() {
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('check')
  const [parentEmail, setParentEmail] = useState('')
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleVerify = async () => {
    if (!photo) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('photo', photo)
      formData.append('mode', mode)

      const response = await axios.post(`${API_URL}/api/verify`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setResult(response.data)
    } catch (error) {
      setResult({ error: 'Failed to verify homework. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSendToParent = async () => {
    if (!parentEmail || !result) return

    try {
      await axios.post(`${API_URL}/api/send-email`, {
        email: parentEmail,
        result: result
      })
      alert('Email sent to parent!')
    } catch (error) {
      alert('Failed to send email')
    }
  }

  const handleReset = () => {
    setPhoto(null)
    setPreview(null)
    setResult(null)
    setParentEmail('')
  }

  return (
    <div className="app">
      <div className="container">
        <h1>📚 Homework Checker</h1>

        {!result ? (
          <>
            <div className="mode-selector">
              <button
                className={`mode-btn ${mode === 'check' ? 'active' : ''}`}
                onClick={() => setMode('check')}
              >
                ✓ Check Homework
              </button>
              <button
                className={`mode-btn ${mode === 'practice' ? 'active' : ''}`}
                onClick={() => setMode('practice')}
              >
                🎯 Practice Mode
              </button>
            </div>

            {!preview ? (
              <>
                <div className="upload-area">
                  <div className="upload-icon">📷</div>
                  <p>Choose how to upload your homework</p>
                  <div className="button-group">
                    <button 
                      className="upload-btn camera-btn"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      📷 Take Photo
                    </button>
                    <button 
                      className="upload-btn gallery-btn"
                      onClick={() => galleryInputRef.current?.click()}
                    >
                      🖼️ Upload Photo
                    </button>
                  </div>
                </div>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  style={{ display: 'none' }}
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoCapture}
                  style={{ display: 'none' }}
                />
              </>
            ) : (
              <>
                <div className="preview">
                  <img src={preview} alt="homework" />
                </div>

                {mode === 'check' && (
                  <input
                    type="email"
                    placeholder="Parent email (optional)"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    className="email-input"
                  />
                )}

                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="verify-btn"
                >
                  {loading ? '⏳ Checking...' : '✓ Verify'}
                </button>

                <button onClick={handleReset} className="reset-btn">
                  ↻ Change Photo
                </button>
              </>
            )}
          </>
        ) : (
          <div className="result">
            <div className={`result-badge ${result.correct ? 'correct' : 'incorrect'}`}>
              {result.correct ? '✓ CORRECT!' : '✗ NEEDS WORK'}
            </div>

            <div className="score">Score: {result.score}%</div>

            {result.answers && result.answers.length > 0 && (
              <div className="answers-check">
                <h3>Answer Check:</h3>
                {result.answers.map((answer, idx) => (
                  <div key={idx} className={`answer-item ${answer.correct ? 'correct' : 'incorrect'}`}>
                    <span className="check-mark">{answer.correct ? '✓' : '✗'}</span>
                    <span className="answer-text">{answer.text}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="feedback">{result.feedback}</div>

            {mode === 'practice' && result.cleaned_image && (
              <div className="practice-image">
                <p>Practice without answers:</p>
                <img src={result.cleaned_image} alt="practice" />
              </div>
            )}

            {mode === 'check' && parentEmail && (
              <button onClick={handleSendToParent} className="email-btn">
                📧 Send to Parent
              </button>
            )}

            <button onClick={handleReset} className="reset-btn">
              ↻ Check Another
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
