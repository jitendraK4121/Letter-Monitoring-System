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

    // Get only GM and SSM users for initial distribution
    const adminUsers = await User.find({ role: { $in: ['gm', 'ssm'] } });
    
    // Create recipients list with only GM and SSM
    const recipientsList = adminUsers.map(user => ({
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
    const userRole = req.user.role;
    console.log('Getting letters for user:', {
      userId,
      userRole,
      username: req.user.username
    });

    let query = {};

    // If user is GM or SSM, they can see all letters
    if (userRole === 'gm' || userRole === 'ssm') {
      console.log('User is GM/SSM - showing all letters');
    } else {
      // Regular users can only see letters where they are marked as recipients
      query = {
        'recipients.user': userId
      };
      console.log('User is regular user - filtering by recipients');
    }

    console.log('Query:', JSON.stringify(query));

    // Find letters based on the query
    const letters = await Letter.find(query)
      .populate('createdBy', 'username name role')
      .populate('recipients.user', 'username name role')
    .sort({ date: -1 });

    console.log(`Found ${letters.length} letters`);
    
    if (letters.length > 0) {
      console.log('Sample letter:', {
        id: letters[0]._id,
        title: letters[0].title,
        reference: letters[0].reference,
        createdBy: letters[0].createdBy?.username,
        recipientsCount: letters[0].recipients?.length || 0
      });
    } else {
      console.log('No letters found');
    }

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
      message: 'Failed to fetch letters',
      details: error.message
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

// Get letter statistics
exports.getLetterStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    console.log('Getting stats for user:', {
      userId: req.user._id,
      role: userRole,
      username: req.user.username
    });

    // First, get total count of all letters in the database
    const totalLettersInDB = await Letter.countDocuments({});
    console.log('Total letters in database:', totalLettersInDB);

    let query = {};

    // If user is GM or SSM, they can see all letters
    if (userRole === 'gm' || userRole === 'ssm') {
      console.log('User is GM/SSM - showing all letters');
    } else {
      // Regular users can only see letters where they are recipients
      query = {
        'recipients.user': req.user._id
      };
      console.log('User is regular user - filtering by recipients');
    }

    console.log('Query:', JSON.stringify(query));

    // Get all letters based on role with full population
    const letters = await Letter.find(query)
      .populate('createdBy', 'username name role')
      .populate('approvedBy', 'username name role')
      .sort({ date: -1 });

    console.log(`Found ${letters.length} letters out of ${totalLettersInDB} total letters`);

    // Log the actual letters for debugging
    console.log('All letters:', letters.map(letter => ({
      id: letter._id,
      title: letter.title,
      reference: letter.reference,
      status: letter.status,
      createdBy: letter.createdBy?.username,
      date: letter.date,
      recipients: letter.recipients?.length || 0
    })));

    // Calculate statistics
    const totalLetters = letters.length;
    
    // Count letters by status
    const lettersByStatus = letters.reduce((acc, letter) => {
      const status = letter.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    console.log('Letters by status:', lettersByStatus);

    const closedLetters = (lettersByStatus.closed || 0) + (lettersByStatus.approved || 0);
    const pendingLetters = (lettersByStatus.pending || 0) + (lettersByStatus[''] || 0);

    // Calculate average response time (in days) for closed/approved letters
    let totalResponseTime = 0;
    let closedLettersWithDates = 0;

    letters.forEach(letter => {
      if ((letter.status === 'closed' || letter.status === 'approved') && 
          letter.date && letter.approvalDate) {
        const responseTime = Math.floor(
          (new Date(letter.approvalDate) - new Date(letter.date)) / (1000 * 60 * 60 * 24)
        );
        if (responseTime >= 0) { // Only count valid response times
          totalResponseTime += responseTime;
          closedLettersWithDates++;
          console.log(`Letter ${letter._id} response time:`, {
            created: letter.date,
            approved: letter.approvalDate,
            days: responseTime
          });
        }
      }
    });

    const averageResponseTime = closedLettersWithDates > 0 
      ? Math.round(totalResponseTime / closedLettersWithDates) 
      : 0;

    const stats = {
      totalLetters,
      pendingLetters,
      closedLetters,
      averageResponseTime,
      lettersByStatus, // Include this for debugging
      totalLettersInDB // Include total letters in DB for verification
    };

    console.log('Calculated stats:', stats);

    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Error in getLetterStats:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get recent letters
exports.getRecentLetters = async (req, res) => {
  try {
    const userId = req.user._id;

    const letters = await Letter.find({
      $or: [
        { createdBy: userId },
        { 'recipients.user': userId }
      ]
    })
    .populate('createdBy', 'username name role')
    .sort({ date: -1 })
    .limit(10);

    res.json({
      status: 'success',
      letters
    });
  } catch (error) {
    console.error('Error in getRecentLetters:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mark letter to users
exports.markLetterToUsers = async (req, res) => {
  try {
    const { letterId } = req.params;
    const { userIds } = req.body;

    console.log('Marking letter to users:', {
      letterId,
      userIds,
      gmId: req.user._id
    });

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      console.log('Invalid userIds provided:', userIds);
      return res.status(400).json({
        status: 'error',
        message: 'Please provide at least one user ID'
      });
    }

    // Validate that all userIds exist and are regular users
    const users = await User.find({
      _id: { $in: userIds },
      role: 'user'
    });

    if (users.length !== userIds.length) {
      console.log('Some user IDs are invalid:', {
        requestedIds: userIds,
        foundUsers: users.map(u => u._id)
      });
      return res.status(400).json({
        status: 'error',
        message: 'One or more user IDs are invalid or not regular users'
      });
    }

    // Find the letter
    const letter = await Letter.findById(letterId);
    if (!letter) {
      console.log('Letter not found:', letterId);
      return res.status(404).json({
        status: 'error',
        message: 'Letter not found'
      });
    }

    console.log('Current letter recipients:', letter.recipients);

    // Get existing recipient user IDs
    const existingRecipientIds = letter.recipients.map(r => r.user.toString());
    console.log('Existing recipient IDs:', existingRecipientIds);

    // Filter out users that are already recipients
    const newUserIds = userIds.filter(id => !existingRecipientIds.includes(id));
    console.log('New user IDs to add:', newUserIds);

    // Create new recipients list for new users
    const newRecipients = newUserIds.map(userId => ({
      user: userId,
      readStatus: false,
      receivedDate: new Date()
    }));

    // Add new recipients to the existing ones
    letter.recipients.push(...newRecipients);
    await letter.save();
    console.log('Updated letter recipients:', letter.recipients);

    // Fetch the updated letter with populated fields
    const updatedLetter = await Letter.findById(letterId)
      .populate('recipients.user', 'username name role')
      .populate('createdBy', 'username name role');

    console.log('Sending response with updated letter:', {
      id: updatedLetter._id,
      recipientsCount: updatedLetter.recipients.length,
      recipients: updatedLetter.recipients.map(r => ({
        id: r.user._id,
        username: r.user.username
      }))
    });

    res.json({
      status: 'success',
      message: 'Letter marked to selected users successfully',
      data: {
        letter: updatedLetter
      }
    });
  } catch (error) {
    console.error('Error in markLetterToUsers:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 