import { Request, Response } from 'express';
import axios from 'axios';

// URL of the Python AI Service (Cloud Run or Localhost)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const getAiSignal = async (req: Request, res: Response) => {
    try {
        const { symbol, timeframe } = req.body;
        const userId = (req as any).user.userId;

        // 1. Basic Validation
        if (!symbol) {
            return res.status(400).json({ error: 'Symbol is required' });
        }

        // 2. Call Python AI Engine
        // Note: In production, you might want to wrap this with a timeout/circuit breaker
        try {
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, {
                symbol,
                timeframe: timeframe || '1m',
                strategy_mode: 'scalping'
            });

            const prediction = aiResponse.data;

            // 3. Return Signal to User
            return res.json({
                success: true,
                data: prediction
            });

        } catch (apiError: any) {
            console.error(`AI Service Error: ${apiError.message}`);
            if (apiError.code === 'ECONNREFUSED') {
                return res.status(503).json({ error: 'AI Engine is currently offline' });
            }
            return res.status(502).json({ error: 'Failed to get signal from AI Engine' });
        }

    } catch (error: any) {
        console.error('getAiSignal Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
