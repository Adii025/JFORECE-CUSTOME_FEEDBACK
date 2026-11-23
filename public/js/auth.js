// Auth state and navigation manager

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
});

function renderNavbar() {
  const navContainer = document.getElementById('navbar-container');
  if (!navContainer) return;

  const user = authStorage.getUser();
  const token = authStorage.getToken();
  const path = window.location.pathname;

  let linksHtml = '';
  if (token && user) {
    const isUser = user.role === 'user';
    const isAdmin = user.role === 'admin';

    linksHtml = `
      <a href="/index.html" class="nav-link ${path.endsWith('index.html') || path === '/' ? 'active' : ''}">Summary</a>
      <a href="/dashboard.html" class="nav-link ${path.endsWith('dashboard.html') ? 'active' : ''}">My Feedback</a>
      ${isAdmin ? `<a href="/admin.html" class="nav-link ${path.endsWith('admin.html') ? 'active' : ''}" style="color:#db2777; font-weight:700;">Admin Dashboard</a>` : ''}
      <div class="user-profile-badge">
        <span>👤 ${escapeHtml(user.name)}</span>
        <span class="role-tag ${user.role}">${user.role}</span>
      </div>
      <button onclick="handleLogout()" class="btn btn-secondary btn-sm" title="Log out of session">Logout</button>
    `;
  } else {
    linksHtml = `
      <a href="/index.html" class="nav-link ${path.endsWith('index.html') || path === '/' ? 'active' : ''}">Summary</a>
      <a href="/login.html" class="nav-link ${path.endsWith('login.html') ? 'active' : ''}">Login</a>
      <a href="/register.html" class="btn btn-primary btn-sm">Register</a>
    `;
  }

  navContainer.innerHTML = `
    <nav class="navbar">
      <div class="nav-container">
        <a href="/index.html" class="brand">
          <div class="brand-icon">💬</div>
          <span>FeedbackApp</span>
        </a>
        <div class="nav-links">
          ${linksHtml}
        </div>
      </div>
    </nav>
  `;
}

function handleLogout() {
  if (confirm('Are you sure you want to log out?')) {
    api.logout();
  }
}

// Route Guards
function checkAuth() {
  const token = authStorage.getToken();
  const user = authStorage.getUser();
  if (!token || !user) {
    window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
    return false;
  }
  return true;
}

function checkAdmin() {
  if (!checkAuth()) return false;
  const user = authStorage.getUser();
  if (user.role !== 'admin') {
    alert('Access restricted: Only administrators can access the Admin Dashboard.');
    window.location.href = '/dashboard.html';
    return false;
  }
  return true;
}

function redirectIfAlreadyLoggedIn() {
  const token = authStorage.getToken();
  const user = authStorage.getUser();
  if (token && user) {
    if (user.role === 'admin') {
      window.location.href = '/admin.html';
    } else {
      window.location.href = '/dashboard.html';
    }
  }
}
