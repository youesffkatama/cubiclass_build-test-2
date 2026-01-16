// server/models/VectorChunk.js
const mongoose = require('mongoose');

const vectorChunkSchema = new mongoose.Schema({
  nodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KnowledgeNode',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  embedding: [{
    type: Number,
    required: true
  }], // 384-dimensional vector
  location: {
    pageNumber: Number,
    chunkIndex: Number,
    bbox: [Number] // [x1, y1, x2, y2]
  },
  metadata: {
    wordCount: Number,
    language: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
vectorChunkSchema.index({ nodeId: 1 });
vectorChunkSchema.index({ embedding: 'vector', 'embedding.numDimensions': 384, 'embedding.similarity': 'cosine' });

module.exports = mongoose.model('VectorChunk', vectorChunkSchema);