// User Dashboard Logic

let currentFeedbacks = [];
const ratingLabels = {
  1: '1 - Poor',
  2: '2 - Fair',
  3: '3 - Good',
  4: '4 - Very Good',
  5: '5 - Excellent'
};

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuth()) return;

  const user = authStorage.getUser();
  if (user && document.getElementById('user-display-name')) {
    document.getElementById('user-display-name').textContent = user.name;
  }

  setupStarPicker();
  loadUserFeedbacks();

  const form = document.getElementById('feedback-form');
  if (form) {
    form.addEventListener('submit', handleFeedbackSubmit);
  }
});

// Load Feedbacks
async function loadUserFeedbacks() {
  const container = document.getElementById('feedbacks-container');
  const banner = document.getElementById('user-status-banner');

  try {
    const res = await api.getMyFeedbacks();
    currentFeedbacks = res.feedbacks || [];

    // Render requirement 3 status banner
    if (currentFeedbacks.length === 0) {
      banner.innerHTML = `
        <div class="card" style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 1.25rem 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <h3 style="color: #1e40af; font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem;">
                ℹ️ You haven't submitted any feedback yet
              </h3>
              <p style="color: #3b82f6; font-size: 0.9rem;">
                Let us know what you think, report a bug, or request a feature to help us improve!
              </p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="openAddFeedbackModal()">
              ➕ Add Feedback Now
            </button>
          </div>
        </div>
      `;

      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📝</div>
          <h2 class="empty-state-title">No Previous Feedback Found</h2>
          <p class="empty-state-desc">
            You can choose to add new feedback below to get started. Once submitted, your feedback will appear here and you can edit it at any time.
          </p>
          <button class="btn btn-primary" onclick="openAddFeedbackModal()">
            <span>➕</span> Add New Feedback
          </button>
        </div>
      `;
      return;
    }

    // Has previously submitted feedbacks
    banner.innerHTML = `
      <div class="card" style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 1.25rem 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="color: #166534; font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem;">
              ✅ Showing Your Previously Submitted Feedback (${currentFeedbacks.length})
            </h3>
            <p style="color: #15803d; font-size: 0.9rem;">
              You can review the status, edit any previously submitted feedback, or add another submission.
            </p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="openAddFeedbackModal()">
            ➕ Add Another Feedback
          </button>
        </div>
      </div>
    `;

    renderFeedbackCards(currentFeedbacks);
  } catch (error) {
    container.innerHTML = `
      <div class="card" style="text-align: center; color: var(--danger); padding: 2rem;">
        Failed to load feedbacks: ${escapeHtml(error.message)}
      </div>
    `;
    showToast('Failed to load feedbacks: ' + error.message, 'error');
  }
}

// Render Feedback Cards
function renderFeedbackCards(feedbacks) {
  const container = document.getElementById('feedbacks-container');
  let html = '<div class="feedback-grid">';

  feedbacks.forEach(fb => {
    const hasAdminReply = fb.adminResponse && fb.adminResponse.trim().length > 0;
    const isUpdated = fb.updatedAt && fb.updatedAt !== fb.createdAt;

    html += `
      <div class="feedback-card" id="card-${fb.id}">
        <div class="feedback-card-header">
          <div>
            <span class="badge badge-category" style="margin-bottom: 0.5rem;">${escapeHtml(fb.category)}</span>
            <h3 class="feedback-card-title">${escapeHtml(fb.title)}</h3>
          </div>
          <div>
            ${getStatusBadge(fb.status)}
          </div>
        </div>

        <div class="feedback-card-meta">
          <span>${renderStars(fb.rating)}</span>
          <span>•</span>
          <span title="Priority level">🚩 ${escapeHtml(fb.priority || 'Medium')}</span>
          <span>•</span>
          <span>📅 ${formatDate(fb.createdAt)}</span>
        </div>

        <div class="feedback-card-body">
          ${escapeHtml(fb.comments)}
        </div>

        ${hasAdminReply ? `
          <div class="admin-reply-box">
            <div class="admin-reply-title">
              <span>🛡️</span> Admin Official Response:
            </div>
            <div>${escapeHtml(fb.adminResponse)}</div>
          </div>
        ` : ''}

        <div class="feedback-card-footer">
          <div style="font-size: 0.775rem; color: var(--text-light);">
            ${isUpdated ? `Edited: ${formatDate(fb.updatedAt)}` : `Submitted: ${formatDate(fb.createdAt)}`}
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick="openEditFeedbackModal('${fb.id}')" title="Edit this feedback">
              ✏️ Edit
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="handleDeleteFeedback('${fb.id}')" title="Delete this feedback">
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

// Modal Handlers
function openAddFeedbackModal() {
  document.getElementById('modal-title').textContent = 'Submit New Feedback';
  document.getElementById('feedback-id').value = '';
  document.getElementById('fb-title').value = '';
  document.getElementById('fb-category').value = 'Feature Request';
  document.getElementById('fb-priority').value = 'Medium';
  document.getElementById('fb-comments').value = '';
  document.getElementById('btn-modal-save').textContent = 'Submit Feedback';
  setStarRating(5);

  document.getElementById('feedback-modal').classList.add('active');
}

function openEditFeedbackModal(id) {
  const fb = currentFeedbacks.find(item => item.id === id);
  if (!fb) return;

  document.getElementById('modal-title').textContent = 'Edit Previously Submitted Feedback';
  document.getElementById('feedback-id').value = fb.id;
  document.getElementById('fb-title').value = fb.title || '';
  document.getElementById('fb-category').value = fb.category || 'Feature Request';
  document.getElementById('fb-priority').value = fb.priority || 'Medium';
  document.getElementById('fb-comments').value = fb.comments || '';
  document.getElementById('btn-modal-save').textContent = 'Save Changes';
  setStarRating(fb.rating || 5);

  document.getElementById('feedback-modal').classList.add('active');
}

function closeFeedbackModal() {
  document.getElementById('feedback-modal').classList.remove('active');
}

// Star Rating Picker
function setupStarPicker() {
  const stars = document.querySelectorAll('#interactive-star-rating .star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      const rating = parseInt(star.getAttribute('data-rating'), 10);
      setStarRating(rating);
    });

    star.addEventListener('mouseenter', () => {
      const rating = parseInt(star.getAttribute('data-rating'), 10);
      highlightStars(rating);
    });
  });

  const ratingContainer = document.getElementById('interactive-star-rating');
  if (ratingContainer) {
    ratingContainer.addEventListener('mouseleave', () => {
      const current = parseInt(document.getElementById('fb-rating').value, 10);
      highlightStars(current);
    });
  }
}

