// API Client connected directly to Spring Boot backend and PostgreSQL database
const API_BASE = 'http://localhost:8081/api';

// Only Admin exists by default as requested. All other users are registered by you!
const DEFAULT_USERS = [
  { id: 1, username: 'admin', email: 'admin@feedback.com', password: 'admin123', fullName: 'System Administrator', role: 'ADMIN' }
];

export const api = {
  // Step 1: User / Admin Login
  async login(usernameOrEmail, password) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed. Please verify credentials.');
      return data;
    } catch (e) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) {
        throw e;
      }
      // If backend is not running yet, allow demo admin or throw helpful prompt
      if (usernameOrEmail.toLowerCase() === 'admin' && password === 'admin123') {
        return {
          success: true,
          message: 'Logged in as Admin (Offline mode)',
          token: 'mock-admin-token',
          user: DEFAULT_USERS[0]
        };
      }
      throw new Error('Backend server is not running on port 8081 or database is disconnected. Please start backend (cd backend; mvn spring-boot:run).');
    }
  },

  // Step 2: User Registration (Saves directly into PostgreSQL users table)
  async register(username, email, password, fullName, role = 'USER') {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, fullName, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed.');
      return data;
    } catch (e) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) {
        throw e;
      }
      throw new Error('Backend server is not running on port 8080. Please start backend with: cd backend; mvn spring-boot:run');
    }
  },

  // Step 1 & 3: Get User's previously submitted feedbacks from PostgreSQL
  async getUserFeedbacks(userId, username) {
    try {
      const query = username ? `username=${encodeURIComponent(username)}` : `userId=${userId}`;
      const res = await fetch(`${API_BASE}/feedback/my-feedback?${query}`, {
        headers: { 'X-User-Id': (userId || '').toString() }
      });
      if (res.ok) return await res.json();
      return [];
    } catch (e) {
      console.warn('Backend unavailable to fetch feedbacks:', e);
      return [];
    }
  },

  // Step 3: Add new feedback (Saves directly into PostgreSQL feedbacks table)
  async createFeedback(userId, feedbackData) {
    const payload = {
      userId: userId ? Number(userId) : null,
      username: feedbackData.username || undefined,
      userFullName: feedbackData.userFullName || undefined,
      title: feedbackData.title,
      category: feedbackData.category || 'General',
      rating: Number(feedbackData.rating) || 5,
      comments: feedbackData.comments
    };

    try {
      const res = await fetch(`${API_BASE}/feedback?userId=${userId || ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': (userId || '').toString()
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to save feedback to PostgreSQL database');
      }

      return await res.json();
    } catch (e) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) {
        throw e;
      }
      throw new Error('Could not connect to PostgreSQL backend at http://localhost:8081. Please ensure Spring Boot is running: cd backend; mvn spring-boot:run');
    }
  },

  // Step 1 & Step 3: Edit previously submitted feedback in PostgreSQL
  async updateFeedback(userId, feedbackId, updateData) {
    try {
      const res = await fetch(`${API_BASE}/feedback/${feedbackId}?userId=${userId || ''}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': (userId || '').toString()
        },
        body: JSON.stringify(updateData)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to update feedback in PostgreSQL database');
      }

      return await res.json();
    } catch (e) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) {
        throw e;
      }
      throw new Error('Could not connect to PostgreSQL backend at http://localhost:8081.');
    }
  },

  // Step 4: Admin CRUD - Read All with Search & Filters from PostgreSQL
  async getAdminFeedbacks(category = 'ALL', status = 'ALL', search = '') {
    try {
      const params = new URLSearchParams({ category, status, search });
      const res = await fetch(`${API_BASE}/admin/feedback?${params.toString()}`);
      if (res.ok) return await res.json();
      return [];
    } catch (e) {
      console.warn('Backend unavailable:', e);
      return [];
    }
  },

  // Step 4: Admin CRUD - Stats Summary from PostgreSQL
  async getAdminStats() {
    try {
      const res = await fetch(`${API_BASE}/admin/feedback/stats`);
      if (res.ok) return await res.json();
      return { totalFeedbacks: 0, averageRating: 0, pendingCount: 0, inReviewCount: 0, resolvedCount: 0, rejectedCount: 0 };
    } catch (e) {
      return { totalFeedbacks: 0, averageRating: 0, pendingCount: 0, inReviewCount: 0, resolvedCount: 0, rejectedCount: 0 };
    }
  },

  // Step 4: Admin CRUD - Create directly in PostgreSQL
  async createAdminFeedback(data) {
    try {
      const res = await fetch(`${API_BASE}/admin/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create feedback in PostgreSQL');
      return await res.json();
    } catch (e) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) throw e;
      throw new Error('Backend not reachable at http://localhost:8081.');
    }
  },

  // Step 4: Admin CRUD - Update in PostgreSQL
  async updateAdminFeedback(id, updateData) {
    try {
      const res = await fetch(`${API_BASE}/admin/feedback/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (!res.ok) throw new Error('Failed to update feedback in PostgreSQL');
      return await res.json();
    } catch (e) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) throw e;
      throw new Error('Backend not reachable at http://localhost:8081.');
    }
  },

  // Step 4: Admin CRUD - Delete from PostgreSQL
  async deleteAdminFeedback(id) {
    try {
      const res = await fetch(`${API_BASE}/admin/feedback/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete feedback in PostgreSQL');
      return await res.json();
    } catch (e) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) throw e;
      throw new Error('Backend not reachable at http://localhost:8081.');
    }
  }
};

