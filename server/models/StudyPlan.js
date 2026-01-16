// server/models/StudyPlan.js
const mongoose = require('mongoose');

const studyPlanTaskSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Read', 'Quiz', 'Practice', 'Review', 'Assignment'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  estimatedMinutes: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const studyPlanDaySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  tasks: [studyPlanTaskSchema]
});

const studyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  nodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeNode',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  examDate: {
    type: Date,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  schedule: [studyPlanDaySchema],
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
studyPlanSchema.index({ userId: 1, createdAt: -1 });
studyPlanSchema.index({ nodeId: 1 });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);