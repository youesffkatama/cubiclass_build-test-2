// server/controllers/classController.js
const Class = require('../models/Class');
const User = require('../models/User');
const Task = require('../models/Task');

const createClass = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const userId = req.userId;

    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Class name is required' }
      });
    }

    // Generate random 8-character uppercase invite code
    const inviteCode = generateInviteCode(8);

    // Create class
    const classObj = new Class({
      userId: userId, // Teacher who created the class
      name,
      description: description || '',
      color: color || 'blue',
      inviteCode: inviteCode,
      members: [{
        userId: userId,
        role: 'teacher',
        joinedAt: new Date()
      }]
    });

    await classObj.save();

    res.status(201).json({
      success: true,
      data: {
        _id: classObj._id,
        userId: classObj.userId,
        name: classObj.name,
        description: classObj.description,
        color: classObj.color,
        inviteCode: classObj.inviteCode,
        members: classObj.members,
        createdAt: classObj.createdAt
      }
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const getClasses = async (req, res) => {
  try {
    const userId = req.userId;

    // Get classes where user is a member
    const classes = await Class.find({
      'members.userId': userId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { classes }
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const classObj = await Class.findOne({
      _id: id,
      'members.userId': userId
    });

    if (!classObj) {
      return res.status(404).json({
        success: false,
        error: { message: 'Class not found or you are not a member' }
      });
    }

    res.status(200).json({
      success: true,
      data: { class: classObj }
    });
  } catch (error) {
    console.error('Get class by ID error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const joinClass = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.userId;

    // Find class by invite code
    const classObj = await Class.findOne({ inviteCode: inviteCode.toUpperCase() });

    if (!classObj) {
      return res.status(404).json({
        success: false,
        error: { message: 'Invalid invite code' }
      });
    }

    // Check if user is already a member
    const isMember = classObj.members.some(member => 
      member.userId.toString() === userId
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        error: { message: 'You are already a member of this class' }
      });
    }

    // Add user as student
    classObj.members.push({
      userId: userId,
      role: 'student',
      joinedAt: new Date()
    });

    await classObj.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined class',
      data: { class: classObj }
    });
  } catch (error) {
    console.error('Join class error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const createPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: { message: 'Post content is required' }
      });
    }

    const classObj = await Class.findOne({
      _id: id,
      'members.userId': userId
    });

    if (!classObj) {
      return res.status(404).json({
        success: false,
        error: { message: 'Class not found or you are not a member' }
      });
    }

    // Add post to class
    classObj.posts.push({
      authorId: userId,
      content: content
    });

    await classObj.save();

    // Get the newly added post with author info
    const newPost = classObj.posts[classObj.posts.length - 1];
    const author = await User.findById(userId).select('username profile.avatar');

    res.status(201).json({
      success: true,
      data: {
        post: {
          id: newPost._id,
          author: author.username,
          avatar: author.profile.avatar,
          content: newPost.content,
          timestamp: newPost.timestamp,
          likes: newPost.likes.length
        }
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const getMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const classObj = await Class.findOne({
      _id: id,
      'members.userId': userId
    }).populate('members.userId', 'username profile.avatar dna.level dna.rank');

    if (!classObj) {
      return res.status(404).json({
        success: false,
        error: { message: 'Class not found or you are not a member' }
      });
    }

    res.status(200).json({
      success: true,
      data: { members: classObj.members }
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

// Helper function to generate invite code
function generateInviteCode(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = {
  createClass,
  getClasses,
  getClassById,
  joinClass,
  createPost,
  getMembers
};