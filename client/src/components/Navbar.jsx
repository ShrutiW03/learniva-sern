import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth'); // Redirect to login page
  };

  return (
    <div id="loggedInStatus" className="text-end mb-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: 'var(--text-primary)' }}>
      Welcome, <span id="loggedInUsername" className="fw-bold mx-2" style={{color: 'var(--accent-magenta)'}}>{currentUser.username}</span>!
      
      <Link to="/my-courses" className="btn btn-sm btn-primary ms-2 custom-btn" style={{padding: '5px 10px'}}>
        My Courses
      </Link>
      
      <button type="button" className="btn btn-sm btn-danger ms-2" onClick={handleLogout} style={{padding: '5px 10px'}}>
        Logout
      </button>
    </div>
  );
}

export default Navbar;