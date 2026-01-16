// server/models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['login', 'upload', 'chat', 'task_complete', 'achievement', 'study_session'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  xpGained: {
    type: Number,
    default: 0
  },
  metadata: {
    nodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeNode'
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ type: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);