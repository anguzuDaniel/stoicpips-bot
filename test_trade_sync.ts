import dotenv from 'dotenv';
dotenv.config();

import { DerivWebSocket } from './src/deriv/DerivWebSocket';
import { syncDerivTrades } from './src/controllers/bot/trade/syncDerivTrades';

const testSync = async () => {
    const token = process.env.DERIV_API_TOKEN;
    const userId = "b909df07-e070-4965-b74e-7b758778696b"; // From previous logs

    if (!token) {
        console.error("DERIV_API_TOKEN missing");
        return;
    }

    console.log("🚀 Testing Trade Sync...");

    const ws = new DerivWebSocket({
        apiToken: token,
        appId: process.env.DERIV_APP_ID || '1089'
    });

    // Wait for authorization
    const authorized = new Promise((resolve) => {
        ws.once('authorized', (data) => resolve(data));
    });

    ws.connect();

    const authResult: any = await authorized;
    if (!authResult.success) {
        console.error("Auth failed:", authResult.error);
        process.exit(1);
    }

    console.log("✅ Authorized. Syncing trades...");

    const count = await syncDerivTrades(userId, ws, 20);
    console.log(`📊 Synced ${count} trades.`);

    ws.disconnect();
    process.exit(0);
};

testSync();
