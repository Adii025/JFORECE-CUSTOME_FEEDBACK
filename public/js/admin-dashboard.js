// Admin Dashboard CRUD and Management Logic

let adminFeedbacks = [];
let debounceTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAdmin()) return;

  loadAdminStats();
  loadAdminFeedbacks();

  const form = document.getElementById('admin-crud-form');
  if (form) {
    form.addEventListener('submit', handleAdminFormSubmit);
  }
});

// Switch between Feedbacks and Users tab
function switchTab(tab) {
  const feedbacksView = document.getElementById('view-feedbacks');
  const usersView = document.getElementById('view-users');
  const feedbacksBtn = document.getElementById('tab-feedbacks-btn');
  const usersBtn = document.getElementById('tab-users-btn');

  if (tab === 'feedbacks') {
    feedbacksView.style.display = 'block';
    usersView.style.display = 'none';
    feedbacksBtn.style.borderBottom = '3px solid var(--primary)';
    feedbacksBtn.style.color = 'var(--primary)';
    usersBtn.style.borderBottom = 'none';
    usersBtn.style.color = 'var(--text-muted)';
  } else {
    feedbacksView.style.display = 'none';
    usersView.style.display = 'block';
    usersBtn.style.borderBottom = '3px solid var(--primary)';
    usersBtn.style.color = 'var(--primary)';
    feedbacksBtn.style.borderBottom = 'none';
    feedbacksBtn.style.color = 'var(--text-muted)';
    loadAdminUsers();
  }
}

