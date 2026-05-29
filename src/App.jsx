import React, { useState } from 'react';
import './App.css';
import PhotoUpload from './components/PhotoUpload';
import QuizMode from './components/QuizMode';
import ReportView from './components/ReportView';

function App() {
  const [currentMode, setCurrentMode] = useState('home'); // home, upload, quiz, report
  const [quizData, setQuizData] = useState(null);
  const [reportData, setReportData] = useState(null);

  const handleQuizExtracted = (data) => {
    setQuizData(data);
    setCurrentMode('quiz');
  };

  const handleQuizCompleted = (data) => {
    setReportData(data);
    setCurrentMode('report');
  };

  const handleBackHome = () => {
    setCurrentMode('home');
    setQuizData(null);
    setReportData(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 Homework Photo App</h1>
        <p>AI-powered homework verification & interactive quizzes</p>
      </header>

      <main className="app-main">
        {currentMode === 'home' && (
          <div className="home-screen">
            <div className="welcome-card">
              <h2>Welcome! 👋</h2>
              <p>Choose what you'd like to do:</p>
              <div className="mode-buttons">
                <button 
                  className="mode-btn verify-btn"
                  onClick={() => setCurrentMode('upload')}
                >
                  <span className="btn-icon">✅</span>
                  <span className="btn-text">Verify Homework</span>
                </button>
                <button 
                  className="mode-btn quiz-btn"
                  onClick={() => setCurrentMode('upload')}
                >
                  <span className="btn-icon">🎯</span>
                  <span className="btn-text">Take Quiz</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {currentMode === 'upload' && (
          <PhotoUpload 
            onQuizExtracted={handleQuizExtracted}
            onBack={handleBackHome}
          />
        )}

        {currentMode === 'quiz' && quizData && (
          <QuizMode 
            quizData={quizData}
            onCompleted={handleQuizCompleted}
            onBack={handleBackHome}
          />
        )}

        {currentMode === 'report' && reportData && (
          <ReportView 
            reportData={reportData}
            onBack={handleBackHome}
          />
        )}
      </main>
    </div>
  );
}

export default App;
