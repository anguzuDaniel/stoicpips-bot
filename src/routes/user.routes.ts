import { Router } from "express";
import { getUserProfile, updatePlan, updateBankInfo, updateProfile } from "../controllers/user/user.controller";
import { reportBug } from "../controllers/user/bugReport";
import { authenticateToken } from "../middleware/auth.middleware";
import * as notificationController from '../controllers/notifications';

const router = Router();

router.get("/profile", authenticateToken, getUserProfile);
router.post("/update-plan", authenticateToken, updatePlan);
router.post("/update-bank-info", authenticateToken, updateBankInfo);
router.post("/update-profile", authenticateToken, updateProfile);
router.post("/report-bug", authenticateToken, reportBug);

// Notifications
// Notifications
router.get('/notifications', authenticateToken, notificationController.getNotifications);
router.patch('/notifications/:id/read', authenticateToken, notificationController.markAsRead);
router.patch('/notifications/read-all', authenticateToken, notificationController.markAllAsRead);

export default router;
