require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createInitialUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing users to avoid duplicates
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create SSM user
    const ssm = new User({
      username: 'ssm',
      password: 'ssm123',
      role: 'ssm',
      name: 'SSM Admin',
      email: 'ssm@example.com'
    });
    await ssm.save();
    console.log('SSM user created');

    // Create GM user
    const gm = new User({
      username: 'gm',
      password: 'gm123',
      role: 'gm',
      name: 'GM Admin',
      email: 'gm@example.com'
    });
    await gm.save();
    console.log('GM user created');

    // Create regular user
    const user = new User({
      username: 'user1',
      password: 'user123',
      role: 'user',
      name: 'Regular User',
      email: 'user1@example.com'
    });
    await user.save();
    console.log('Regular user created');

    console.log('All initial users created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
};

createInitialUsers(); 