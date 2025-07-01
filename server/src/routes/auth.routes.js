const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

// Public routes
router.post('/login', authController.login);
router.post('/init-users', authController.initializeUsers);

// Protected routes
router.post('/change-password', auth, authController.changePassword);
router.post('/change-user-password', auth, authController.changeUserPassword);
router.get('/users', auth, authController.getAllUsers);
router.post('/users', auth, authController.createUser);

module.exports = router; 