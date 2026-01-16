// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Access token required' }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    const userId = decoded.id;

    // Check if user exists and token is still valid
    const user = await User.findById(userId).select('_id token tokenExpiry');

    if (!user || !user.token || user.token !== token || user.tokenExpiry < new Date()) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired token' }
      });
    }

    // Attach user ID to request
    req.userId = userId;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid token' }
      });
    }
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

module.exports = {
  authenticateToken
};