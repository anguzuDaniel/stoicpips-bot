"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentinelExecutionLayer = void 0;
const axios_1 = __importDefault(require("axios"));
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
class SentinelExecutionLayer {
    /**
     * Wrapper function to execute scalp with AI filter or fallback
     */
    async executeScalpWithFallback(signal, tier, hasTakenFirstTrade) {
        // Elite users get the AI filter
        if (tier === 'elite') {
            try {
                const response = await axios_1.default.post(`${AI_SERVICE_URL}/predict`, {
                    symbol: signal.symbol,
                    timeframe: '1m',
                    strategy_mode: 'scalping'
                }, { timeout: 500 });
                const aiConfidence = response.data.confidence; // 0-100
                if (aiConfidence >= 85) {
                    console.log(`🤖 AI Confidence: ${aiConfidence}% - Approved for Elite Entry.`);
                    return {
                        shouldExecute: true,
                        isFallback: false,
                        confidence: aiConfidence,
                        amount: signal.amount
                    };
                }
                else {
                    console.log(`🤖 AI Confidence: ${aiConfidence}% - Entry Blocked (Below 85%).`);
                    return {
                        shouldExecute: false,
                        isFallback: false,
                        confidence: aiConfidence,
                        amount: 0
                    };
                }
            }
            catch (error) {
                console.warn("🛡️ Sentinel: AI Down or Timeout. Reverting to Meditations Fallback Logic.");
                // Fallback Mode: Reduce position size by 50%
                const fallbackAmount = signal.amount * 0.5;
                return {
                    shouldExecute: true,
                    isFallback: true,
                    confidence: 0,
                    amount: fallbackAmount
                };
            }
        }
        // First Trade Free logic preservation
        if (tier === 'free' && !hasTakenFirstTrade) {
            console.log("🎁 Sentinel: First Trade Free detected. Executing without AI filter.");
            return {
                shouldExecute: true,
                isFallback: false,
                confidence: 0,
                amount: signal.amount
            };
        }
        // Non-Elite/Paid users use hardcoded rules without the 85% requirement (or as specified)
        // For the sake of this task, we'll assume they also fallback or just execute.
        return {
            shouldExecute: true,
            isFallback: false,
            confidence: 0,
            amount: signal.amount
        };
    }
}
exports.SentinelExecutionLayer = SentinelExecutionLayer;
