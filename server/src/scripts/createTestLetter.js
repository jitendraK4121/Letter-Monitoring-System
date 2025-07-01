require('dotenv').config();
const mongoose = require('mongoose');
const Letter = require('../models/Letter');
const User = require('../models/User');

const createTestLetter = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find SSM user
    const ssmUser = await User.findOne({ role: 'ssm' });
    if (!ssmUser) {
      throw new Error('SSM user not found');
    }

    // Find GM user for recipients
    const gmUser = await User.findOne({ role: 'gm' });
    if (!gmUser) {
      throw new Error('GM user not found');
    }

    // Create a test letter
    const letter = await Letter.create({
      title: 'Test Letter',
      reference: 'TEST/2025/001',
      content: 'This is a test letter content.',
      createdBy: ssmUser._id,
      recipients: [{
        user: gmUser._id,
        readStatus: false,
        receivedDate: new Date()
      }],
      date: new Date(),
      dakReceiptNo: 'DAKT001',
      rbLetterNo: 'RB001',
      rbLetterDate: new Date()
    });

    console.log('Test letter created:', {
      id: letter._id,
      title: letter.title,
      createdBy: ssmUser.username,
      recipients: [gmUser.username]
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating test letter:', error);
    process.exit(1);
  }
};

createTestLetter(); 