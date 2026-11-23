const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../auth');

const router = express.Router();

// All feedback routes require authentication
router.use(authenticateToken);

// GET /api/feedbacks/my - Get current user's feedbacks
router.get('/my', async (req, res) => {
  try {
    const feedbacks = await db.getUserFeedbacks(req.user.id);
    return res.json({
      success: true,
      hasSubmittedFeedback: feedbacks.length > 0,
      total: feedbacks.length,
      feedbacks
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your feedbacks: ' + error.message
    });
  }
});

// GET /api/feedbacks/:id - Get specific feedback
router.get('/:id', async (req, res) => {
  try {
    const feedback = await db.getFeedbackById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.'
      });
    }

    // Allow owner or admin
    if (feedback.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this feedback.'
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

// POST /api/feedbacks - Submit new feedback
router.post('/', async (req, res) => {
  try {
    const { title, category, rating, comments, priority } = req.body;

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
        message: 'Please provide a valid star rating between 1 and 5.'
      });
    }

    const validCategories = ['Feature Request', 'Bug Report', 'General Feedback', 'Improvement'];
    const feedbackCategory = validCategories.includes(category) ? category : 'General Feedback';

    const newFeedback = await db.createFeedback({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      title: title.trim(),
      category: feedbackCategory,
      rating: ratingNum,
      comments: comments ? comments.trim() : '',
      priority: priority || 'Medium'
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully! Thank you.',
      feedback: newFeedback
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback: ' + error.message
    });
  }
});

// PUT /api/feedbacks/:id - Edit previously submitted feedback
router.put('/:id', async (req, res) => {
  try {
    const feedback = await db.getFeedbackById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.'
      });
    }

    // Check ownership
    const isOwner = feedback.userId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this feedback.'
      });
    }

    const { title, category, rating, comments, priority, status, adminResponse } = req.body;

    const updatePayload = {};

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ success: false, message: 'Title cannot be empty.' });
      }
      updatePayload.title = title.trim();
    }

    if (category !== undefined) {
      updatePayload.category = category;
    }

    if (rating !== undefined) {
      const r = parseInt(rating, 10);
      if (isNaN(r) || r < 1 || r > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
      }
      updatePayload.rating = r;
    }

    if (comments !== undefined) {
      updatePayload.comments = comments.trim();
    }

    if (priority !== undefined) {
      updatePayload.priority = priority;
    }

    // Only admin can update status and admin response
    if (isAdmin) {
      if (status !== undefined) {
        updatePayload.status = status;
      }
      if (adminResponse !== undefined) {
        updatePayload.adminResponse = adminResponse.trim();
      }
    }

    const updated = await db.updateFeedback(req.params.id, updatePayload);

    return res.json({
      success: true,
      message: 'Feedback updated successfully!',
      feedback: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update feedback: ' + error.message
    });
  }
});

// DELETE /api/feedbacks/:id - Delete feedback
router.delete('/:id', async (req, res) => {
  try {
    const feedback = await db.getFeedbackById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.'
      });
    }

    const isOwner = feedback.userId === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this feedback.'
      });
    }

    await db.deleteFeedback(req.params.id);

    return res.json({
      success: true,
      message: 'Feedback deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete feedback: ' + error.message
    });
  }
});

module.exports = router;
