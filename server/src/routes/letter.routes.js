const express = require('express');
const router = express.Router();
const letterController = require('../controllers/letter.controller');
const { protect, restrictTo } = require('../middleware/auth');

// Protected routes - require authentication
router.use(protect);

// Get letter statistics
router.get('/stats', letterController.getLetterStats);

// Get recent letters
router.get('/recent', letterController.getRecentLetters);

// Create a new letter (SSM only)
router.post('/', restrictTo('ssm'), letterController.createLetter);

// Mark letter to users (GM only)
router.post('/:letterId/mark-to', restrictTo('gm'), letterController.markLetterToUsers);

// Get all letters for the logged-in user
router.get('/', letterController.getLetters);

// Mark a letter as read
router.patch('/:letterId/read', letterController.markAsRead);

// Get unread letter count
router.get('/unread/count', letterController.getUnreadCount);

// Close a letter (GM only)
router.patch('/:letterId/close', restrictTo('gm'), letterController.closeLetter);

// Add a remark to a letter (GM only)
router.post('/:letterId/remark', restrictTo('gm'), letterController.addRemark);

module.exports = router; 