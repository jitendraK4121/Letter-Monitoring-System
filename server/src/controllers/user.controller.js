const User = require('../models/User');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    console.log('Getting users with role:', req.user.role);
    
    // Check if user has permission
    if (req.user.role !== 'ssm' && req.user.role !== 'gm') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }

    const users = await User.find().select('-password');
    console.log(`Found ${users.length} users`);
    
    res.status(200).json({
      status: 'success',
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    console.log('Creating user with role:', req.user.role);
    
    // Check if user has permission
    if (req.user.role !== 'ssm' && req.user.role !== 'gm') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }

    const { username, password, name, role, email } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Username already exists'
      });
    }

    // Create new user
    const user = new User({
      username,
      password,
      name,
      role,
      email,
      active: true
    });

    await user.save();
    console.log('Created new user:', username);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      status: 'success',
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    // Check if user has permission
    if (req.user.role !== 'ssm' && req.user.role !== 'gm') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Don't allow deleting the last SSM user
    if (user.role === 'ssm') {
      const ssmCount = await User.countDocuments({ role: 'ssm' });
      if (ssmCount <= 1) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot delete the last SSM user'
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    console.log('Deleted user:', user.username);

    res.status(200).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { password, role, ...updateData } = req.body;

    // Don't allow updating password or role through this route
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
}; 