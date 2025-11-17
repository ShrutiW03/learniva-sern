import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Try to get user data from localStorage to persist login
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('learnivaUser');
    return user ? JSON.parse(user) : null;
  });

  const isLoggedIn = !!currentUser;

  const login = (userData) => {
    // userData from your API: { userId, username }
    const user = { id: userData.userId, username: userData.username };
    localStorage.setItem('learnivaUser', JSON.stringify(user));
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('learnivaUser');
    setCurrentUser(null);
  };

  const authValue = {
    isLoggedIn,
    currentUser,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};