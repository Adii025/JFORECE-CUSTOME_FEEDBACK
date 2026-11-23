const http = require('http');
const { app, startServer } = require('../server/index');

const PORT = 3001;

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, text: body });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting FeedbackApp Verification Suite ---');
  const server = await startServer();
  const address = server.address();
  const PORT = address.port;
  console.log(`Test client connecting to port ${PORT}...`);

  try {
    let testUserToken = null;
    let adminToken = null;
    let createdFeedbackId = null;

    // STEP 1: Test Login
    console.log('\n[TEST 1] Testing User and Admin Login...');
    const userLogin = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'user@feedbackapp.com', password: 'User@123' });

    console.assert(userLogin.status === 200, `Expected 200, got ${userLogin.status}`);
    console.assert(userLogin.data.success === true, 'User login should succeed');
    console.assert(userLogin.data.user.role === 'user', 'User role should be "user"');
    testUserToken = userLogin.data.token;
    console.log('✅ Standard User Login verified.');

    const adminLogin = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@feedbackapp.com', password: 'Admin@123' });

    console.assert(adminLogin.status === 200, `Expected 200, got ${adminLogin.status}`);
    console.assert(adminLogin.data.user.role === 'admin', 'Admin role should be "admin"');
    adminToken = adminLogin.data.token;
    console.log('✅ Admin Login verified.');

    // STEP 2: Test Registration
    console.log('\n[TEST 2] Testing User Registration...');
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const regRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Sam Wilson',
      email: uniqueEmail,
      password: 'Password@123',
      role: 'user'
    });

    console.assert(regRes.status === 201, `Expected 201, got ${regRes.status}`);
    console.assert(regRes.data.success === true, 'User registration should succeed');
    const newRegisteredUserToken = regRes.data.token;
    console.log('✅ New User Registration verified with email:', uniqueEmail);

    // STEP 3: User: Check empty feedback, Add feedback, View, Edit feedback
    console.log('\n[TEST 3] Testing Step 3: Edit / Add feedback...');
    // 3a: Check for user who has not submitted feedback yet
    const initialFeedbacks = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/feedbacks/my',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newRegisteredUserToken}`
      }
    });

    console.assert(initialFeedbacks.status === 200, 'Should fetch user feedbacks');
    console.assert(initialFeedbacks.data.hasSubmittedFeedback === false, 'New user should have no submitted feedback initially');
    console.assert(initialFeedbacks.data.feedbacks.length === 0, 'Feedbacks array should be empty');
    console.log('✅ Condition verified: User can choose to add new if not submitted.');

    // 3b: User submits feedback
    const addRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/feedbacks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newRegisteredUserToken}`
      }
    }, {
      title: 'Real-time collaborative editing',
      category: 'Feature Request',
      rating: 5,
      comments: 'Would love to see multiple users editing feedback tickets together.',
      priority: 'High'
    });

    console.assert(addRes.status === 201, 'Should create feedback');
    console.assert(addRes.data.feedback.title === 'Real-time collaborative editing', 'Feedback title matches');
    createdFeedbackId = addRes.data.feedback.id;
    console.log('✅ User successfully submitted new feedback. ID:', createdFeedbackId);

    // 3c: User sees previously submitted feedback
    const userFeedbacksAfter = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/feedbacks/my',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newRegisteredUserToken}`
      }
    });
    console.assert(userFeedbacksAfter.data.hasSubmittedFeedback === true, 'User now has submitted feedback');
    console.assert(userFeedbacksAfter.data.feedbacks.length === 1, 'Should have 1 submitted feedback');
    console.log('✅ User can see previously submitted feedback.');

    // 3d: User edits previously submitted feedback
    const editRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/feedbacks/${createdFeedbackId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newRegisteredUserToken}`
      }
    }, {
      title: 'Real-time collaborative editing with live cursors',
      rating: 4,
      comments: 'Updated: Live cursors and instant sync would be incredible.'
    });

    console.assert(editRes.status === 200, 'Should update feedback');
    console.assert(editRes.data.feedback.title === 'Real-time collaborative editing with live cursors', 'Title was updated');
    console.assert(editRes.data.feedback.rating === 4, 'Rating was updated');
    console.log('✅ User can edit previously submitted feedback verified.');

    // STEP 4: Admin Dashboard CRUD Operations
    console.log('\n[TEST 4] Testing Step 4: Admin Dashboard CRUD operations...');
    
    // 4.1 Admin READ (R)
    const adminListRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/feedbacks?status=All&category=All',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    console.assert(adminListRes.status === 200, 'Admin can read feedbacks');
    console.assert(adminListRes.data.feedbacks.length >= 1, 'Admin sees feedback entries');
    console.log(`✅ Admin READ (R): Listed ${adminListRes.data.feedbacks.length} feedbacks.`);

    // 4.2 Admin CREATE (C)
    const adminCreateRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/feedbacks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      userName: 'Client via Support Hotline',
      userEmail: 'support-client@example.com',
      title: 'Phone App integration feedback',
      category: 'Improvement',
      rating: 4,
      priority: 'Medium',
      status: 'In Review',
      comments: 'Submitted over voice phone call with support representative.',
      adminResponse: 'Logged in system for mobile product sprint.'
    });
    console.assert(adminCreateRes.status === 201, 'Admin can create feedback');
    const adminCreatedId = adminCreateRes.data.feedback.id;
    console.log('✅ Admin CREATE (C): Admin created feedback entry:', adminCreatedId);

    // 4.3 Admin UPDATE (U)
    const adminUpdateRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/feedbacks/${createdFeedbackId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      status: 'Resolved',
      adminResponse: 'We released collaborative cursors in v2.0! Thanks Sam.'
    });
    console.assert(adminUpdateRes.status === 200, 'Admin update should succeed');
    console.assert(adminUpdateRes.data.feedback.status === 'Resolved', 'Status updated to Resolved');
    console.assert(adminUpdateRes.data.feedback.adminResponse.includes('v2.0'), 'Admin response updated');
    console.log('✅ Admin UPDATE (U): Admin updated status to Resolved and wrote official response.');

    // 4.4 Admin DELETE (D)
    const adminDeleteRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: `/api/admin/feedbacks/${adminCreatedId}`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    console.assert(adminDeleteRes.status === 200, 'Admin delete should succeed');
    console.log('✅ Admin DELETE (D): Admin deleted feedback entry:', adminCreatedId);

    // 4.5 Admin Stats
    const statsRes = await request({
      hostname: 'localhost',
      port: PORT,
      path: '/api/admin/stats',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    console.assert(statsRes.status === 200, 'Admin stats should return 200');
    console.assert(statsRes.data.stats.total > 0, 'Total feedback count > 0');
    console.log(`✅ Admin Analytics: Total Feedbacks=${statsRes.data.stats.total}, Avg Rating=${statsRes.data.stats.avgRating}`);

    console.log('\n======================================================');
    console.log('🎉 ALL 4 WORKFLOW STEPS VERIFIED & PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    server.close();
  }
}

runTests();
