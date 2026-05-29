import React, { useState } from 'react';
import axios from 'axios';
import './PhotoUpload.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function PhotoUpload({ onQuizExtracted, onBack }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      setError(null);
    }
  };

  const handleExtractQuiz = async () => {
    if (!file) {
      setError('Please select a photo first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await axios.post(
        `${API_BASE_URL}/api/extract-quiz`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      onQuizExtracted(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to extract quiz. Please try again.');
      console.error('Error extracting quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="photo-upload">
      <div className="upload-card">
        <button className="back-btn" onClick={onBack}>← Back</button>
        
        <h2>📸 Upload Homework Photo</h2>
        <p>Take a photo of your homework and we'll extract the questions!</p>

        <div className="upload-area">
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
              <button 
                className="change-btn"
                onClick={() => document.getElementById('file-input').click()}
              >
                Change Photo
              </button>
            </div>
          ) : (
            <label className="upload-label">
              <div className="upload-icon">📷</div>
              <p>Click to select a photo</p>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          className="extract-btn"
          onClick={handleExtractQuiz}
          disabled={!file || loading}
        >
          {loading ? '⏳ Extracting...' : '🚀 Extract Quiz'}
        </button>
      </div>
    </div>
  );
}

export default PhotoUpload;
