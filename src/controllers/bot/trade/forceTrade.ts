import { Response } from "express";
import { botStates } from "../../../types/botStates";
// Removed global deriv import, use botState.derivWS

/**
 * Force a trade on Deriv using the given parameters
 */
export const forceTrade = async (req: any, res: Response) => {
  try {
    const { amount, symbol, contractType, duration } = req.body;
    const userId = req.user.id;
    const botState = botStates.get(userId);

    if (!botState || !botState.derivWS) {
      throw new Error("Bot is not running or Deriv connection not initialized");
    }

    // This is a simplified version, ideally would use buildProposalParams
    // and correctly handle the proposal response.
    // For now, we'll use the existing executeTrade method on the WebSocket if available.

    const signal = {
      action: contractType === 'CALL' ? 'BUY' : 'SELL',
      contract_type: contractType,
      symbol: symbol,
      amount: amount,
      duration: duration,
      barrier: null // Optional
    };

    const tradeResult = await botState.derivWS.executeTrade(signal);

    if (tradeResult) {
      res.json({ message: "Trade executed successfully", tradeId: tradeResult.id });
    } else {
      res.status(500).json({ error: "Trade execution failed" });
    }

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Trade failed: " + error.message });
  }
};
