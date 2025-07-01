const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      role: user.role,
      username: user.username
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Change own password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    user.lastPasswordChange = Date.now();
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GM/SSM only - Change other user's password
const changeUserPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const adminId = req.user.id;

    // Check if requester is GM or SSM
    const admin = await User.findById(adminId);
    if (admin.role !== 'gm' && admin.role !== 'ssm') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find user and update password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // SSM can only change regular user passwords
    if (admin.role === 'ssm' && user.role !== 'user') {
      return res.status(403).json({ message: 'SSM can only change regular user passwords' });
    }

    user.password = newPassword;
    user.lastPasswordChange = Date.now();
    user.modifiedBy = adminId;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (GM only)
const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'gm') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new user (GM only)
const createUser = async (req, res) => {
  try {
    if (req.user.role !== 'gm') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { username, password, role } = req.body;
    
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const user = new User({
      username,
      password,
      role,
      modifiedBy: req.user.id
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Initialize default users
const initializeUsers = async (req, res) => {
  try {
    // Delete existing users
    await User.deleteMany({});

    // Create SSM user
    const ssm = new User({
      username: 'ssm',
      password: 'ssm123',
      role: 'ssm',
      name: 'SSM Admin',
      email: 'ssm@example.com'
    });
    await ssm.save();

    // Create GM user
    const gm = new User({
      username: 'gm',
      password: 'gm123',
      role: 'gm',
      name: 'GM Admin',
      email: 'gm@example.com'
    });
    await gm.save();

    // Create regular user
    const user = new User({
      username: 'user1',
      password: 'user123',
      role: 'user',
      name: 'Regular User',
      email: 'user1@example.com'
    });
    await user.save();

    res.json({ message: 'Default users initialized successfully' });
  } catch (error) {
    console.error('Error initializing users:', error);
    res.status(500).json({ message: 'Error initializing users' });
  }
};

module.exports = {
  register,
  login,
  changePassword,
  changeUserPassword,
  getAllUsers,
  createUser,
  initializeUsers
}; 