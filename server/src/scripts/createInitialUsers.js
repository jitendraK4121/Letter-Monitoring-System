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
    await User.create({
      username: 'ssm',
      password: 'ssm123',
      role: 'ssm',
      name: 'SSM Admin',
      email: 'ssm@example.com'  // Optional
    });
    console.log('SSM user created');

    // Create GM user
    await User.create({
      username: 'gm',
      password: 'gm123',
      role: 'gm',
      name: 'GM Admin',
      email: 'gm@example.com'  // Optional
    });
    console.log('GM user created');

    // Create regular user (only if it doesn't exist)
    const userExists = await User.findOne({ username: 'user1' });
    if (!userExists) {
      await User.create({
        username: 'user1',
        password: 'user123',
        role: 'user',
        name: 'Regular User',
        email: 'user1@example.com'
      });
      console.log('Regular user created');
    }

    console.log('All initial users created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
};

createInitialUsers(); 