// server/middleware/errorHandler.js
const winston = require('winston');

// Create logger
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors(),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'scholar-ai-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error(err.stack);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: { message: 'Validation error', details: err.message }
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid ID format' }
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: { message: 'Duplicate key error' }
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: { 
      message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
    }
  });
};

module.exports = errorHandler;