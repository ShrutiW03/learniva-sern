import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import CourseOutput from './CourseOutput';
import QuizModal from './QuizModal';

function MyCourses() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State to view a single course
  const [viewingCourse, setViewingCourse] = useState(null);
  
  // State for quiz modal
  const [quizCourse, setQuizCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [currentUser.id]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/my-courses?userId=${currentUser.id}`);
      setCourses(response.data.courses || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses.");
    }
    setIsLoading(false);
  };
  
  const handleViewCourse = (course) => {
    setViewingCourse(course);
  };
  
  const handleTakeQuiz = (course) => {
    setQuizCourse(course);
  };
  
  // If viewing a single course, render CourseOutput
  if (viewingCourse) {
    return (
      <CourseOutput 
        savedCourse={viewingCourse}
        onBack={() => setViewingCourse(null)}
      />
    );
  }

  // Otherwise, show the list of courses
  return (
    <>
      <div id="myCoursesSection" className="mt-5">
        <h2 className="text-center mb-4 output-title">My Saved Courses 📂</h2>
        
        {isLoading && <LoadingSpinner fullPage message="Loading your courses..." />}
        {error && <div className="alert alert-danger">{error}</div>}
        
        {!isLoading && !error && (
          <div id="myCoursesList" className="list-group generated-content-box">
            {courses.length > 0 ? (
              courses.map(course => {
                const courseTitle = (course.generated_content && course.generated_content.title) ? course.generated_content.title : course.topic;
                
                // Calculate progress
                const allResources = course.generated_content.modules?.flatMap(m => m.resources) || [];
                const totalCount = allResources.length;
                const completedCount = course.completed_resources.length;
                const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                
                return (
                  <div key={course.id} className="list-group-item list-group-item-action flex-column align-items-start mb-3 custom-form">
                    <div className="d-flex w-100 justify-content-between">
                      <h5 className="mb-1">{course.topic || 'No Topic'}</h5>
                      <small>{new Date(course.created_at).toLocaleDateString()}</small>
                    </div>
                    <p className="mb-1">{courseTitle}</p>
                    <div className="progress mt-2" style={{ height: '15px' }}>
                      <div 
                        className="progress-bar bg-success" 
                        role="progressbar" 
                        style={{ width: `${percentage}%` }} 
                        aria-valuenow={percentage} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      >
                        {percentage}%
                      </div>
                    </div>
                    <div className="mt-2">
                      <button 
                        className="btn btn-sm btn-primary mt-2 custom-btn" 
                        style={{padding: '5px 10px'}}
                        onClick={() => handleViewCourse(course)}
                      >
                        View Course
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-primary mt-2 ms-2"
                        style={{padding: '5px 10px'}}
                        onClick={() => handleTakeQuiz(course)}
                      >
                        Take Quiz
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-muted">You have no saved courses yet.</p>
            )}
          </div>
        )}
        
        <div className="d-grid gap-2 mt-4">
          <button 
            type="button" 
            className="btn btn-outline-secondary custom-btn" 
            id="backToGeneratorBtn"
            onClick={() => navigate('/')}
          >
            Back to Generator
          </button>
        </div>
      </div>
      
      {/* Render the Quiz Modal */}
      {quizCourse && (
        <QuizModal
          show={!!quizCourse}
          handleClose={() => setQuizCourse(null)}
          courseId={quizCourse.id}
          courseTopic={quizCourse.topic}
        />
      )}
    </>
  );
}

export default MyCourses;