// Load Metrics
async function loadAdminStats() {
  try {
    const res = await api.getAdminStats();
    const stats = res.stats || {};

    document.getElementById('stat-total').textContent = stats.total || 0;
    document.getElementById('stat-avg').textContent = `${stats.avgRating || '0.0'} ★`;
    document.getElementById('stat-pending').textContent = stats.statusCounts?.Pending || 0;
    document.getElementById('stat-resolved').textContent = stats.statusCounts?.Resolved || 0;
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

// Load Feedbacks with Filter Parameters
async function loadAdminFeedbacks() {
  const tbody = document.getElementById('feedback-table-body');
  const params = {
    search: document.getElementById('filter-search')?.value.trim() || '',
    status: document.getElementById('filter-status')?.value || 'All',
    category: document.getElementById('filter-category')?.value || 'All',
    rating: document.getElementById('filter-rating')?.value || 'All',
    sortBy: document.getElementById('filter-sort')?.value || 'newest'
  };

  try {
    const res = await api.getAdminFeedbacks(params);
    adminFeedbacks = res.feedbacks || [];
    renderFeedbackTable(adminFeedbacks);
  } catch (error) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--danger); padding: 2rem;">
          Failed to load feedbacks: ${escapeHtml(error.message)}
        </td>
      </tr>
    `;
    showToast('Failed to load feedbacks: ' + error.message, 'error');
  }
}

// Render Feedback Table
function renderFeedbackTable(feedbacks) {
  const tbody = document.getElementById('feedback-table-body');

  if (feedbacks.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding: 3rem 1rem;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
          <div style="font-weight: 700; color: var(--text-main);">No matching feedbacks found</div>
          <div style="color: var(--text-muted); font-size: 0.9rem;">Try adjusting your filters or search keywords.</div>
        </td>
      </tr>
    `;
    return;
  }

  let html = '';
  feedbacks.forEach(fb => {
    html += `
      <tr id="row-${fb.id}">
        <td>
          <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(fb.userName || 'Anonymous')}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(fb.userEmail || 'N/A')}</div>
        </td>
        <td>
          <span class="badge badge-category" style="margin-bottom: 0.25rem;">${escapeHtml(fb.category)}</span>
          <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-main);">${escapeHtml(fb.title)}</div>
        </td>
        <td>
          ${renderStars(fb.rating)}
        </td>
        <td>
          <span style="font-size: 0.85rem; font-weight: 600;">${escapeHtml(fb.priority || 'Medium')}</span>
        </td>
        <td>
          <select class="form-select form-select-sm" style="font-size: 0.825rem; padding: 0.25rem 0.5rem; width: auto;" onchange="handleQuickStatusChange('${fb.id}', this.value)">
            <option value="Pending" ${fb.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="In Review" ${fb.status === 'In Review' ? 'selected' : ''}>In Review</option>
            <option value="Resolved" ${fb.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
            <option value="Rejected" ${fb.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </td>
        <td style="font-size: 0.825rem; color: var(--text-muted); white-space: nowrap;">
          ${formatDate(fb.createdAt)}
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="btn btn-secondary btn-sm" onclick="openViewModal('${fb.id}')" title="Read details">
            👁️ View
          </button>
          <button class="btn btn-secondary btn-sm" onclick="openAdminEditModal('${fb.id}')" title="Edit feedback & reply">
            ✏️ Edit
          </button>
          <button class="btn btn-outline-danger btn-sm" onclick="handleAdminDelete('${fb.id}')" title="Delete feedback">
            🗑️ Delete
          </button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

// Quick Inline Status Update (CRUD: Update)
async function handleQuickStatusChange(id, newStatus) {
  try {
    await api.adminUpdateFeedback(id, { status: newStatus });
    showToast(`Status updated to "${newStatus}"`, 'success');
    loadAdminStats();
  } catch (error) {
    showToast('Failed to update status: ' + error.message, 'error');
    loadAdminFeedbacks();
  }
}

// Modal: Open Create Feedback (CRUD: Create)
function openAdminCreateModal() {
  document.getElementById('admin-modal-title').textContent = 'Create New Feedback (Admin)';
  document.getElementById('admin-fb-id').value = '';
  document.getElementById('admin-fb-username').value = '';
  document.getElementById('admin-fb-username').placeholder = 'Submitter Name';
  document.getElementById('admin-fb-email').value = '';
  document.getElementById('admin-fb-email').placeholder = 'user@example.com';
  document.getElementById('admin-fb-title').value = '';
  document.getElementById('admin-fb-category').value = 'Feature Request';
  document.getElementById('admin-fb-rating').value = '5';
  document.getElementById('admin-fb-priority').value = 'Medium';
  document.getElementById('admin-fb-status').value = 'Pending';
  document.getElementById('admin-fb-comments').value = '';
  document.getElementById('admin-fb-response').value = '';
  document.getElementById('admin-btn-save').textContent = 'Create Feedback';

  document.getElementById('admin-crud-modal').classList.add('active');
}

// Modal: Open Edit Feedback (CRUD: Update)
function openAdminEditModal(id) {
  const fb = adminFeedbacks.find(item => item.id === id);
  if (!fb) return;

  document.getElementById('admin-modal-title').textContent = `Edit Feedback #${fb.id}`;
  document.getElementById('admin-fb-id').value = fb.id;
  document.getElementById('admin-fb-username').value = fb.userName || '';
  document.getElementById('admin-fb-email').value = fb.userEmail || '';
  document.getElementById('admin-fb-title').value = fb.title || '';
  document.getElementById('admin-fb-category').value = fb.category || 'Feature Request';
  document.getElementById('admin-fb-rating').value = String(fb.rating || 5);
  document.getElementById('admin-fb-priority').value = fb.priority || 'Medium';
  document.getElementById('admin-fb-status').value = fb.status || 'Pending';
  document.getElementById('admin-fb-comments').value = fb.comments || '';
  document.getElementById('admin-fb-response').value = fb.adminResponse || '';
  document.getElementById('admin-btn-save').textContent = 'Save Changes';

  document.getElementById('admin-crud-modal').classList.add('active');
}

function closeAdminModal() {
  document.getElementById('admin-crud-modal').classList.remove('active');
}

// Form Submit: Admin Create or Edit
async function handleAdminFormSubmit(e) {
  e.preventDefault();
  const saveBtn = document.getElementById('admin-btn-save');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  const id = document.getElementById('admin-fb-id').value;
  const payload = {
    userName: document.getElementById('admin-fb-username').value.trim(),
    userEmail: document.getElementById('admin-fb-email').value.trim(),
    title: document.getElementById('admin-fb-title').value.trim(),
    category: document.getElementById('admin-fb-category').value,
    rating: parseInt(document.getElementById('admin-fb-rating').value, 10),
    priority: document.getElementById('admin-fb-priority').value,
    status: document.getElementById('admin-fb-status').value,
    comments: document.getElementById('admin-fb-comments').value.trim(),
    adminResponse: document.getElementById('admin-fb-response').value.trim()
  };

  try {
    if (id) {
      // CRUD: Update
      await api.adminUpdateFeedback(id, payload);
      showToast('Feedback updated successfully!', 'success');
    } else {
      // CRUD: Create
      await api.adminCreateFeedback(payload);
      showToast('Feedback created successfully by Admin!', 'success');
    }

    closeAdminModal();
    await loadAdminStats();
    await loadAdminFeedbacks();
  } catch (error) {
    showToast(error.message || 'Operation failed.', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = id ? 'Save Changes' : 'Create Feedback';
  }
}

// Modal: Open View Details (CRUD: Read)
function openViewModal(id) {
  const fb = adminFeedbacks.find(item => item.id === id);
  if (!fb) return;

  const content = document.getElementById('view-modal-content');
  content.innerHTML = `
    <div style="margin-bottom: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span class="badge badge-category">${escapeHtml(fb.category)}</span>
        ${getStatusBadge(fb.status)}
      </div>
      <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">
        ${escapeHtml(fb.title)}
      </h3>
      <div style="display: flex; gap: 1rem; align-items: center; font-size: 0.85rem; color: var(--text-muted);">
        <span>Submitted by <strong>${escapeHtml(fb.userName)}</strong> (${escapeHtml(fb.userEmail)})</span>
        <span>•</span>
        <span>${formatDate(fb.createdAt)}</span>
      </div>
    </div>

    <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.25rem;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
        <div>
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">RATING:</span>
          <div>${renderStars(fb.rating)}</div>
        </div>
        <div>
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">PRIORITY:</span>
          <div style="font-weight: 600;">🚩 ${escapeHtml(fb.priority || 'Medium')}</div>
        </div>
        <div>
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">FEEDBACK ID:</span>
          <div style="font-family: monospace; font-size: 0.85rem;">${escapeHtml(fb.id)}</div>
        </div>
      </div>
      <hr style="border: none; border-top: 1px solid var(--border-color); margin: 0.75rem 0;">
      <div>
        <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">USER COMMENTS:</span>
        <p style="white-space: pre-wrap; margin-top: 0.25rem; font-size: 0.95rem;">${escapeHtml(fb.comments)}</p>
      </div>
    </div>

    <div style="background: var(--info-bg); border: 1px solid var(--info-border); border-radius: var(--radius-md); padding: 1rem;">
      <div style="font-weight: 700; color: var(--info-text); font-size: 0.85rem; margin-bottom: 0.35rem;">
        🛡️ ADMIN RESPONSE:
      </div>
      <p style="color: var(--info-text); font-size: 0.925rem; white-space: pre-wrap;">
        ${fb.adminResponse ? escapeHtml(fb.adminResponse) : '<em>No official response has been added yet. Click "Edit" to respond to this feedback.</em>'}
      </p>
    </div>
  `;

  document.getElementById('admin-view-modal').classList.add('active');
}

function closeViewModal() {
  document.getElementById('admin-view-modal').classList.remove('active');
}

// Delete Feedback (CRUD: Delete)
async function handleAdminDelete(id) {
  if (!confirm(`Are you sure you want to permanently delete Feedback #${id}? This action cannot be undone.`)) {
    return;
  }

  try {
    await api.adminDeleteFeedback(id);
    showToast(`Feedback #${id} deleted successfully.`, 'info');
    await loadAdminStats();
    await loadAdminFeedbacks();
  } catch (error) {
    showToast('Failed to delete feedback: ' + error.message, 'error');
  }
}

// Filter utilities
function debounceFilter() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    loadAdminFeedbacks();
  }, 300);
}

