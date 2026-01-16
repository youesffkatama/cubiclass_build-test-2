require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

// Import routes
const authRoutes = require('./routes/api/v1/auth');
const workspaceRoutes = require('./routes/api/v1/workspace');
const intelligenceRoutes = require('./routes/api/v1/intelligence');
const analyticsRoutes = require('./routes/api/v1/analytics');
const classRoutes = require('./routes/api/v1/classes');
const taskRoutes = require('./routes/api/v1/tasks');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:8080',
      'https://scholar.ai',
      process.env.FRONTEND_URL
    ];
    
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many auth attempts'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/', apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Data sanitization
app.use(mongoSanitize());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspace', authMiddleware.authenticateToken, workspaceRoutes);
app.use('/api/v1/intelligence', authMiddleware.authenticateToken, intelligenceRoutes);
app.use('/api/v1/analytics', authMiddleware.authenticateToken, analyticsRoutes);
app.use('/api/v1/classes', authMiddleware.authenticateToken, classRoutes);
app.use('/api/v1/tasks', authMiddleware.authenticateToken, taskRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

module.exports = app;