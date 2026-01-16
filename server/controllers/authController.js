// server/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');

const generateToken = (userId) => {
  const payload = { id: userId };
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

const register = async (req, res) => {
  try {
    const { username, email, password, profile, educationLevel } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Username, email, and password are required' }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { message: 'User with this email or username already exists' }
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      username,
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      profile: {
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=00ed64&color=fff`
      },
      dna: {
        learningStyle: 'Textual',
        weaknesses: [],
        strengths: [],
        xp: 0,
        level: 1,
        rank: 'Novice',
        badges: [],
        streakDays: 0,
        lastActiveDate: new Date()
      }
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);
    user.token = token;
    user.tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.profile.avatar,
          dna: user.dna,
          settings: user.settings,
          profile: user.profile
        },
        tokens: { accessToken: token }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and password are required' }
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' }
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' }
      });
    }

    // Generate token
    const token = generateToken(user._id);
    user.token = token;
    user.tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.profile.avatar,
          dna: user.dna,
          settings: user.settings,
          profile: user.profile
        },
        tokens: { accessToken: token }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash -token -tokenExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.profile.avatar,
          dna: user.dna,
          settings: user.settings,
          profile: user.profile
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { profile } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    if (profile) {
      user.profile.firstName = profile.firstName || user.profile.firstName;
      user.profile.lastName = profile.lastName || user.profile.lastName;
      user.profile.bio = profile.bio || user.profile.bio;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.profile.avatar,
          dna: user.dna,
          settings: user.settings,
          profile: user.profile
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    // Check current password
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValidCurrentPassword) {
      return res.status(400).json({
        success: false,
        error: { message: 'Current password is incorrect' }
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    user.passwordHash = hashedNewPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};