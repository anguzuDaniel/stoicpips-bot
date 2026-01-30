import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Admin controllers
import * as usersController from '../controllers/admin/users';
import * as infrastructureController from '../controllers/admin/infrastructure';
import * as botControlController from '../controllers/admin/botControl';
import * as analyticsController from '../controllers/admin/analytics';
import * as announcementsController from '../controllers/admin/announcements';

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

// Announcements (Admin: Create, Auth: Get)
router.post('/announcements', announcementsController.createAnnouncement);
router.get('/announcements', announcementsController.getAnnouncements);

export default router;