function setStarRating(val) {
  const rating = Math.max(1, Math.min(5, val || 5));
  document.getElementById('fb-rating').value = rating;
  highlightStars(rating);
  document.getElementById('rating-label').textContent = ratingLabels[rating] || `${rating} Stars`;
}

function highlightStars(val) {
  const stars = document.querySelectorAll('#interactive-star-rating .star');
  stars.forEach(star => {
    const r = parseInt(star.getAttribute('data-rating'), 10);
    if (r <= val) {
      star.classList.add('filled');
    } else {
      star.classList.remove('filled');
    }
  });
}

// Submit handler for Add / Edit
async function handleFeedbackSubmit(e) {
  e.preventDefault();
  const saveBtn = document.getElementById('btn-modal-save');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  const id = document.getElementById('feedback-id').value;
  const payload = {
    title: document.getElementById('fb-title').value.trim(),
    category: document.getElementById('fb-category').value,
    priority: document.getElementById('fb-priority').value,
    rating: parseInt(document.getElementById('fb-rating').value, 10),
    comments: document.getElementById('fb-comments').value.trim()
  };

  try {
    if (id) {
      // Edit existing
      await api.updateFeedback(id, payload);
      showToast('Feedback updated successfully!', 'success');
    } else {
      // Add new
      await api.createFeedback(payload);
      showToast('Feedback submitted successfully! Thank you.', 'success');
    }

    closeFeedbackModal();
    await loadUserFeedbacks();
  } catch (error) {
    showToast(error.message || 'Failed to save feedback.', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = id ? 'Save Changes' : 'Submit Feedback';
  }
}

// Delete handler
async function handleDeleteFeedback(id) {
  if (!confirm('Are you sure you want to permanently delete this feedback?')) return;

  try {
    await api.deleteFeedback(id);
    showToast('Feedback deleted successfully.', 'info');
    await loadUserFeedbacks();
  } catch (error) {
    showToast(error.message || 'Failed to delete feedback.', 'error');
  }
}
