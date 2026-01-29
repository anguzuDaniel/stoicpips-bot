const { Router } = require('express');
const { initializePayment, handleWebhook } = require('../controllers/payments/paymentController');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = Router();

// Initialize payment (Protected)
router.post('/initialize', authenticateToken, initializePayment);

// Webhook (Public, secured by hash)
router.post('/webhook', handleWebhook);

module.exports = router;
