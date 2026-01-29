const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Admin controllers
const usersController = require('../controllers/admin/users');
const infrastructureController = require('../controllers/admin/infrastructure');
const botControlController = require('../controllers/admin/botControl');
const analyticsController = require('../controllers/admin/analytics');

// All admin routes require authentication AND admin role
router.use(authenticateToken);
router.use(requireAdmin);

// User Management
router.get('/users', usersController.listUsers);
router.patch('/users/:id/tier', usersController.updateUserTier);

// Infrastructure Health
router.get('/infrastructure/health', infrastructureController.getInfrastructureHealth);

// Global Bot Control
router.post('/bot/pause', botControlController.triggerGreatPause);
router.post('/bot/resume', botControlController.resumeTrading);
router.get('/bot/status', botControlController.getGlobalBotStatus);

// Analytics
router.get('/analytics/global', analyticsController.getGlobalAnalytics);

module.exports = router;
