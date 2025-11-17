import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CourseOutput from './CourseOutput';
import LoadingSpinner from './LoadingSpinner';

function CourseGenerator() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    topic: '',
    skillLevel: 'Beginner',
    learningStyle: 'Balanced',
    hoursPerWeek: '5',
    learningGoals: '',
    existingKnowledge: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // This will hold the response from the API
  const [generatedData, setGeneratedData] = useState(null);
  
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    setFormData({
      topic: '',
      skillLevel: 'Beginner',
      learningStyle: 'Balanced',
      hoursPerWeek: '5',
      learningGoals: '',
      existingKnowledge: ''
    });
    setGeneratedData(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setGeneratedData(null);
    
    try {
      const response = await api.post('/api/course/generate', formData);
      setGeneratedData(response.data); // { status, message, generatedCourse, receivedData }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate course. Please try again.');
    }
    setIsLoading(false);
  };

  // If a course is generated, show the output. Otherwise, show the form.
  if (generatedData) {
    return (
      <CourseOutput 
        course={generatedData.generatedCourse}
        receivedData={generatedData.receivedData}
        onBack={() => setGeneratedData(null)} // Pass a function to go back
      />
    );
  }

  return (
    <div id="appContentSection">
      <form id="courseForm" className="p-4 border rounded shadow-sm custom-form" onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="courseTopic" className="form-label">Course Topic:</label>
            <input 
              type="text" 
              className="form-control" 
              id="topic" 
              placeholder="e.g., Data Science with Python" 
              value={formData.topic}
              onChange={handleChange}
              required 
            />
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="skillLevel" className="form-label">Your Skill Level:</label>
            <select 
              className="form-select" 
              id="skillLevel" 
              value={formData.skillLevel}
              onChange={handleChange}
              required
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="learningStyle" className="form-label">Preferred Learning Style:</label>
            <select 
              className="form-select" 
              id="learningStyle" 
              value={formData.learningStyle}
              onChange={handleChange}
              required
            >
              <option value="Balanced">Balanced (Mix of all)</option>
              <option value="Project-Based">Project-Based (Hands-on)</option>
              <option value="Visual">Visual (Videos & Diagrams)</option>
              <option value="Reading/Theoretical">Reading/Theoretical (Docs & Articles)</option>
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="hoursPerWeek" className="form-label">Hours Per Week You Can Commit:</label>
            <input 
              type="number" 
              className="form-control" 
              id="hoursPerWeek" 
              min="1" max="40" 
              value={formData.hoursPerWeek}
              onChange={handleChange}
              required 
            />
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="learningGoals" className="form-label">Specific Learning Goals:</label>
          <textarea 
            className="form-control" 
            id="learningGoals" 
            rows="2" 
            placeholder="e.g., Build a basic website, understand neural networks" 
            value={formData.learningGoals}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <div className="mb-3">
          <label htmlFor="existingKnowledge" className="form-label">Any Existing Knowledge? (Optional):</label>
          <textarea 
            className="form-control" 
            id="existingKnowledge" 
            rows="2" 
            placeholder="e.g., I already know basic HTML and CSS"
            value={formData.existingKnowledge}
            onChange={handleChange}
          ></textarea>
        </div>
        <div className="d-grid gap-2">
          <button type="submit" className="btn btn-primary btn-lg custom-btn" disabled={isLoading}>
            {isLoading ? <LoadingSpinner small /> : 'Generate Personalized Course'}
          </button>
          <button type="button" className="btn btn-outline-secondary custom-btn" onClick={handleReset}>
            Reset Form
          </button>
        </div>
      </form>
      
      {isLoading && <LoadingSpinner message="Generating your curriculum..." />}
    </div>
  );
}

export default CourseGenerator;