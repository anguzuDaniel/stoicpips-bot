import { Router } from 'express';
import { initializePayment, handleWebhook, cancelSubscription } from '../controllers/payments/paymentController';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Initialize payment (Protected)
router.post('/initialize', authenticateToken, initializePayment);

// Cancel subscription (Protected)
router.post('/cancel', authenticateToken, cancelSubscription);

// Webhook (Public, secured by hash)
router.post('/webhook', handleWebhook);

export default router;
