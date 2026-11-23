const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
async function initializeDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      if (content && content.trim().length > 0) {
        JSON.parse(content);
        return; // Valid database already exists
      }
    } catch (e) {
      console.warn('Existing db.json was corrupt or empty, reinitializing...');
    }
  }

  const hashedPasswordAdmin = await bcrypt.hash('Admin@123', 10);
  const hashedPasswordUser = await bcrypt.hash('User@123', 10);
  const hashedPasswordJohn = await bcrypt.hash('User@123', 10);

  const adminId = 'u-admin-1';
  const userId = 'u-user-1';
  const johnId = 'u-user-2';

  const initialData = {
    users: [
      {
        id: adminId,
        name: 'System Administrator',
        email: 'admin@feedbackapp.com',
        password: hashedPasswordAdmin,
        role: 'admin',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: userId,
        name: 'Jane Doe',
        email: 'user@feedbackapp.com',
        password: hashedPasswordUser,
        role: 'user',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: johnId,
        name: 'John Smith',
        email: 'john@example.com',
        password: hashedPasswordJohn,
        role: 'user',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    feedbacks: [
      {
        id: 'fb-1',
        userId: userId,
        userName: 'Jane Doe',
        userEmail: 'user@feedbackapp.com',
        title: 'Provide Dark Mode in Dashboard',
        category: 'Feature Request',
        rating: 5,
        comments: 'I love using the application at night, but the bright white background strains my eyes. A dark mode option would make this 10x better!',
        priority: 'Medium',
        status: 'In Review',
        adminResponse: 'Thank you for the suggestion! Our design team is currently creating mockups for dark mode.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fb-2',
        userId: userId,
        userName: 'Jane Doe',
        userEmail: 'user@feedbackapp.com',
        title: 'Notification Bell Alignment on Mobile',
        category: 'Bug Report',
        rating: 3,
        comments: 'On iPhone Safari, the notification icon overlaps slightly with the profile avatar in viewport widths below 380px.',
        priority: 'High',
        status: 'Resolved',
        adminResponse: 'Fixed in version 1.2.4 patch. Header CSS flex-wrap corrected.',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fb-3',
        userId: johnId,
        userName: 'John Smith',
        userEmail: 'john@example.com',
        title: 'Export Feedbacks to CSV / Excel',
        category: 'Feature Request',
        rating: 4,
        comments: 'It would be super helpful for report generation if we could download our feedback history as a spreadsheet or CSV.',
        priority: 'Low',
        status: 'Pending',
        adminResponse: '',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'fb-4',
        userId: johnId,
        userName: 'John Smith',
        userEmail: 'john@example.com',
        title: 'Great customer support turnaround!',
        category: 'General Feedback',
        rating: 5,
        comments: 'Submitted an inquiry yesterday and received a helpful reply in under an hour. Keep up the great work!',
        priority: 'Low',
        status: 'Resolved',
        adminResponse: 'We appreciate the kind words! Passing this along to our support team.',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  console.log('Database initialized with default admin and demo user.');
}

// Helpers to read/write JSON database
function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], feedbacks: [] }, null, 2), 'utf-8');
  }
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error parsing db.json:', e);
    return { users: [], feedbacks: [] };
  }
}

