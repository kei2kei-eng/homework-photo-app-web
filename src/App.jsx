import { useState, useRef } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function App() {
  const [activeTab, setActiveTab] = useState('check')
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [parentEmail, setParentEmail] = useState('')
  const [history, setHistory] = useState([])
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleCheckHomework = async () => {
    if (!selectedFile) {
      setError('Please select a photo first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('photo', selectedFile)

      const response = await axios.post(`${API_BASE_URL}/api/verify`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const resultData = {
        isCorrect: response.data.isCorrect,
        feedback: response.data.feedback,
        timestamp: new Date().toLocaleString(),
      }

      setResult(resultData)
      setHistory([resultData, ...history])
      setSelectedFile(null)
      setPreview(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify homework. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!parentEmail) {
      setError('Please enter parent email address')
      return
    }

    if (!result) {
      setError('No result to send')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await axios.post(`${API_BASE_URL}/api/send-email`, {
        parentEmail,
        result,
      })

      setError(null)
      alert('Email sent to parent successfully!')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  const handlePracticeMode = async () => {
    if (!selectedFile) {
      setError('Please select a photo first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('photo', selectedFile)

      const response = await axios.post(`${API_BASE_URL}/api/remove-answers`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Download the processed image
      const link = document.createElement('a')
      link.href = response.data.imageUrl
      link.download = 'homework-practice.jpg'
      link.click()

      setSelectedFile(null)
      setPreview(null)
      alert('Practice mode image downloaded!')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process image')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>📚 Homework Checker</h1>
        <p>Take a photo and let AI verify your homework!</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'check' ? 'active' : ''}`}
          onClick={() => setActiveTab('check')}
        >
          ✓ Check
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📋 History
        </button>
      </div>

      <div className={`tab-content ${activeTab === 'check' ? 'active' : ''}`}>
        {!result ? (
          <>
            <div className="upload-area" onClick={handleUploadClick}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
              />
              <div className="upload-icon">📷</div>
              <div className="upload-text">Tap to take or upload photo</div>
              <div className="upload-hint">JPG, PNG up to 10MB</div>
            </div>

            {preview && (
              <>
                <img src={preview} alt="Preview" className="preview-image" />
                <button
                  className="button button-primary"
                  onClick={handleCheckHomework}
                  disabled={loading}
                >
                  {loading ? 'Checking...' : '✓ Check Homework'}
                </button>
                <button
                  className="button button-secondary"
                  onClick={handlePracticeMode}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : '✏️ Practice Mode'}
                </button>
              </>
            )}

            {error && <div className="error-message">{error}</div>}
          </>
        ) : (
          <div className="result-card">
            <div className="result-status">
              <div className={`status-icon ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                {result.isCorrect ? '✓' : '✗'}
              </div>
              <div className="status-text">
                {result.isCorrect ? 'Correct!' : 'Needs Review'}
              </div>
            </div>

            <div className="result-details">
              {result.feedback}
            </div>

            <div className="action-buttons">
              <button
                className="btn-send-email"
                onClick={handleSendEmail}
                disabled={loading}
              >
                📧 Send to Parent
              </button>
              <button
                className="btn-practice"
                onClick={() => {
                  setResult(null)
                  setSelectedFile(null)
                  setPreview(null)
                }}
              >
                ↻ Try Again
              </button>
            </div>

            {result && (
              <input
                type="email"
                className="parent-email-input"
                placeholder="Parent email address"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
              />
            )}

            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <div className="spinner-text">Processing...</div>
          </div>
        )}
      </div>

      <div className={`tab-content ${activeTab === 'history' ? 'active' : ''}`}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: '40px 20px' }}>
            No history yet. Start checking homework!
          </div>
        ) : (
          <ul className="history-list">
            {history.map((item, index) => (
              <li key={index} className="history-item">
                <div className="history-item-title">
                  {item.isCorrect ? '✓ Correct' : '✗ Needs Review'}
                </div>
                <div className="history-item-time">{item.timestamp}</div>
                <div className="history-item-result">{item.feedback}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
