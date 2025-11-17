import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import CourseGenerator from './components/CourseGenerator';
import MyCourses from './components/MyCourses';

// A wrapper for routes that require a user to be logged in
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/auth" replace />;
}

// A wrapper for the auth page so logged-in users are redirected
function AuthRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return !isLoggedIn ? children : <Navigate to="/" replace />;
}

function App() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="container my-5 p-4">
      {isLoggedIn && <Navbar />}

      {!isLoggedIn && (
        <div className="text-center" id="mainHeader">
          <h1 className="app-title">Learniva – AI-Powered Course Designer ✨</h1>
          <p className="lead app-slogan">Define your learning goals, and let AI craft your perfect curriculum.</p>
        </div>
      )}

      <Routes>
        <Route
          path="/auth"
          element={<AuthRoute><AuthPage /></AuthRoute>}
        />
        <Route
          path="/"
          element={<ProtectedRoute><CourseGenerator /></ProtectedRoute>}
        />
        <Route
          path="/my-courses"
          element={<ProtectedRoute><MyCourses /></ProtectedRoute>}
        />
        {/* Fallback route */}
        <Route 
          path="*" 
          element={<Navigate to={isLoggedIn ? "/" : "/auth"} replace />} 
        />
      </Routes>
    </div>
  );
}

export default App;