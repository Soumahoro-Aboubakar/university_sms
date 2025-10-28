import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import AdminDashboard from './components/admin/AdminDashboard';
import UserProfile from './components/user/UserProfile';

const AppContent = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  // Si non authentifié, afficher login ou signup
  if (!isAuthenticated) {
    if (showSignup) {
      return <Signup onBackToLogin={() => setShowSignup(false)} />;
    }
    return <Login onShowSignup={() => setShowSignup(true)} />;
  }

  // Si authentifié, afficher le dashboard approprié
  if (currentUser.type === 'admin') {
    return <AdminDashboard />;
  }

  // Étudiants et enseignants
  return <UserProfile />;
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;