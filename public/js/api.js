// API client and utility library
const API_BASE = '/api';

const authStorage = {
  getToken: () => localStorage.getItem('feedback_token'),
  setToken: (token) => localStorage.setItem('feedback_token', token),
  getUser: () => {
    try {
      const u = localStorage.getItem('feedback_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem('feedback_user', JSON.stringify(user)),
  clearAuth: () => {
    localStorage.removeItem('feedback_token');
    localStorage.removeItem('feedback_user');
  }
};

async function apiRequest(endpoint, options = {}) {
  const token = authStorage.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        authStorage.clearAuth();
        if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('index.html')) {
          window.location.href = '/login.html?session_expired=true';
        }
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

const api = {
  // Auth
  async login(email, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      authStorage.setToken(data.token);
      authStorage.setUser(data.user);
    }
    return data;
  },

  async register(payload) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (data.token) {
      authStorage.setToken(data.token);
      authStorage.setUser(data.user);
    }
    return data;
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    }
    authStorage.clearAuth();
    window.location.href = '/login.html';
  },

  async getMe() {
    return apiRequest('/auth/me');
  },

  // User Feedbacks
  async getMyFeedbacks() {
    return apiRequest('/feedbacks/my');
  },

  async getFeedback(id) {
    return apiRequest(`/feedbacks/${id}`);
  },

  async createFeedback(payload) {
    return apiRequest('/feedbacks', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateFeedback(id, payload) {
    return apiRequest(`/feedbacks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteFeedback(id) {
    return apiRequest(`/feedbacks/${id}`, {
      method: 'DELETE'
    });
  },

  // Admin APIs
  async getAdminStats() {
    return apiRequest('/admin/stats');
  },

  async getAdminFeedbacks(params = {}) {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.status) query.append('status', params.status);
    if (params.rating) query.append('rating', params.rating);
    if (params.search) query.append('search', params.search);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/admin/feedbacks${qStr}`);
  },

  async getAdminFeedbackById(id) {
    return apiRequest(`/admin/feedbacks/${id}`);
  },

  async adminCreateFeedback(payload) {
    return apiRequest('/admin/feedbacks', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async adminUpdateFeedback(id, payload) {
    return apiRequest(`/admin/feedbacks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async adminDeleteFeedback(id) {
    return apiRequest(`/admin/feedbacks/${id}`, {
      method: 'DELETE'
    });
  },

  async getAdminUsers() {
    return apiRequest('/admin/users');
  }
};

// Toast notification helper
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  toast.innerHTML = `
    <span>${iconMap[type] || '🔔'}</span>
    <span style="flex:1;">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Helpers
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderStars(rating) {
  const r = Math.round(Number(rating) || 0);
  let html = '<div class="star-display">';
  for (let i = 1; i <= 5; i++) {
    if (i <= r) {
      html += '<span class="star-filled">★</span>';
    } else {
      html += '<span class="star-empty">☆</span>';
    }
  }
  html += ` <span style="font-size:0.85rem; color:#64748b; font-weight:600; margin-left:4px;">(${r}/5)</span></div>`;
  return html;
}

function getStatusBadge(status) {
  const s = status || 'Pending';
  const slug = s.toLowerCase().replace(/\s+/g, '-');
  return `<span class="badge badge-${slug}">● ${escapeHtml(s)}</span>`;
}
