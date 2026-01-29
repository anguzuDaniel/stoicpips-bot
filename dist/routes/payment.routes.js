"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/payments/paymentController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Initialize payment (Protected)
router.post('/initialize', auth_middleware_1.authenticateToken, paymentController_1.initializePayment);
// Cancel subscription (Protected)
router.post('/cancel', auth_middleware_1.authenticateToken, paymentController_1.cancelSubscription);
// Webhook (Public, secured by hash)
router.post('/webhook', paymentController_1.handleWebhook);
exports.default = router;
