// server/routes/api/v1/tasks.js
const express = require('express');
const router = express.Router();
const taskController = require('../../controllers/taskController');
const { validate, schemas } = require('../../middleware/validation');

// Create task
router.post('/', validate(schemas.createTask), taskController.createTask);

// Get tasks
router.get('/', taskController.getTasks);

// Get task by ID
router.get('/:id', taskController.getTaskById);

// Update task
router.patch('/:id', validate(schemas.updateTask), taskController.updateTask);

// Delete task
router.delete('/:id', taskController.deleteTask);

module.exports = router;