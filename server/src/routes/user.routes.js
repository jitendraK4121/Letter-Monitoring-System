const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

// Protected routes (require authentication)
router.use(protect);

// Routes for logged-in user's own profile
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);

// Route for getting all users (accessible by GM and SSM)
router.get('/', restrictTo('gm', 'ssm'), userController.getAllUsers);

// SSM only routes
router.use(restrictTo('ssm'));
router.post('/', userController.createUser);
router.delete('/:id', userController.deleteUser);

module.exports = router; 