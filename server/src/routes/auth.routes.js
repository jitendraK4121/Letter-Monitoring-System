const express = require('express');
const router = express.Router();
const { register, login, changePassword, changeUserPassword, initializeUsers } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', protect, changePassword);
router.post('/change-user-password', protect, changeUserPassword);
router.get('/users', protect, getAllUsers);
router.post('/users', protect, createUser);
router.post('/init-users', initializeUsers);

module.exports = router; 