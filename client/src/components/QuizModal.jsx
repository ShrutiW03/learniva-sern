import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Modal, Button, Form } from 'react-bootstrap';
import LoadingSpinner from './LoadingSpinner';

// --- NEW: Added defaultQuizType prop ---
function QuizModal({ show, handleClose, courseId, courseTopic, defaultQuizType = 'quiz' }) {
  const { currentUser } = useAuth();
  
  const [view, setView] = useState('options'); // 'options', 'loading', 'taking', 'submitting'
  
  // --- NEW: Use the prop to set the default quizType ---
  const [quizOptions, setQuizOptions] = useState({
    difficulty: 'Beginner',
    quizType: defaultQuizType 
  });
  
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');

  // Reset view when 'show' prop changes to true
  useEffect(() => {
    if (show) {
      setView('options');
      setError('');
      setQuizOptions({ difficulty: 'Beginner', quizType: defaultQuizType });
    }
  }, [show, defaultQuizType]);

  const handleOptionsChange = (e) => {
    const { id, value } = e.target;
    setQuizOptions(prev => ({ ...prev, [id]: value }));
  };

  const handleStartQuiz = async () => {
    setView('loading');
    setError('');
    try {
      const response = await api.post(`/api/course/${courseId}/quiz`, {
        ...quizOptions,
        topic: courseTopic,
        userId: currentUser.id
      });
      if (!response.data.questions || response.data.questions.length === 0) {
        throw new Error("No questions were returned from the API.");
      }
      setQuestions(response.data.questions);
      setAnswers({}); // Reset answers
      setView('taking');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load quiz.");
      setView('options'); // Go back to options on error
    }
  };

  const handleAnswerChange = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };
  
  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    
    if (Object.keys(answers).length !== questions.length) {
      alert("Please answer all questions.");
      return;
    }
    
    setView('submitting');
    setError('');
    
    try {
      const payload = {
        ...quizOptions,
        userId: currentUser.id,
        courseTopic: courseTopic,
        answers: answers,
      };
      const response = await api.post(`/api/course/${courseId}/submit-quiz`, payload);
      alert(response.data.message); // Show score
      handleModalClose(); // Close and reset modal
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit quiz.");
      setView('taking'); // Go back to quiz
    }
  };

  const handleModalClose = () => {
    // Reset all state on close
    setView('options');
    setQuestions([]);
    setAnswers({});
    setError('');
    handleClose(); // Prop function
  };

  return (
    <Modal show={show} onHide={handleModalClose} centered size={view === 'taking' ? 'lg' : 'md'} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{view === 'options' ? 'Choose Your Quiz' : `Test Your Knowledge`}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        
        {view === 'options' && (
          <Form id="quizOptionsForm">
            <p>You are about to take a quiz on: <strong>{courseTopic}</strong></p>
            <Form.Group className="mb-3" controlId="quizType">
              <Form.Label>Test Type:</Form.Label>
              {/* --- NEW: The dropdown is now disabled --- */}
              <Form.Select value={quizOptions.quizType} onChange={handleOptionsChange} disabled>
                <option value="quiz">Quick Quiz (5 Questions)</option>
                <option value="test">Comprehensive Test (10 Questions)</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3" controlId="difficulty">
              <Form.Label>Difficulty:</Form.Label>
              <Form.Select value={quizOptions.difficulty} onChange={handleOptionsChange}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </Form.Select>
            </Form.Group>
          </Form>
        )}
        
        {view === 'loading' && <LoadingSpinner message="Generating your quiz..." />}
        
        {view === 'taking' && (
          <Form id="postCourseQuizForm" onSubmit={handleSubmitQuiz}>
            <p>Quiz for: <strong>{courseTopic}</strong></p>
            {questions.map((q, index) => (
              <div key={q.question_id} className="mb-4">
                <strong>{index + 1}. {q.question_text || ''}</strong>
                <div className="ms-3 mt-2">
                  {(q.options || []).map(opt => (
                    <Form.Check
                      type="radio"
                      key={opt.option}
                      id={`q-${q.question_id}-opt-${opt.option}`}
                      name={`question_${q.question_id}`}
                      value={opt.option}
                      label={` ${opt.text || ''}`}
                      onChange={() => handleAnswerChange(q.question_id, opt.option)}
                      required
                    />
                  ))}
                </div>
              </div>
            ))}
          </Form>
        )}
        
        {view === 'submitting' && <LoadingSpinner message="Submitting your answers..." />}
        
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={handleModalClose}>
          {view === 'taking' ? 'Close' : 'Cancel'}
        </Button>
        
        {view === 'options' && (
          <Button variant="primary" className="custom-btn" onClick={handleStartQuiz}>
            Start Quiz
          </Button>
        )}
        
        {view === 'taking' && (
          <Button variant="primary" className="custom-btn" onClick={handleSubmitQuiz}>
            Submit Quiz
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default QuizModal;