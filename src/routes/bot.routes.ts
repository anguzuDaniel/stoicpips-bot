const { Router } = require('express');
const { authenticateToken, requirePaidUser } = require('../middleware/auth.middleware');
import { saveBotConfig } from "../controllers/bot/config/saveBotConfig";
import { getBotConfig } from "../controllers/bot/config/getBotConfig";
import { startBot } from "../controllers/bot/startBot";
import { stopBot } from "../controllers/bot/stopBot";
import { getBotStatus } from "../controllers/bot/config/getBotStatus";
import { forceTrade } from "../controllers/bot/trade/forceTrade";
import { getTradeHistory } from "../controllers/bot/trade/getTradeHistory";
import { getAnalytics } from "../controllers/bot/trade/getAnalytics";
import { getLogs } from "../controllers/bot/logs/getLogs";
import { resetBot } from "../controllers/bot/config/resetBot";
import { getAiSignal } from "../controllers/bot/ai/getAiSignal";

const router = Router();

router.post("/config", authenticateToken, saveBotConfig);
router.get("/config", authenticateToken, getBotConfig);
router.post("/start", authenticateToken, startBot);
router.post("/stop", authenticateToken, stopBot);
router.get("/status", authenticateToken, getBotStatus);
router.post("/force-trade", authenticateToken, forceTrade);
router.get("/history", authenticateToken, getTradeHistory);
router.get("/analytics", authenticateToken, getAnalytics);
router.get("/logs", authenticateToken, getLogs);
router.post("/reset", authenticateToken, resetBot);

// AI Endpoint (Pro Users Only)
router.post("/ai-signal", authenticateToken, requirePaidUser, getAiSignal);

module.exports = router;