import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onNavigate, onLoginSuccess }) {
  const { login, loading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please fill in both fields.');
      return;
    }

    try {
      const res = await login(identifier, password);
      if (res.user.role === 'ADMIN') {
        onLoginSuccess('admin');
      } else {
        onLoginSuccess('feedback');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const fillQuickDemo = (role) => {
    if (role === 'admin') {
      setIdentifier('admin');
      setPassword('admin123');
    } else {
      setIdentifier('Aditya');
      setPassword('Aditya@5961');
    }
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
        {/* Step Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-indigo-50 text-indigo-700">
            Step 1: User Login
          </span>
          <span className="text-xs text-slate-400">Feedback Hub</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Sign in to view your feedback summary or submit new feedback.
        </p>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start space-x-2">
            <svg className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Username or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="aditya_shinde or admin"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-70"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials for Fast Evaluation */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
            One-Click Admin Demo Fill
          </p>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fillQuickDemo('admin')}
              className="w-full py-2.5 px-3 text-xs font-semibold rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 transition text-center shadow-sm flex items-center justify-center space-x-1.5"
            >
              <span>👑 Fill Default Admin Credentials (</span><span className="font-mono font-bold">admin / admin123</span><span>)</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Regular users: Please create your account on the Registration page.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-semibold text-indigo-600 hover:text-indigo-800 transition"
          >
            Go to Step 2: Register
          </button>
        </p>
      </div>
    </div>
  );
}
