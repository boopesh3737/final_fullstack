import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuizPage from './pages/QuizPage';
import QuizPlayPage from './pages/QuizPlayPage';
import CreateQuizPage from './pages/CreateQuizPage';
import TournamentPage from './pages/TournamentPage';
import TournamentPlayPage from './pages/TournamentPlayPage';
import CreateTournamentPage from './pages/CreateTournamentPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { user, isLoading, checkAuth } = useAuthStore();

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {user && <Navbar />}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <HomePage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/quiz" element={user ? <QuizPage /> : <Navigate to="/login" />} />
          <Route path="/quiz/:id" element={user ? <QuizPlayPage /> : <Navigate to="/login" />} />
          <Route path="/create-quiz" element={user ? <CreateQuizPage /> : <Navigate to="/login" />} />
          <Route path="/tournaments" element={user ? <TournamentPage /> : <Navigate to="/login" />} />
          <Route path="/tournament/:id" element={user ? <TournamentPlayPage /> : <Navigate to="/login" />} />
          <Route path="/create-tournament" element={user ? <CreateTournamentPage /> : <Navigate to="/login" />} />
          <Route path="/leaderboard" element={user ? <LeaderboardPage /> : <Navigate to="/login" />} />
          <Route path="/profile/:id?" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }
          }}
        />
      </div>
    </Router>
  );
}

export default App;