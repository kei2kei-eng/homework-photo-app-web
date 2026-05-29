import React, { useState } from 'react';
import axios from 'axios';
import './QuizMode.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function QuizMode({ quizData, onCompleted, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const questions = quizData.questions || [];
  const question = questions[currentQuestion];

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestion]: optionIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const userAnswers = questions.map((q, idx) => ({
        questionIndex: idx,
        selectedOption: answers[idx] !== undefined ? answers[idx] : -1,
      }));

      const response = await axios.post(
        `${API_BASE_URL}/api/verify-quiz-answers`,
        {
          quizId: quizData.quizId,
          answers: userAnswers,
        }
      );

      onCompleted(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz. Please try again.');
      console.error('Error submitting quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!question) {
    return <div className="quiz-error">No questions found</div>;
  }

  const isAnswered = answers[currentQuestion] !== undefined;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="quiz-mode">
      <div className="quiz-card">
        <button className="back-btn" onClick={onBack}>← Back</button>

        <div className="quiz-header">
          <h2>🎯 Quiz Mode</h2>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        <div className="question-container">
          <h3 className="question-text">{question.question}</h3>

          <div className="options-container">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                className={`option-btn ${answers[currentQuestion] === idx ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(idx)}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="quiz-controls">
          <button
            className="nav-btn"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading || !isAnswered}
            >
              {loading ? '⏳ Submitting...' : '✅ Submit Quiz'}
            </button>
          ) : (
            <button
              className="nav-btn"
              onClick={handleNext}
              disabled={!isAnswered}
            >
              Next →
            </button>
          )}
        </div>

        <div className="question-indicators">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`indicator ${idx === currentQuestion ? 'current' : ''} ${
                answers[idx] !== undefined ? 'answered' : ''
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuizMode;
