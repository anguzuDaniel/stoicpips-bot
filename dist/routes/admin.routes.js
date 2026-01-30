"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// TEMP: Fix Schema Cache
router.get('/fix-schema', async (req, res) => {
    try {
        const { Client } = require('pg');
        const client = new Client({
            connectionString: `postgres://postgres:${process.env.SUPABASE_DATABASE_PASSWORD}@db.qjdacnftlkdnzjkshjrq.supabase.co:5432/postgres`,
            ssl: { rejectUnauthorized: false }
        });
        await client.connect();
        await client.query("NOTIFY pgrst, 'reload schema';");
        await client.end();
        res.json({ message: "Schema reload triggered successfully!" });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// Admin controllers
const usersController = __importStar(require("../controllers/admin/users"));
const infrastructureController = __importStar(require("../controllers/admin/infrastructure"));
const botControlController = __importStar(require("../controllers/admin/botControl"));
const analyticsController = __importStar(require("../controllers/admin/analytics"));
const announcementsController = __importStar(require("../controllers/admin/announcements"));
// All admin routes require authentication AND admin role
router.use(auth_middleware_1.authenticateToken);
router.use(auth_middleware_1.requireAdmin);
// User Management
router.get('/users', usersController.listUsers);
router.patch('/users/:id/tier', usersController.updateUserTier);
router.patch('/users/:id/status', usersController.toggleUserStatus);
// Infrastructure Health
router.get('/infrastructure/health', infrastructureController.getInfrastructureHealth);
// Global Bot Control
router.post('/bot/pause', botControlController.triggerGreatPause);
router.post('/bot/resume', botControlController.resumeTrading);
router.get('/bot/status', botControlController.getGlobalBotStatus);
// Analytics
router.get('/analytics/global', analyticsController.getGlobalAnalytics);
// Bug Reports
const bugReportsController = __importStar(require("../controllers/admin/bugReports"));
router.get('/bug-reports', bugReportsController.getBugReports);
router.patch('/bug-reports/:id/status', bugReportsController.updateBugReportStatus);
// Feature Requests
const featureRequestsController = __importStar(require("../controllers/admin/featureRequests"));
router.get('/feature-requests', featureRequestsController.getFeatureRequests);
router.patch('/feature-requests/:id/status', featureRequestsController.updateFeatureRequestStatus);
// Announcements (Admin: Create, History, Delete | Auth: Get Active)
router.post('/announcements', announcementsController.createAnnouncement);
router.get('/announcements', announcementsController.getAnnouncements); // Public/Users (Active Only)
router.get('/announcements/all', announcementsController.getAllAnnouncements); // Admin (History)
router.delete('/announcements/:id', announcementsController.deleteAnnouncement);
exports.default = router;