function writeDb(data) {
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// User operations
async function findUserByEmail(email) {
  const db = readDb();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

async function findUserById(id) {
  const db = readDb();
  const user = db.users.find(u => u.id === id);
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

async function createUser({ name, email, password, role = 'user' }) {
  const db = readDb();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('A user with this email already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: `u-${uuidv4().substring(0, 8)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: hashedPassword,
    role: role === 'admin' ? 'admin' : 'user',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);

  const { password: _, ...safeUser } = newUser;
  return safeUser;
}

async function getAllUsers() {
  const db = readDb();
  return db.users.map(({ password, ...u }) => u);
}

// Feedback operations (CRUD)
async function getAllFeedbacks(filters = {}) {
  const db = readDb();
  let list = [...db.feedbacks];

  if (filters.category && filters.category !== 'All') {
    list = list.filter(f => f.category === filters.category);
  }
  if (filters.status && filters.status !== 'All') {
    list = list.filter(f => f.status === filters.status);
  }
  if (filters.rating && filters.rating !== 'All') {
    const r = parseInt(filters.rating, 10);
    list = list.filter(f => f.rating === r);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(f =>
      (f.title && f.title.toLowerCase().includes(q)) ||
      (f.comments && f.comments.toLowerCase().includes(q)) ||
      (f.userName && f.userName.toLowerCase().includes(q)) ||
      (f.userEmail && f.userEmail.toLowerCase().includes(q)) ||
      (f.category && f.category.toLowerCase().includes(q))
    );
  }

  // Sort
  if (filters.sortBy === 'oldest') {
    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (filters.sortBy === 'rating-desc') {
    list.sort((a, b) => b.rating - a.rating);
  } else if (filters.sortBy === 'rating-asc') {
    list.sort((a, b) => a.rating - b.rating);
  } else {
    // Default newest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return list;
}

async function getUserFeedbacks(userId) {
  const db = readDb();
  return db.feedbacks
    .filter(f => f.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getFeedbackById(id) {
  const db = readDb();
  return db.feedbacks.find(f => f.id === id) || null;
}

async function createFeedback({ userId, userName, userEmail, title, category, rating, comments, priority = 'Medium' }) {
  const db = readDb();
  const newFeedback = {
    id: `fb-${uuidv4().substring(0, 8)}`,
    userId,
    userName: userName || 'Anonymous',
    userEmail: userEmail || '',
    title: title.trim(),
    category: category || 'General Feedback',
    rating: Number(rating) || 5,
    comments: comments ? comments.trim() : '',
    priority: priority || 'Medium',
    status: 'Pending',
    adminResponse: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.feedbacks.unshift(newFeedback);
  writeDb(db);
  return newFeedback;
}

async function updateFeedback(id, updateData) {
  const db = readDb();
  const index = db.feedbacks.findIndex(f => f.id === id);
  if (index === -1) return null;

  const current = db.feedbacks[index];
  const updated = {
    ...current,
    ...updateData,
    id: current.id, // Immutable
    userId: current.userId, // Immutable
    updatedAt: new Date().toISOString()
  };

  // Ensure rating is a number if provided
  if (updated.rating !== undefined) {
    updated.rating = Number(updated.rating);
  }

  db.feedbacks[index] = updated;
  writeDb(db);
  return updated;
}

async function deleteFeedback(id) {
  const db = readDb();
  const initialCount = db.feedbacks.length;
  db.feedbacks = db.feedbacks.filter(f => f.id !== id);
  const deleted = db.feedbacks.length < initialCount;
  if (deleted) {
    writeDb(db);
  }
  return deleted;
}

async function getFeedbackStats() {
  const db = readDb();
  const total = db.feedbacks.length;
  const avgRating = total > 0
    ? (db.feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / total).toFixed(1)
    : '0.0';

  const statusCounts = {
    Pending: 0,
    'In Review': 0,
    Resolved: 0,
    Rejected: 0
  };

  const categoryCounts = {
    'Feature Request': 0,
    'Bug Report': 0,
    'General Feedback': 0,
    'Improvement': 0
  };

  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  db.feedbacks.forEach(f => {
    if (statusCounts[f.status] !== undefined) statusCounts[f.status]++;
    if (categoryCounts[f.category] !== undefined) categoryCounts[f.category]++;
    if (ratingCounts[f.rating] !== undefined) ratingCounts[f.rating]++;
  });

  return {
    total,
    avgRating,
    totalUsers: db.users.length,
    statusCounts,
    categoryCounts,
    ratingCounts
  };
}

module.exports = {
  initializeDb,
  findUserByEmail,
  findUserById,
  createUser,
  getAllUsers,
  getAllFeedbacks,
  getUserFeedbacks,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackStats
};
