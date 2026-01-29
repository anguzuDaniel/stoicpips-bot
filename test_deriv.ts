
import dotenv from 'dotenv';
dotenv.config();

import { DerivWebSocket } from './src/deriv/DerivWebSocket';

// Polyfill for BotLogger if needed, or just console.log in the class
// The class uses console.log and emits 'log' events.

const run = async () => {
    const token = process.env.DERIV_API_TOKEN;
    const appId = process.env.DERIV_APP_ID;

    if (!token || !appId) {
        console.error("Missing DERIV_API_TOKEN or DERIV_APP_ID in .env");
        process.exit(1);
    }

    console.log(`Testing Deriv Connection with App ID: ${appId}`);

    const deriv = new DerivWebSocket({
        apiToken: token,
        appId: appId,
        reconnect: false
    });

    deriv.on('log', (data) => {
        console.log(`[LOG EVENT] [${data.type}] ${data.message}`);
    });

    deriv.on('balance_update', (data) => {
        console.log('Balance Update Event:', data);
    });

    deriv.connect();

    // Keep alive for a bit
    setTimeout(() => {
        console.log("Test finished.");
        process.exit(0);
    }, 10000);
};

run();
