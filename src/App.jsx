import { useState, useRef } from 'react'
import axios from 'axios'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function App() {
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('check') // 'check' or 'practice'
  const [parentEmail, setParentEmail] = useState('')
  const [showPhotoChoice, setShowPhotoChoice] = useState(false)
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
      setShowPhotoChoice(false)
    }
  }

  const handleTakePhoto = () => {
    setShowPhotoChoice(false)
    cameraInputRef.current?.click()
  }

  const handleUploadPhoto = () => {
    setShowPhotoChoice(false)
    galleryInputRef.current?.click()
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
                <div className="upload-area" onClick={() => setShowPhotoChoice(true)}>
                  <div className="upload-icon">📷</div>
                  <p>Tap to take a photo or upload</p>
                </div>

                {showPhotoChoice && (
                  <div className="modal-overlay" onClick={() => setShowPhotoChoice(false)}>
                    <div className="choice-dialog" onClick={(e) => e.stopPropagation()}>
                      <h2>Choose Photo Source</h2>
                      <button className="choice-btn camera-btn" onClick={handleTakePhoto}>
                        📷 Take a Photo
                      </button>
                      <button className="choice-btn gallery-btn" onClick={handleUploadPhoto}>
                        🖼️ Upload from Library
                      </button>
                      <button className="choice-btn cancel-btn" onClick={() => setShowPhotoChoice(false)}>
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                )}

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
