const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/login', authController.login);
router.post('/init-users', authController.initializeUsers);

// Protected routes
router.post('/change-password', protect, authController.changePassword);
router.post('/change-user-password', protect, authController.changeUserPassword);
router.get('/users', protect, authController.getAllUsers);
router.post('/users', protect, authController.createUser);

module.exports = router; 