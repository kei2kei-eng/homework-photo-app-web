import React from 'react';
import './ReportView.css';

function ReportView({ reportData, onBack }) {
  const score = reportData.score || 0;
  const totalQuestions = reportData.totalQuestions || 0;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const answers = reportData.answers || [];

  const getScoreEmoji = () => {
    if (percentage >= 90) return '🌟';
    if (percentage >= 80) return '⭐';
    if (percentage >= 70) return '👍';
    if (percentage >= 60) return '💪';
    return '📚';
  };

  const getScoreMessage = () => {
    if (percentage >= 90) return 'Excellent work!';
    if (percentage >= 80) return 'Great job!';
    if (percentage >= 70) return 'Good effort!';
    if (percentage >= 60) return 'Keep practicing!';
    return 'Keep trying!';
  };

  return (
    <div className="report-view">
      <div className="report-card">
        <button className="back-btn" onClick={onBack}>← Back</button>

        <div className="score-section">
          <div className="score-emoji">{getScoreEmoji()}</div>
          <h2>Quiz Complete!</h2>
          <p className="score-message">{getScoreMessage()}</p>

          <div className="score-display">
            <div className="score-circle">
              <div className="score-percentage">{percentage}%</div>
              <div className="score-fraction">{score}/{totalQuestions}</div>
            </div>
          </div>
        </div>

        <div className="answers-section">
          <h3>📋 Answer Review</h3>
          <div className="answers-list">
            {answers.map((answer, idx) => (
              <div key={idx} className={`answer-item ${answer.correct ? 'correct' : 'incorrect'}`}>
                <div className="answer-header">
                  <span className="answer-number">Q{idx + 1}</span>
                  <span className="answer-status">
                    {answer.correct ? '✅ Correct' : '❌ Incorrect'}
                  </span>
                </div>
                <p className="answer-question">{answer.question}</p>
                <div className="answer-details">
                  <p>
                    <strong>Your answer:</strong> {answer.userAnswer}
                  </p>
                  {!answer.correct && (
                    <p>
                      <strong>Correct answer:</strong> {answer.correctAnswer}
                    </p>
                  )}
                  {answer.explanation && (
                    <p className="answer-explanation">
                      <strong>Explanation:</strong> {answer.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-actions">
          <button className="action-btn email-btn">📧 Send to Parents</button>
          <button className="action-btn retry-btn" onClick={onBack}>
            🔄 Try Another Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportView;
