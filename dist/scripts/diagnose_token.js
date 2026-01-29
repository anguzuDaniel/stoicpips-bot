"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DerivWebSocket_1 = require("../deriv/DerivWebSocket");
const token = process.argv[2] || '';
if (!token) {
    console.error("❌ Usage: npx ts-node src/scripts/diagnose_token.ts <YOUR_TOKEN>");
    process.exit(1);
}
// Check for raw formatting issues before sanitization
if (token.includes('[') || token.includes(' ') || token.includes('"')) {
    console.warn("⚠️  WARNING: Input token contains spaces or brackets.");
    console.warn("    The bot will sanitize this, but please copy only the alphanumeric string.");
}
const clean = token.trim().replace(/[\[\]"]/g, '');
console.log(`\n🔍 Analyzing Token: ${clean.substring(0, 4)}...${clean.substring(clean.length - 4)}`);
console.log(`   Length: ${clean.length} chars`);
const ws = new DerivWebSocket_1.DerivWebSocket({
    apiToken: clean,
    appId: '1089',
    reconnect: false
});
console.log("\n🚀 Connecting to Deriv...");
ws.on('log', (data) => {
    // Filter noise
    if (data.type === 'error' || data.type === 'info') {
        console.log(`[${data.type.toUpperCase()}] ${data.message}`);
    }
});
ws.connect();
// Wait for Auth
const timeout = setTimeout(() => {
    console.error("\n❌ TIMEOUT: Connection timed out after 15s.");
    console.error("   Possible causes: Network firewall, Invalid App ID, or Deriv API Down.");
    process.exit(1);
}, 15000);
ws.on('authorized', (auth) => {
    clearTimeout(timeout);
    if (auth.success) {
        console.log("\n✅ AUTHORIZATION SUCCESSFUL!");
        console.log(`   Account: ${auth.loginid}`);
        // Check Balance
        setTimeout(() => {
            const status = ws.getStatus();
            console.log(`   💰 Balance: ${status.balance} ${status.currency || 'USD'}`);
            if (!auth.loginid.startsWith('V')) { // Real account check (simple)
                if (status.balance <= 0.5) {
                    console.warn("\n⚠️  WARNING: Real Account Balance is EMPTY (<= 0.5).");
                    console.warn("    The bot will REFUSE to start.");
                }
                else {
                    console.log("\n✅ Account is ready for trading.");
                }
            }
            else {
                console.log("\n✅ Demo Account connected.");
            }
            process.exit(0);
        }, 1000);
    }
    else {
        console.error("\n❌ AUTHORIZATION FAILED.");
        console.error(`   Error: ${auth.error?.message || auth.error || 'Unknown error'}`);
        console.error("   Please check that your token is valid and not expired.");
        process.exit(1);
    }
});
