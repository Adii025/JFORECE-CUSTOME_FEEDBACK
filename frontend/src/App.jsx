import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import UserFeedback from './components/UserFeedback';
import AdminDashboard from './components/AdminDashboard';

function AppContent() {
  const { user, isAdmin } = useAuth();
  // Available views: 'login', 'register', 'feedback', 'admin'
  const [currentView, setCurrentView] = useState(() => {
    const savedUser = localStorage.getItem('fb_current_user');
    if (!savedUser) return 'login';
    const parsed = JSON.parse(savedUser);
    return parsed.role === 'ADMIN' ? 'admin' : 'feedback';
  });

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleLoginSuccess = (redirectView) => {
    setCurrentView(redirectView);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      <main className="flex-1">
        {/* Step Navigation Pill Bar for Demo / Verification */}
        <div className="bg-white border-b border-slate-200 py-2.5 px-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs overflow-x-auto gap-4">
            <span className="font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Project Steps:
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentView('login')}
                className={`px-3 py-1 rounded-full font-medium transition whitespace-nowrap ${
                  currentView === 'login'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                1. Login
              </button>
              <button
                onClick={() => setCurrentView('register')}
                className={`px-3 py-1 rounded-full font-medium transition whitespace-nowrap ${
                  currentView === 'register'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                2. Registration
              </button>
              <button
                onClick={() => {
                  if (!user) setCurrentView('login');
                  else setCurrentView('feedback');
                }}
                className={`px-3 py-1 rounded-full font-medium transition whitespace-nowrap ${
                  currentView === 'feedback'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                3. Edit / Add Feedback & Summary
              </button>
              <button
                onClick={() => {
                  if (!user) setCurrentView('login');
                  else setCurrentView('admin');
                }}
                className={`px-3 py-1 rounded-full font-medium transition whitespace-nowrap ${
                  currentView === 'admin'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                4. Admin Dashboard (CRUD)
              </button>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        {currentView === 'login' && (
          <Login onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />
        )}
        {currentView === 'register' && (
          <Register onNavigate={handleNavigate} onRegisterSuccess={handleLoginSuccess} />
        )}
        {currentView === 'feedback' && (
          user ? <UserFeedback /> : <Login onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />
        )}
        {currentView === 'admin' && (
          user ? <AdminDashboard /> : <Login onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>Feedback Management Application • Built with React & Spring Boot</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
