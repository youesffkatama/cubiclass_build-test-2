// server/routes/api/v1/classes.js
const express = require('express');
const router = express.Router();
const classController = require('../../../controllers/classController');
const { validate, schemas } = require('../../../middleware/validation');

// Create class
router.post('/', validate(schemas.createClass), classController.createClass);

// Get classes
router.get('/', classController.getClasses);

// Get class by ID
router.get('/:id', classController.getClassById);

// Join class
router.post('/:id/join', validate(schemas.joinClass), classController.joinClass);

// Create post in class
router.post('/:id/posts', validate(schemas.createPost), classController.createPost);

// Get class members
router.get('/:id/members', classController.getMembers);

module.exports = router;