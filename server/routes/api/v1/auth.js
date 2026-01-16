// server/routes/api/v1/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/authController');
const { validate, schemas } = require('../../../middleware/validation');

// Public routes
router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);

// Protected routes
router.get('/me', authController.getMe);
router.patch('/profile', authController.updateProfile);
router.post('/change-password', validate(schemas.changePassword), authController.changePassword);

module.exports = router;