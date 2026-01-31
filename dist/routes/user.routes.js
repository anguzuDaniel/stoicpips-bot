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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user/user.controller");
const bugReport_1 = require("../controllers/user/bugReport");
const featureRequest_1 = require("../controllers/user/featureRequest");
const auth_middleware_1 = require("../middleware/auth.middleware");
const notificationController = __importStar(require("../controllers/notifications"));
const router = (0, express_1.Router)();
router.get("/profile", auth_middleware_1.authenticateToken, user_controller_1.getUserProfile);
router.post("/update-plan", auth_middleware_1.authenticateToken, user_controller_1.updatePlan);
router.post("/update-bank-info", auth_middleware_1.authenticateToken, user_controller_1.updateBankInfo);
router.post("/update-profile", auth_middleware_1.authenticateToken, user_controller_1.updateProfile);
router.post("/report-bug", auth_middleware_1.authenticateToken, bugReport_1.reportBug);
router.post("/request-feature", auth_middleware_1.authenticateToken, featureRequest_1.requestFeature);
router.post("/trial/start", auth_middleware_1.authenticateToken, user_controller_1.startTrial);
// Notifications
// Notifications
router.get('/notifications', auth_middleware_1.authenticateToken, notificationController.getNotifications);
router.patch('/notifications/:id/read', auth_middleware_1.authenticateToken, notificationController.markAsRead);
router.patch('/notifications/read-all', auth_middleware_1.authenticateToken, notificationController.markAllAsRead);
exports.default = router;
