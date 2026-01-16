// server/models/Class.js
const mongoose = require('mongoose');

const classMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['teacher', 'student'],
    default: 'student'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const classPostSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
});

const classSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    enum: ['green', 'blue', 'purple', 'orange'],
    default: 'blue'
  },
  inviteCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 8
  },
  members: [classMemberSchema],
  posts: [classPostSchema]
}, {
  timestamps: true
});

// Index for efficient queries
classSchema.index({ userId: 1, createdAt: -1 });
classSchema.index({ inviteCode: 1 });

module.exports = mongoose.model('Class', classSchema);