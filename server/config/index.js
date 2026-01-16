// server/config/index.js
require('dotenv').config();

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-min-32-chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: 'https://openrouter.ai/api/v1'
  },
  mongodb: {
    uri: process.env.MONGODB_URI
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:8080'
  },
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  }
};