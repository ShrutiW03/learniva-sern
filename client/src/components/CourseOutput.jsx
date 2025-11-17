import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import html2pdf from 'html2pdf.js';
import LoadingSpinner from './LoadingSpinner';
import QuizModal from './QuizModal';
import { Tabs, Tab, Button } from 'react-bootstrap'; // <-- IMPORT Button

function CourseOutput({ course, receivedData, onBack, savedCourse }) {
  const { currentUser } = useAuth();
  const contentRef = useRef(); 

  const activeCourse = savedCourse ? savedCourse.generated_content : course;
  const courseId = savedCourse ? savedCourse.id : null;
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(!!savedCourse); 
  const [savedCourseId, setSavedCourseId] = useState(courseId);
  const [completedResources, setCompletedResources] = useState(savedCourse?.completed_resources || []);
  
  // --- NEW: State to manage the quiz modal ---
  const [quizContext, setQuizContext] = useState({
      show: false,
      topic: '',
      type: 'quiz' // default to 'quiz'
  });
  
  const [activeTab, setActiveTab] = useState('prereqs'); // Start on prerequisites

  // --- Progress Tracking ---
  useEffect(() => {
    if (activeCourse.modules && activeCourse.modules.length > 0) {
      setActiveTab(activeCourse.modules[0].week); // Set initial tab to Week 1
    }
  }, [activeCourse]);

  useEffect(() => {
    if (savedCourseId) {
      api.get(`/api/course/${savedCourseId}/progress?userId=${currentUser.id}`)
        .then(response => {
          setCompletedResources(response.data.completed_resources || []);
        })
        .catch(err => console.error("Failed to fetch progress", err));
    }
  }, [savedCourseId, currentUser.id]);

  const handleProgressChange = async (resourceUrl) => {
    if (!savedCourseId) {
      alert("You must save the course before tracking progress.");
      return;
    }
    const newCompletedResources = completedResources.includes(resourceUrl)
      ? completedResources.filter(url => url !== resourceUrl)
      : [...completedResources, resourceUrl];
    setCompletedResources(newCompletedResources); 
    try {
      await api.post(`/api/course/${savedCourseId}/progress`, {
        userId: currentUser.id,
        completed_resources: newCompletedResources
      });
    } catch (err) {
      console.error("Failed to save progress", err);
    }
  };

  // --- Button Actions ---
  const handleSaveCourse = async () => {
    setIsSaving(true);
    try {
      const payload = { 
        receivedData: receivedData,
        generatedCourse: activeCourse, 
        userId: currentUser.id 
      };
      const response = await api.post('/save-course', payload);
      alert(response.data.message);
      setIsSaved(true);
      setSavedCourseId(response.data.courseId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save course");
    }
    setIsSaving(false);
  };

  const handleExportPDF = () => {
    const element = contentRef.current;
    const opt = {
      margin: 10,
      filename: `${activeCourse.title || 'Learniva_Curriculum'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
          scale: 2, 
          useCORS: true,
          onclone: (document) => {
              document.body.style.background = 'linear-gradient(-45deg, #0f0c29, #24243e, #302b63, #0f0c29)';
              document.body.style.color = '#EAE6FF';
              // You can add more overrides here if needed
          }
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };
  
  // --- NEW: Functions to open the quiz modal ---
  const openWeeklyQuiz = (module) => {
    setQuizContext({
        show: true,
        topic: `${module.week}: ${module.name}`, // e.g., "Week 1: Java Basics"
        type: 'quiz' // This is a "Quick Quiz"
    });
  };
  
  const openFinalQuiz = () => {
    setQuizContext({
        show: true,
        topic: activeCourse.title, // The main course title
        type: 'test' // This is a "Comprehensive Test"
    });
  };
  
  const closeQuiz = () => {
    setQuizContext({ show: false, topic: '', type: 'quiz' });
  };

  // --- Rendering Helpers ---
  const getIconForType = (type) => {
    switch (type) {
      case 'YouTube Video': return <i className="bi bi-play-circle-fill me-2" style={{ color: '#c4302b' }}></i>;
      case 'Official Documentation': return <i className="bi bi-file-code-fill me-2" style={{ color: '#6e5494' }}></i>;
      case 'Article': return <i className="bi bi-newspaper me-2" style={{ color: '#007bff' }}></i>;
      case 'Interactive Tutorial': return <i className="bi bi-joystick me-2" style={{ color: '#28a745' }}></i>;
      case 'Book Recommendation': return <i className="bi bi-book-fill me-2" style={{ color: '#fd7e14' }}></i>;
      default: return <i className="bi bi-link-45deg me-2"></i>;
    }
  };

  const allResources = activeCourse.modules?.flatMap(m => m.resources.map(r => r.url)) || [];
  const totalCount = allResources.length;
  const completedCount = completedResources.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  if (!activeCourse) {
    return (
      <div className="alert alert-danger">
        No course data to display. <button onClick={onBack} className="btn btn-link">Go Back</button>
      </div>
    );
  }

  return (
    <>
      <div id="courseOutput" className="mt-5">
        
        {/* --- MAIN HEADER --- */}
        <div className="text-center mb-4">
            <h2 className="output-title">{activeCourse.title || 'Generated Course'}</h2>
            <p className="lead app-slogan" style={{fontSize: '1.1rem'}}>{activeCourse.courseSummary || `Estimated Duration: ${activeCourse.totalWeeks} weeks`}</p>
        </div>

        {/* --- PROGRESS BAR --- */}
        {isSaved && (
          <div className="progress mb-4" style={{ height: '25px', fontSize: '1rem' }}>
            <div 
              id="courseProgressBar" 
              className="progress-bar bg-success"
              role="progressbar" 
              style={{ width: `${percentage}%` }} 
              aria-valuenow={percentage} 
              aria-valuemin="0" 
              aria-valuemax="100"
            >
              {percentage}% Complete
            </div>
          </div>
        )}

        {/* --- NEW TABBED INTERFACE --- */}
        <div id="generatedContent" className="generated-content-box" ref={contentRef}>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            id="course-module-tabs"
            className="mb-3"
            justify
          >
            {/* --- PREREQUISITES TAB --- */}
            {activeCourse.prerequisites && activeCourse.prerequisites.length > 0 && (
              <Tab eventKey="prereqs" title={<><i className="bi bi-shield-check me-2"></i>Prerequisites</>}>
                <div className="p-3">
                  <ul className="mb-0">
                    {activeCourse.prerequisites.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              </Tab>
            )}

            {/* --- DYNAMIC MODULE TABS --- */}
            {activeCourse.modules?.map((module, modIndex) => (
              <Tab eventKey={module.week} title={<>{module.week}</>} key={modIndex}>
                <div className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 style={{fontSize: '1.5rem'}}>{module.name || 'Untitled'}</h5>
                    <small className="text-muted"><i className="bi bi-clock me-1"></i>{module.estimatedHours} hrs</small>
                  </div>
                  <p className="mt-2">{module.description || ''}</p>
                  
                  <div className="mb-2">
                    <strong>Key Concepts:</strong> 
                    {(module.keywords || []).map((k, i) => <span key={i} className="badge bg-secondary me-1">{k}</span>)}
                  </div>
                  
                  <div className="row mt-4">
                    <div className="col-md-6">
                      <strong><i className="bi bi-bullseye me-2"></i>Learning Outcomes:</strong>
                      <ul className="list-unstyled ms-3">
                        {(module.learningOutcomes || []).map((o, i) => <li key={i}><i className="bi bi-check-circle-fill text-success me-2"></i>{o}</li>)}
                      </ul>

                      <strong className="mt-3 d-block"><i className="bi bi-star-fill me-2" style={{color: '#ffc107'}}></i>Key Takeaways:</strong>
                      <ul className="list-unstyled ms-3">
                        {(module.keyTakeaways || []).map((t, i) => <li key={i}><i className="bi bi-check me-2"></i>{t}</li>)}
                      </ul>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 bg-light border rounded mb-3">
                        <strong><i className="bi bi-tools me-2"></i>Weekly Project:</strong>
                        <p className="mb-0">{module.projectIdea || 'Practice the concepts learned this week.'}</p>
                      </div>

                      <strong><i className="bi bi-collection-play me-2"></i>Recommended Resources:</strong>
                      <ul className="list-unstyled ms-3">
                        {(module.resources || []).map((r, resIndex) => (
                          <li key={resIndex} className="form-check">
                            {isSaved ? (
                              <input 
                                className="form-check-input me-2 resource-checkbox" 
                                type="checkbox" 
                                data-resource-url={r.url}
                                id={`res-${modIndex}-${resIndex}`}
                                checked={completedResources.includes(r.url)}
                                onChange={() => handleProgressChange(r.url)}
                              />
                            ) : (
                              <i className="bi bi-square me-2" style={{opacity: 0.5}}></i>
                            )}
                            <label className="form-check-label" htmlFor={`res-${modIndex}-${resIndex}`}>
                              {getIconForType(r.type)}
                              <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a> 
                              <small className="text-muted"> ({r.type})</small>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* --- NEW: WEEKLY QUIZ BUTTON --- */}
                  {isSaved && (
                    <div className="text-center mt-4">
                        <Button 
                            variant="outline-light" 
                            className="custom-btn btn-outline-secondary"
                            onClick={() => openWeeklyQuiz(module)}
                        >
                            <i className="bi bi-patch-question me-2"></i>Take Weekly Quiz
                        </Button>
                    </div>
                  )}
                  
                </div>
              </Tab>
            ))}
          </Tabs>
        </div>
        {/* --- END OF TABBED INTERFACE --- */}

        {/* --- BUTTONS --- */}
        <div className="d-grid gap-2 mt-4">
          <button type="button" className="btn btn-outline-secondary custom-btn" onClick={onBack}>
            ← Back
          </button>
          
          {!isSaved && (
            <button type="button" className="btn btn-success btn-lg custom-btn" onClick={handleSaveCourse} disabled={isSaving}>
              {isSaving ? <LoadingSpinner small /> : 'Save Course'}
            </button>
          )}

          {isSaved && (
            <button 
                type="button" 
                className="btn btn-primary btn-lg custom-btn" 
                onClick={openFinalQuiz} // <-- UPDATED
            >
              <i className="bi bi-patch-question-fill me-2"></i> Take Comprehensive Test
            </button>
          )}
          
          <button type="button" className="btn btn-info btn-lg custom-btn" onClick={handleExportPDF}>
            Export as PDF
          </button>
        </div>
      </div>
      
      {/* --- NEW: Render the Quiz Modal with dynamic context --- */}
      {quizContext.show && (
        <QuizModal
          show={quizContext.show}
          handleClose={closeQuiz}
          courseId={savedCourseId}
          courseTopic={quizContext.topic}
          defaultQuizType={quizContext.type}
        />
      )}
    </>
  );
}

export default CourseOutput;