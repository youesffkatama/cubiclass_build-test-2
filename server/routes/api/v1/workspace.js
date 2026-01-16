// server/routes/api/v1/workspace.js
const express = require('express');
const router = express.Router();
const workspaceController = require('../../../controllers/workspaceController');
const { validate, schemas } = require('../../../middleware/validation');

// Upload file (with multer middleware)
router.post('/upload', workspaceController.upload.single('file'), workspaceController.uploadFile);

// Get files
router.get('/files', workspaceController.getFiles);

// Get file by ID
router.get('/files/:id', workspaceController.getFileById);

// Get file status
router.get('/files/:id/status', workspaceController.getFileStatus);

// Delete file
router.delete('/files/:id', workspaceController.deleteFile);

module.exports = router;