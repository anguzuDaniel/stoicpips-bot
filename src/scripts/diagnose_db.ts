require('dotenv').config(); // Load .env from root
const { supabase } = require('../config/supabase');
import { DerivWebSocket } from '../deriv/DerivWebSocket';

async function testToken(type: string, token: string) {
    if (!token) {
        console.log(`\n⚠️  No ${type} Token found.`);
        return;
    }

    const clean = token.trim().replace(/[\[\]"]/g, '');
    console.log(`\n🔍 Testing ${type} Token: ${clean.substring(0, 4)}... (Length: ${clean.length})`);

    return new Promise<void>((resolve) => {
        const ws = new DerivWebSocket({
            apiToken: clean,
            appId: '1089',
            reconnect: false
        });

        const cleanup = () => {
            ws.disconnect();
            if (timer) clearTimeout(timer);
            resolve();
        };

        const timer = setTimeout(() => {
            console.error("   ❌ TIMEOUT: No response from Deriv.");
            cleanup();
        }, 10000);

        ws.on('authorized', (auth: any) => {
            if (auth.success) {
                console.log(`   ✅ SUCCESS! Account: ${auth.loginid}`);
                const status = ws.getStatus();
                // Brief wait for balance update if needed (usually immediate sync in handleMessage)
                // But handleMessage might run after 'authorized' event loop?
                // Step 3004 shows handleMessage updating props THEN emitting authorized. So status is ready.

                console.log(`   💰 Balance: ${status.balance} ${status.currency || 'USD'}`);
                if (type === 'REAL' && status.balance <= 0.5) {
                    console.warn(`   ⚠️  WARNING: Real Balance is EMPTY. Bot would block this.`);
                }
            } else {
                console.error(`   ❌ FAILED: ${auth.error?.message || 'Invalid Token'}`);
            }
            cleanup();
        });

        // Handle connection error logging
        // ws.on('log', (d:any) => { if(d.type==='error') console.log('   [Deriv Error]', d.message) });

        console.log("   🚀 Connecting...");
        ws.connect();
    });
}

(async () => {
    console.log("🔍 Auto-Diagnosis: Fetching tokens from Database...");

    // Check environment
    if (!process.env.SUPABASE_URL) {
        console.error("❌ ERROR: SUPABASE_URL not found in environment.");
        process.exit(1);
    }

    const { data: configs, error } = await supabase
        .from('bot_configs')
        .select('*')
        .limit(5);

    if (error) {
        console.error("❌ DB Error:", error.message);
        process.exit(1);
    }

    if (!configs || configs.length === 0) {
        console.error("❌ No bot configurations found in database.");
        process.exit(1);
    }

    console.log(`✅ Found ${configs.length} configuration(s). Testing tokens...`);

    for (const config of configs) {
        console.log(`\n[User ID: ${config.user_id}]`);
        const real = config.deriv_real_token || config.derivRealToken;
        const demo = config.deriv_demo_token || config.derivDemoToken;

        await testToken('REAL', real);
        await testToken('DEMO', demo);
    }

    console.log("\n✅ Diagnosis Complete.");
    process.exit(0);
})();
