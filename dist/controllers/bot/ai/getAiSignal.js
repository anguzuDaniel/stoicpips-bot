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
exports.getAiSignal = void 0;
const axios_1 = __importDefault(require("axios"));
const supabase_1 = require("../../../config/supabase");
// URL of the Python AI Service (Cloud Run or Localhost)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const getAiSignal = async (req, res) => {
    try {
        const { symbol, timeframe } = req.body;
        const userId = req.user.id;
        if (!symbol) {
            return res.status(400).json({ error: 'Symbol is required' });
        }
        const { data: config } = await supabase_1.supabase
            .from('bot_configs')
            .select('ai_provider, openai_api_key')
            .eq('user_id', userId)
            .single();
        const provider = config?.ai_provider || 'local';
        if (provider === 'openai') {
            const apiKey = config?.openai_api_key;
            if (!apiKey) {
                return res.status(400).json({ error: 'OpenAI API Key is required but not set.' });
            }
            // Standardize OpenAIService if used in multiple places, for now dynamic import is safer if it's not converted yet
            // Wait, I should convert OpenAIService too.
            const { OpenAIService } = await Promise.resolve().then(() => __importStar(require('../../../services/ai/OpenAIService')));
            const aiService = new OpenAIService(apiKey);
            try {
                const prediction = await aiService.getPrediction({
                    symbol,
                    currentPrice: req.body.currentPrice || 0,
                    candles: req.body.candles || []
                });
                return res.json({
                    success: true,
                    data: prediction
                });
            }
            catch (err) {
                console.error("OpenAI Error:", err.message);
                return res.status(502).json({ error: `OpenAI Error: ${err.message}` });
            }
        }
        else {
            // Local Python AI
            try {
                const aiResponse = await axios_1.default.post(`${AI_SERVICE_URL}/predict`, {
                    symbol,
                    timeframe: timeframe || '1m',
                    strategy_mode: 'scalping'
                });
                const prediction = aiResponse.data;
                return res.json({
                    success: true,
                    data: prediction
                });
            }
            catch (apiError) {
                console.error(`AI Service Error: ${apiError.message}`);
                if (apiError.code === 'ECONNREFUSED') {
                    return res.status(503).json({ error: 'AI Engine is currently offline' });
                }
                return res.status(502).json({ error: 'Failed to get signal from AI Engine' });
            }
        }
    }
    catch (error) {
        console.error('getAiSignal Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAiSignal = getAiSignal;