function applyFilters() {
  loadAdminFeedbacks();
}

function resetFilters() {
  if (document.getElementById('filter-search')) document.getElementById('filter-search').value = '';
  if (document.getElementById('filter-status')) document.getElementById('filter-status').value = 'All';
  if (document.getElementById('filter-category')) document.getElementById('filter-category').value = 'All';
  if (document.getElementById('filter-rating')) document.getElementById('filter-rating').value = 'All';
  if (document.getElementById('filter-sort')) document.getElementById('filter-sort').value = 'newest';
  loadAdminFeedbacks();
}

// Users Tab
async function loadAdminUsers() {
  const tbody = document.getElementById('user-table-body');
  try {
    const res = await api.getAdminUsers();
    const users = res.users || [];

    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem;">No users found.</td></tr>';
      return;
    }

    let html = '';
    users.forEach(u => {
      html += `
        <tr>
          <td style="font-family: monospace; font-size: 0.85rem;">${escapeHtml(u.id)}</td>
          <td style="font-weight: 600;">${escapeHtml(u.name)}</td>
          <td>${escapeHtml(u.email)}</td>
          <td><span class="role-tag ${u.role}">${escapeHtml(u.role)}</span></td>
          <td style="font-size: 0.85rem; color: var(--text-muted);">${formatDate(u.createdAt)}</td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--danger); padding:2rem;">Failed to load users: ${escapeHtml(error.message)}</td></tr>`;
  }
}

// Export utilities
function exportFeedbacks(format) {
  if (adminFeedbacks.length === 0) {
    showToast('No feedbacks available to export.', 'warning');
    return;
  }

  let dataStr = '';
  let filename = `feedbacks-${new Date().toISOString().split('T')[0]}`;

  if (format === 'json') {
    dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(adminFeedbacks, null, 2));
    filename += '.json';
  } else if (format === 'csv') {
    const headers = ['ID', 'User Name', 'User Email', 'Category', 'Title', 'Rating', 'Priority', 'Status', 'Comments', 'Admin Response', 'Created At'];
    const rows = adminFeedbacks.map(f => [
      `"${f.id}"`,
      `"${(f.userName || '').replace(/"/g, '""')}"`,
      `"${(f.userEmail || '').replace(/"/g, '""')}"`,
      `"${(f.category || '').replace(/"/g, '""')}"`,
      `"${(f.title || '').replace(/"/g, '""')}"`,
      f.rating,
      `"${f.priority || 'Medium'}"`,
      `"${f.status}"`,
      `"${(f.comments || '').replace(/"/g, '""')}"`,
      `"${(f.adminResponse || '').replace(/"/g, '""')}"`,
      `"${f.createdAt}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    filename += '.csv';
  }

  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast(`Exported ${adminFeedbacks.length} feedbacks to ${filename}`, 'success');
}
