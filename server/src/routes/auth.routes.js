const express = require('express');
const router = express.Router();
const { register, login, changePassword, changeUserPassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', protect, changePassword);
router.post('/change-user-password', protect, changeUserPassword);

module.exports = router; 