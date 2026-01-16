// server/controllers/workspaceController.js
const KnowledgeNode = require('../models/KnowledgeNode');
const VectorChunk = require('../models/VectorChunk');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { Queue, Worker } = require('bullmq');
const redis = require('redis');
const config = require('../config');

// Initialize Redis client
const redisClient = redis.createClient({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password
});

redisClient.connect().catch(console.error);

// Initialize BullMQ queue
const pdfQueue = new Queue('pdf processing', {
  connection: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password
  }
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads', req.userId.toString());
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

const uploadFile = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded' }
      });
    }

    const userId = req.userId;
    const file = req.file;

    // Create knowledge node
    const knowledgeNode = new KnowledgeNode({
      userId: userId,
      type: 'PDF',
      meta: {
        originalName: file.originalname,
        filePath: file.path,
        mimeType: file.mimetype,
        size: file.size
      },
      status: 'QUEUED'
    });

    await knowledgeNode.save();

    // Add to processing queue
    await pdfQueue.add('process-pdf', {
      nodeId: knowledgeNode._id,
      filePath: file.path
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });

    res.status(201).json({
      success: true,
      data: {
        id: knowledgeNode._id,
        name: knowledgeNode.meta.originalName,
        status: knowledgeNode.status,
        progress: knowledgeNode.meta.progress || 0
      }
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const getFiles = async (req, res) => {
  try {
    const userId = req.userId;

    const files = await KnowledgeNode.find({ userId })
      .sort({ createdAt: -1 })
      .select('_id type meta status persona createdAt');

    res.status(200).json({
      success: true,
      data: { files }
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const file = await KnowledgeNode.findOne({ _id: id, userId });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: { message: 'File not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: { file }
    });
  } catch (error) {
    console.error('Get file by ID error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const getFileStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const file = await KnowledgeNode.findOne({ _id: id, userId }).select('_id status meta');

    if (!file) {
      return res.status(404).json({
        success: false,
        error: { message: 'File not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: file._id,
        status: file.status,
        progress: file.meta.progress || 0,
        statusMessage: file.meta.statusMessage || ''
      }
    });
  } catch (error) {
    console.error('Get file status error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const file = await KnowledgeNode.findOne({ _id: id, userId });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: { message: 'File not found' }
      });
    }

    // Delete associated vector chunks
    await VectorChunk.deleteMany({ nodeId: id });

    // Delete physical file if it exists
    if (file.meta.filePath && fs.existsSync(file.meta.filePath)) {
      fs.unlinkSync(file.meta.filePath);
    }

    // Delete the knowledge node
    await KnowledgeNode.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

module.exports = {
  uploadFile,
  getFiles,
  getFileById,
  getFileStatus,
  deleteFile,
  upload // Export multer instance for route
};