import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';

function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setError('');
  };

  const handleToggleView = () => {
    setIsLoginView(!isLoginView);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (isLoginView) {
      // --- Handle Login ---
      try {
        const response = await api.post('/login', { username, password });
        alert(response.data.message); // "Logged in successfully!"
        login(response.data); // This sets global state and redirects
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
        setIsLoading(false);
      }
    } else {
      // --- Handle Signup ---
      try {
        const response = await api.post('/signup', { username, password, email });
        alert(response.data.message); // "User registered successfully!"
        resetForm();
        setIsLoginView(true); // Switch to login view after signup
      } catch (err) {
        setError(err.response?.data?.message || 'Signup failed. Please try again.');
      }
    }
    setIsLoading(false);
  };

  return (
    <>
      {isLoginView ? (
        // --- Login Form ---
        <div id="loginFormSection" className="p-4 border rounded shadow-sm mt-4 custom-form">
          <h2 className="text-center mb-4">Login to Learniva</h2>
          <form id="loginForm" onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="mb-3">
              <label htmlFor="loginUsername" className="form-label">Username:</label>
              <input
                type="text"
                className="form-control"
                id="loginUsername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="loginPassword" className="form-label">Password:</label>
              <input
                type="password"
                className="form-control"
                id="loginPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="d-grid gap-2">
              <button type="submit" className="btn btn-success custom-btn" disabled={isLoading}>
                {isLoading ? <LoadingSpinner small /> : 'Login'}
              </button>
              <button type="button" className="btn btn-link" onClick={handleToggleView}>
                Don't have an account? Sign Up
              </button>
            </div>
          </form>
        </div>
      ) : (
        // --- Signup Form ---
        <div id="signupFormSection" className="p-4 border rounded shadow-sm mt-4 custom-form">
          <h2 className="text-center mb-4">Create Your Account</h2>
          <form id="signupForm" onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="mb-3">
              <label htmlFor="signupUsername" className="form-label">Username:</label>
              <input
                type="text"
                className="form-control"
                id="signupUsername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="signupEmail" className="form-label">Email (Optional):</label>
              <input
                type="email"
                className="form-control"
                id="signupEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="signupPassword" className="form-label">Password:</label>
              <input
                type="password"
                className="form-control"
                id="signupPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="d-grid gap-2">
              <button type="submit" className="btn btn-primary custom-btn" disabled={isLoading}>
                {isLoading ? <LoadingSpinner small /> : 'Sign Up'}
              </button>
              <button type="button" className="btn btn-link" onClick={handleToggleView}>
                Already have an account? Login
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default AuthPage;