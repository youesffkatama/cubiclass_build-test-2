// server/routes/api/v1/intelligence.js
const express = require('express');
const router = express.Router();
const intelligenceController = require('../../controllers/intelligenceController');
const { validate, schemas } = require('../../middleware/validation');

// Stream chat
router.post('/chat/stream', validate(schemas.chat), intelligenceController.streamChat);

// Get conversations
router.get('/chat/conversations', intelligenceController.getConversations);

// Generate flashcards
router.post('/flashcards', validate(schemas.generateFlashcards), intelligenceController.generateFlashcards);

// Generate quiz
router.post('/quiz', validate(schemas.generateFlashcards), intelligenceController.generateQuiz);

module.exports = router;