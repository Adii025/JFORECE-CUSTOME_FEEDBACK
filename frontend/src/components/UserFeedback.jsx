import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const CATEGORIES = ['UI/UX', 'Performance', 'Bug Report', 'Feature Request', 'Customer Support', 'General'];

export default function UserFeedback() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState(null);

  // Form State
  const [formState, setFormState] = useState({
    title: '',
    category: 'UI/UX',
    rating: 5,
    comments: ''
  });

  const loadUserFeedbacks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getUserFeedbacks(user.id, user.username);
      setFeedbacks(data);
      // Auto open add form if no feedbacks exist yet
      if (data.length === 0) {
        setShowAddForm(true);
      }
    } catch (err) {
      console.error('Failed to load feedback', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserFeedbacks();
  }, [user]);

  const handleStartEdit = (fb) => {
    setEditingId(fb.id);
    setShowAddForm(false);
    setFormState({
      title: fb.title,
      category: fb.category,
      rating: fb.rating,
      comments: fb.comments
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormState({ title: '', category: 'UI/UX', rating: 5, comments: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.title.trim() || !formState.comments.trim()) {
      alert('Please fill in both title and feedback comments.');
      return;
    }

    try {
      if (editingId) {
        // Step 1 & 3: Edit previously submitted feedback
        const updated = await api.updateFeedback(user.id, editingId, formState);
        setFeedbacks(feedbacks.map(f => f.id === editingId ? { ...f, ...updated } : f));
        setFeedbackNotice({ type: 'success', message: 'Your feedback has been successfully updated!' });
      } else {
        // Step 3: Add new feedback (persists directly into PostgreSQL)
        const created = await api.createFeedback(user.id, {
          ...formState,
          username: user.username,
          userFullName: user.fullName || user.username
        });
        setFeedbacks([created, ...feedbacks]);
        setFeedbackNotice({ type: 'success', message: 'Thank you! Your feedback has been submitted for review.' });
      }
      handleCancelForm();
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch (err) {
      alert(err.message || 'Operation failed.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Resolved</span>;
      case 'IN_REVIEW':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">In Review</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">Closed</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Pending</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Banner & Summary */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-100 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-100 text-xs font-semibold mb-3 backdrop-blur-sm">
              <span>Steps 1 & 3: User Feedback Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.fullName || user?.username}!
            </h1>
            <p className="text-indigo-100 text-sm mt-1 max-w-xl">
              Track your previously submitted feedback, edit your existing responses, or share new suggestions with our team.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10">
            <div className="text-center px-3 border-r border-white/20">
              <span className="block text-2xl font-black">{feedbacks.length}</span>
              <span className="text-xs text-indigo-100">Submitted</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-2xl font-black">
                {feedbacks.filter(f => f.status === 'RESOLVED').length}
              </span>
              <span className="text-xs text-indigo-100">Resolved</span>
            </div>
          </div>
        </div>
      </div>

      {feedbackNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{feedbackNotice.message}</span>
          </div>
          <button onClick={() => setFeedbackNotice(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">&times;</button>
        </div>
      )}

      {/* Action Header / Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {editingId ? 'Edit Previously Submitted Feedback' : (showAddForm ? 'Submit New Feedback' : 'Your Submitted Feedback')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {editingId 
              ? 'Update your feedback details and rating below'
              : (feedbacks.length > 0 ? 'Review your past submissions or submit another feedback entry' : 'You have not submitted any feedback yet')}
          </p>
        </div>

        {!editingId && !showAddForm && (
          <button
            onClick={() => {
              setFormState({ title: '', category: 'UI/UX', rating: 5, comments: '' });
              setShowAddForm(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 transition flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Feedback</span>
          </button>
        )}
      </div>

      {/* Edit or Add Feedback Form (Step 3) */}
      {(showAddForm || editingId) && (
        <div className="bg-white rounded-2xl border border-indigo-100 shadow-xl p-6 sm:p-8 mb-8 relative">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <h3 className="font-bold text-lg text-slate-900">
                {editingId ? 'Step 3: Edit Your Feedback' : 'Step 3: New Feedback Form'}
              </h3>
            </div>
            {feedbacks.length > 0 && (
              <button
                type="button"
                onClick={handleCancelForm}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Feedback Title / Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formState.title}
                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                placeholder="e.g. Feedback by Aditya Shinde: Mobile navigation feels smooth"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900 bg-white transition"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Rating: <span className="text-amber-500 font-bold">{formState.rating} / 5 Stars</span>
                </label>
                <div className="flex items-center space-x-1 py-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormState({ ...formState, rating: star })}
                      className="p-1 text-2xl transition hover:scale-125 focus:outline-none"
                    >
                      {star <= formState.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Detailed Comments <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-slate-400">{formState.comments.length} characters</span>
              </div>
              <textarea
                rows="4"
                value={formState.comments}
                onChange={(e) => setFormState({ ...formState, comments: e.target.value })}
                placeholder="Detailed feedback by Aditya Shinde: Describe your suggestion or compliments in detail..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900 transition"
              ></textarea>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3">
              {feedbacks.length > 0 && (
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 transition flex items-center space-x-2"
              >
                <span>{editingId ? 'Save & Update Feedback' : 'Submit Feedback'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Previously Submitted Feedback List (Step 1 & 3) */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-xs text-slate-500 mt-3">Loading feedback submissions...</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg text-slate-800">No Feedback Submitted Yet</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            You haven't submitted any feedback yet. Share your experience, report a problem, or request a feature!
          </p>
          <button
            onClick={() => {
              setFormState({ title: '', category: 'UI/UX', rating: 5, comments: '' });
              setShowAddForm(true);
            }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-indigo-100"
          >
            Submit Your First Feedback
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className={`bg-white rounded-2xl border transition-all p-5 sm:p-6 shadow-sm hover:shadow-md ${
                editingId === fb.id ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {fb.category}
                  </span>
                  {getStatusBadge(fb.status)}
                  <span className="text-xs text-amber-500 font-bold ml-1">
                    {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <span>Submitted on {new Date(fb.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <button
                    onClick={() => handleStartEdit(fb)}
                    className="inline-flex items-center space-x-1 font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-50 transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit Feedback</span>
                  </button>
                </div>
              </div>

              <h4 className="text-base font-bold text-slate-900 mb-1.5">{fb.title}</h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{fb.comments}</p>

              {/* Admin Remark / Response if available */}
              {fb.adminRemarks && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-start space-x-2.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
                  <span className="text-base">💬</span>
                  <div className="text-xs">
                    <span className="font-bold text-slate-700">Admin Response: </span>
                    <span className="text-slate-600">{fb.adminRemarks}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
