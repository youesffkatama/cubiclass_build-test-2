// server/routes/api/v1/analytics.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/analyticsController');

// Get dashboard
router.get('/dashboard', analyticsController.getDashboard);

// Get performance
router.get('/performance', analyticsController.getPerformance);

// Get subject distribution
router.get('/subjects', analyticsController.getSubjectDistribution);

module.exports = router;