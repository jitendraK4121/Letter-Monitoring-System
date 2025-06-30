const Letter = require('../models/Letter');
const User = require('../models/User');

// Create a new letter and distribute to all users
exports.createLetter = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Creating letter for user ID:', userId);

    const {
      title,
      reference,
      content,
      isPublic = true,
      attachments = [],
      dakReceiptNo,
      rbLetterNo,
      rbLetterDate,
      date
    } = req.body;

    // Validate required fields
    if (!title || !reference || !content) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: title, reference, or content'
      });
    }

    // Get all users for distribution
    const users = await User.find();
    
    // Create recipients list including the creator
    const recipientsList = users.map(user => ({
      user: user._id,
      readStatus: false,
      receivedDate: new Date()
    }));

    // Create the letter
    const letter = new Letter({
      title,
      reference,
      content,
      createdBy: userId,
      isPublic,
      attachments,
      recipients: recipientsList,
      date: date || new Date(),
      dakReceiptNo,
      rbLetterNo,
      rbLetterDate
    });

    await letter.save();
    console.log('Created letter:', {
      id: letter._id,
      title: letter.title,
      createdBy: letter.createdBy,
      recipientsCount: letter.recipients.length
    });

    // Fetch the complete letter with populated fields
    const populatedLetter = await Letter.findById(letter._id)
      .populate('createdBy', 'username name role')
      .populate('recipients.user', 'username name role');

    res.status(201).json({
      status: 'success',
      data: {
        letter: populatedLetter
      }
    });
  } catch (error) {
    console.error('Error in createLetter:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get letters for a specific user
exports.getLetters = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Getting letters for user ID:', userId);

    // Find ALL letters where user is either creator or recipient
    const letters = await Letter.find({
      $or: [
        { createdBy: userId },
        { 'recipients.user': userId }
      ]
    })
    .populate({
      path: 'createdBy',
      select: 'username name role'
    })
    .populate({
      path: 'recipients.user',
      select: 'username name role'
    })
    .select({
      title: 1,
      reference: 1,
      content: 1,
      date: 1,
      status: 1,
      createdBy: 1,
      recipients: 1,
      attachments: 1,
      dakReceiptNo: 1,
      rbLetterNo: 1,
      rbLetterDate: 1
    })
    .sort({ date: -1 });

    console.log(`Found ${letters.length} letters`);
    
    // Log each letter's basic info
    letters.forEach(letter => {
      console.log(`Letter ${letter._id}:`, {
        title: letter.title,
        createdBy: letter.createdBy?._id,
        isCreator: letter.createdBy?._id.toString() === userId.toString(),
        isRecipient: letter.recipients.some(r => r.user._id.toString() === userId.toString())
      });
    });

    res.json({
      status: 'success',
      data: {
        letters
      }
    });
  } catch (error) {
    console.error('Error in getLetters:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mark a letter as read
exports.markAsRead = async (req, res) => {
  try {
    const { letterId } = req.params;
    const userId = req.user._id;

    console.log(`Marking letter ${letterId} as read for user ${userId}`);

    const letter = await Letter.findOneAndUpdate(
      { 
        _id: letterId,
        'recipients.user': userId
      },
      {
        $set: {
          'recipients.$.readStatus': true
        }
      },
      { new: true }
    );

    if (!letter) {
      console.log('Letter not found or user not in recipients');
      return res.status(404).json({
        status: 'error',
        message: 'Letter not found'
      });
    }

    console.log('Letter marked as read successfully');

    res.json({
      status: 'success',
      data: {
        letter
      }
    });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get unread letter count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const unreadCount = await Letter.countDocuments({
      'recipients': {
        $elemMatch: {
          user: userId,
          readStatus: false
        }
      }
    });

    console.log(`Unread count for user ${userId}:`, unreadCount);

    res.json({
      status: 'success',
      data: {
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Close a letter
exports.closeLetter = async (req, res) => {
  try {
    const { letterId } = req.params;
    const userId = req.user._id;

    console.log(`Closing letter ${letterId} by user ${userId}`);

    const letter = await Letter.findByIdAndUpdate(
      letterId,
      {
        $set: {
          status: 'closed',
          approvedBy: userId,
          approvalDate: new Date()
        }
      },
      { new: true }
    ).populate('createdBy', 'username name role');

    if (!letter) {
      console.log('Letter not found');
      return res.status(404).json({
        status: 'error',
        message: 'Letter not found'
      });
    }

    console.log('Letter closed successfully:', {
      id: letter._id,
      title: letter.title,
      status: letter.status
    });

    res.json({
      status: 'success',
      data: {
        letter
      }
    });
  } catch (error) {
    console.error('Error in closeLetter:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Add a remark to a letter
exports.addRemark = async (req, res) => {
  try {
    const { letterId } = req.params;
    const { remark } = req.body;
    const userId = req.user._id;

    if (!remark) {
      return res.status(400).json({
        status: 'error',
        message: 'Remark text is required'
      });
    }

    const letter = await Letter.findByIdAndUpdate(
      letterId,
      {
        $push: {
          remarks: {
            text: remark,
            createdBy: userId
          }
        }
      },
      { new: true }
    ).populate('remarks.createdBy', 'username name role');

    if (!letter) {
      return res.status(404).json({
        status: 'error',
        message: 'Letter not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        letter
      }
    });
  } catch (error) {
    console.error('Error adding remark:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 