import { Request, Response } from 'express';
import axios from 'axios';
import { supabase } from '../../../config/supabase';

// URL of the Python AI Service (Cloud Run or Localhost)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const getAiSignal = async (req: Request, res: Response) => {
    try {
        const { symbol, timeframe } = req.body;
        const userId = (req as any).user.id;

        if (!symbol) {
            return res.status(400).json({ error: 'Symbol is required' });
        }

        const { data: config } = await supabase
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
            const { OpenAIService } = await import('../../../services/ai/OpenAIService');
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

            } catch (err: any) {
                console.error("OpenAI Error:", err.message);
                return res.status(502).json({ error: `OpenAI Error: ${err.message}` });
            }

        } else {
            // Local Python AI
            try {
                const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, {
                    symbol,
                    timeframe: timeframe || '1m',
                    strategy_mode: 'scalping'
                });

                const prediction = aiResponse.data;

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
        }

    } catch (error: any) {
        console.error('getAiSignal Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
