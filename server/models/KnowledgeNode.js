// server/models/KnowledgeNode.js
const mongoose = require('mongoose');

const knowledgeNodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['PDF', 'WebUrl', 'Note'],
    required: true
  },
  meta: {
    originalName: {
      type: String,
      required: true
    },
    filePath: String,
    mimeType: String,
    size: Number,
    pageCount: Number,
    wordCount: Number,
    language: String,
    progress: {
      type: Number,
      default: 0
    },
    statusMessage: String
  },
  persona: {
    generatedName: String,
    tone: String,
    personalityPrompt: String,
    avatarUrl: String,
    catchphrase: String
  },
  status: {
    type: String,
    enum: ['QUEUED', 'PROCESSING', 'INDEXED', 'FAILED'],
    default: 'QUEUED',
    index: true
  },
  processingError: String,
  summary: String,
  keyPoints: [String],
  tags: [String]
}, {
  timestamps: true
});

// Index for efficient queries
knowledgeNodeSchema.index({ userId: 1, createdAt: -1 });
knowledgeNodeSchema.index({ status: 1 });

module.exports = mongoose.model('KnowledgeNode', knowledgeNodeSchema);