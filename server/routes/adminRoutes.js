const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../auth');

const router = express.Router();

// Enforce auth & admin privileges for all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/stats - Metrics overview
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getFeedbackStats();
    return res.json({
      success: true,
      stats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to compute statistics: ' + error.message
    });
  }
});

// GET /api/admin/feedbacks - CRUD: Read all with filters
router.get('/feedbacks', async (req, res) => {
  try {
    const { category, status, rating, search, sortBy } = req.query;
    const feedbacks = await db.getAllFeedbacks({ category, status, rating, search, sortBy });
    return res.json({
      success: true,
      total: feedbacks.length,
      feedbacks
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedbacks: ' + error.message
    });
  }
});

// GET /api/admin/feedbacks/:id - CRUD: Read single feedback
router.get('/feedbacks/:id', async (req, res) => {
  try {
    const feedback = await db.getFeedbackById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.'
      });
    }
    return res.json({
      success: true,
      feedback
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedback: ' + error.message
    });
  }
});

// POST /api/admin/feedbacks - CRUD: Create feedback as Admin
router.post('/feedbacks', async (req, res) => {
  try {
    const { title, category, rating, comments, priority, status, adminResponse, userName, userEmail } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Feedback title is required.'
      });
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5.'
      });
    }

    const newFeedback = await db.createFeedback({
      userId: req.user.id,
      userName: userName ? userName.trim() : req.user.name + ' (Admin)',
      userEmail: userEmail ? userEmail.trim() : req.user.email,
      title: title.trim(),
      category: category || 'General Feedback',
      rating: ratingNum,
      comments: comments ? comments.trim() : '',
      priority: priority || 'Medium'
    });

    // If status or response provided during admin creation, update it
    if (status || adminResponse) {
      const updated = await db.updateFeedback(newFeedback.id, {
        status: status || 'Pending',
        adminResponse: adminResponse ? adminResponse.trim() : ''
      });
      return res.status(201).json({
        success: true,
        message: 'Feedback created successfully by Admin.',
        feedback: updated
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Feedback created successfully by Admin.',
      feedback: newFeedback
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create feedback: ' + error.message
    });
  }
});

// PUT /api/admin/feedbacks/:id - CRUD: Update feedback as Admin
router.put('/feedbacks/:id', async (req, res) => {
  try {
    const existing = await db.getFeedbackById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.'
      });
    }

    const { title, category, rating, comments, priority, status, adminResponse } = req.body;
    const updatePayload = {};

    if (title !== undefined) updatePayload.title = title.trim();
    if (category !== undefined) updatePayload.category = category;
    if (rating !== undefined) {
      const r = parseInt(rating, 10);
      if (isNaN(r) || r < 1 || r > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
      }
      updatePayload.rating = r;
    }
    if (comments !== undefined) updatePayload.comments = comments.trim();
    if (priority !== undefined) updatePayload.priority = priority;
    if (status !== undefined) {
      const validStatuses = ['Pending', 'In Review', 'Resolved', 'Rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value.' });
      }
      updatePayload.status = status;
    }
    if (adminResponse !== undefined) {
      updatePayload.adminResponse = adminResponse.trim();
    }

    const updated = await db.updateFeedback(req.params.id, updatePayload);

    return res.json({
      success: true,
      message: 'Feedback updated successfully by Admin.',
      feedback: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update feedback: ' + error.message
    });
  }
});

// DELETE /api/admin/feedbacks/:id - CRUD: Delete feedback as Admin
router.delete('/feedbacks/:id', async (req, res) => {
  try {
    const existing = await db.getFeedbackById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.'
      });
    }

    await db.deleteFeedback(req.params.id);

    return res.json({
      success: true,
      message: `Feedback #${req.params.id} has been permanently deleted.`
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete feedback: ' + error.message
    });
  }
});

// GET /api/admin/users - List users
router.get('/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    return res.json({
      success: true,
      users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users: ' + error.message
    });
  }
});

module.exports = router;
