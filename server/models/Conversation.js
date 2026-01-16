// server/models/Conversation.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
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
  citations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VectorChunk'
  }]
});

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  nodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeNode',
    default: null
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  messages: [messageSchema],
  model: {
    type: String,
    default: 'mistralai/mistral-7b-instruct:free'
  }
}, {
  timestamps: true
});

// Index for efficient queries
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ nodeId: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);