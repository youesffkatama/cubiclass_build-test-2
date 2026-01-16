// server/models/Note.js
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  nodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeNode',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ nodeId: 1 });

module.exports = mongoose.model('Note', noteSchema);