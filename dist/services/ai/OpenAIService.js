"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIService = void 0;
const axios_1 = __importDefault(require("axios"));
class OpenAIService {
    constructor(apiKey) {
        this.model = 'gpt-3.5-turbo'; // Or gpt-4o if available/affordable
        this.apiKey = apiKey;
    }
    async getPrediction(data) {
        if (!this.apiKey) {
            throw new Error("OpenAI API Key is missing");
        }
        const prompt = this.buildPrompt(data);
        try {
            const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content: `You are an expert financial trading AI specialized in synthetic indices. 
                            Analyze the market data provided and output a JSON response with a trading signal.
                            The JSON format must be strictly:
                            {
                                "action": "BUY" | "SELL" | "HOLD",
                                "confidence": number (0-1),
                                "reasoning": "brief explanation"
                            }`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.2, // Low temperature for more deterministic/analytical results
                response_format: { type: "json_object" }
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const content = response.data.choices[0].message.content;
            return JSON.parse(content);
        }
        catch (error) {
            console.error("OpenAI API Error:", error.response?.data || error.message);
            throw new Error(`OpenAI Analysis Failed: ${error.response?.data?.error?.message || error.message}`);
        }
    }
    buildPrompt(data) {
        // Construct a concise summary of market state
        // In a real scenario, you'd pass technical indicators (RSI, MA, etc.)
        // For now, we'll assume the 'candles' or 'indicators' have raw data
        const lastPrice = data.currentPrice;
        const recentHistory = data.candles ? data.candles.slice(-5).map((c) => c.close).join(', ') : "Not available";
        return `
            Market: ${data.symbol}
            Current Price: ${lastPrice}
            Recent Prices (last 5 intervals): [${recentHistory}]
            
            Based on this price action, determine the immediate short-term trend direction (Scalping strategy).
        `;
    }
}
exports.OpenAIService = OpenAIService;
