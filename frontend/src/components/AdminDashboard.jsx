import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const CATEGORIES = ['ALL', 'UI/UX', 'Performance', 'Bug Report', 'Feature Request', 'Customer Support', 'General'];
const STATUSES = ['ALL', 'PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    averageRating: 0,
    pendingCount: 0,
    inReviewCount: 0,
    resolvedCount: 0,
    rejectedCount: 0
  });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active Edit/Delete State
  const [editingItem, setEditingItem] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    title: '',
    category: 'UI/UX',
    rating: 5,
    comments: '',
    status: 'PENDING',
    adminRemarks: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [list, statsData] = await Promise.all([
        api.getAdminFeedbacks(filterCategory, filterStatus, searchQuery),
        api.getAdminStats()
      ]);
      setFeedbacks(list);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterCategory, filterStatus, searchQuery]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // CRUD 1: CREATE
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.comments.trim()) {
      alert('Please fill in required fields.');
      return;
    }
    try {
      const created = await api.createAdminFeedback(createForm);
      setFeedbacks([created, ...feedbacks]);
      setShowCreateModal(false);
      setCreateForm({ title: '', category: 'UI/UX', rating: 5, comments: '', status: 'PENDING', adminRemarks: '' });
      showToast('New feedback successfully logged by Admin!');
      api.getAdminStats().then(setStats);
    } catch (err) {
      alert(err.message || 'Create operation failed');
    }
  };

  // CRUD 3: UPDATE
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const updated = await api.updateAdminFeedback(editingItem.id, editingItem);
      setFeedbacks(feedbacks.map(f => f.id === editingItem.id ? updated : f));
      setEditingItem(null);
      showToast('Feedback updated and status saved!');
      api.getAdminStats().then(setStats);
    } catch (err) {
      alert(err.message || 'Update failed');
    }
  };

  // CRUD 4: DELETE
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await api.deleteAdminFeedback(deletingId);
      setFeedbacks(feedbacks.filter(f => f.id !== deletingId));
      setDeletingId(null);
      showToast('Feedback deleted successfully.', 'info');
      api.getAdminStats().then(setStats);
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RESOLVED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Resolved</span>;
      case 'IN_REVIEW':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">In Review</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center space-x-3 text-sm font-semibold transition ${
          notification.type === 'info' ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'
        }`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-2">
            <span>Step 4: Admin Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Feedback Operations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Perform full CRUD operations on all user feedback submissions, moderate ratings, and reply to customers.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 transition flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Admin Create Feedback</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Feedbacks</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalFeedbacks}</span>
            <span className="text-xs text-slate-400">entries</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Rating</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-500">{stats.averageRating}</span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Review</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-extrabold text-blue-600">{stats.pendingCount}</span>
            <span className="text-xs text-slate-400">awaiting</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolved</p>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-600">{stats.resolvedCount}</span>
            <span className="text-xs text-slate-400">closed</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Aditya Shinde, feedback, user, or comments..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUSES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {(filterCategory !== 'ALL' || filterStatus !== 'ALL' || searchQuery) && (
            <button
              onClick={() => { setFilterCategory('ALL'); setFilterStatus('ALL'); setSearchQuery(''); }}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* CRUD 2: READ (Data Table) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-xs text-slate-500 mt-3">Fetching feedbacks...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 text-sm">No feedbacks matched your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50/75">
                <tr>
                  <th className="px-6 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wider">User</th>
                  <th className="px-6 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wider">Category & Title</th>
                  <th className="px-6 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3.5 font-bold text-slate-600 text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbacks.map((fb) => (
                  <tr key={fb.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{fb.userFullName || fb.username}</div>
                      <div className="text-xs text-slate-400">@{fb.username}</div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 mb-1">
                        {fb.category}
                      </span>
                      <div className="font-medium text-slate-800 line-clamp-1">{fb.title}</div>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{fb.comments}</p>
                      {fb.adminRemarks && (
                        <div className="text-[11px] text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded mt-1.5 inline-block border border-indigo-100">
                          <strong>Admin Reply:</strong> {fb.adminRemarks}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-amber-500 font-bold text-sm">
                        {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">({fb.rating}/5)</span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(fb.status)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium space-x-2">
                      {/* CRUD 3: Update trigger */}
                      <button
                        onClick={() => setEditingItem({ ...fb })}
                        className="px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold transition inline-flex items-center space-x-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      {/* CRUD 4: Delete trigger */}
                      <button
                        onClick={() => setDeletingId(fb.id)}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold transition inline-flex items-center space-x-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Modal: EDIT / UPDATE */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Admin Edit Feedback #{editingItem.id}</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Feedback Title</label>
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Category</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORIES.filter(c => c !== 'ALL').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Status</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {STATUSES.filter(s => s !== 'ALL').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Rating: {editingItem.rating} Stars
                </label>
                <div className="flex space-x-1 py-1">
                  {[1, 2, 3, 4, 5].map(st => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setEditingItem({ ...editingItem, rating: st })}
                      className="text-2xl"
                    >
                      {st <= editingItem.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Feedback Comments</label>
                <textarea
                  rows="3"
                  value={editingItem.comments}
                  onChange={(e) => setEditingItem({ ...editingItem, comments: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-indigo-700 mb-1">Admin Response / Remarks</label>
                <textarea
                  rows="2"
                  value={editingItem.adminRemarks || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, adminRemarks: e.target.value })}
                  placeholder="Official resolution note by Admin Aditya Shinde..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-indigo-200 bg-indigo-50/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRUD Modal: CREATE */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Admin: Log New Feedback Record</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Title / Subject *</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Feedback headline by Aditya Shinde"
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Category</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    {CATEGORIES.filter(c => c !== 'ALL').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Initial Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    {STATUSES.filter(s => s !== 'ALL').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Rating: {createForm.rating} Stars</label>
                <div className="flex space-x-1 py-1">
                  {[1, 2, 3, 4, 5].map(st => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setCreateForm({ ...createForm, rating: st })}
                      className="text-2xl"
                    >
                      {st <= createForm.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Comments *</label>
                <textarea
                  rows="3"
                  value={createForm.comments}
                  onChange={(e) => setCreateForm({ ...createForm, comments: e.target.value })}
                  placeholder="Feedback details by Aditya Shinde..."
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-indigo-700 mb-1">Admin Response (Optional)</label>
                <textarea
                  rows="2"
                  value={createForm.adminRemarks}
                  onChange={(e) => setCreateForm({ ...createForm, adminRemarks: e.target.value })}
                  placeholder="Admin resolution note by Aditya Shinde..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-indigo-200 bg-indigo-50/30"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm"
                >
                  Create Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRUD Modal: DELETE CONFIRMATION */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">Delete Feedback Record?</h3>
            <p className="text-xs text-slate-500 mb-6">
              Are you sure you want to delete feedback #{deletingId}? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
