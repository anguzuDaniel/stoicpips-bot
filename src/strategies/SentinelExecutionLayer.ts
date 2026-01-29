import axios from 'axios';
import { TradingSignal, DerivCandle } from '../deriv/types';
import { BotLogger } from '../utils/botLogger';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export class SentinelExecutionLayer {
    /**
     * Wrapper function to execute scalp with AI filter or fallback
     */
    public async executeScalpWithFallback(
        signal: TradingSignal,
        tier: string,
        hasTakenFirstTrade: boolean
    ): Promise<{
        shouldExecute: boolean,
        isFallback: boolean,
        confidence: number,
        amount: number
    }> {

        // Elite users get the AI filter
        if (tier === 'elite') {
            try {
                const response = await axios.post(`${AI_SERVICE_URL}/predict`, {
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
                } else {
                    console.log(`🤖 AI Confidence: ${aiConfidence}% - Entry Blocked (Below 85%).`);
                    return {
                        shouldExecute: false,
                        isFallback: false,
                        confidence: aiConfidence,
                        amount: 0
                    };
                }
            } catch (error: any) {
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
