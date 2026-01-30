import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';

async function reloadSchemaProven() {
    console.log("Reloading schema (Proven Way)...");

    let host = '';
    const match = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (match) {
        host = `db.${match[1]}.supabase.co`;
    } else {
        console.error("No match for host");
        return;
    }

    console.log("Target Host:", host);

    const client = new Client({
        connectionString: `postgres://postgres:${process.env.SUPABASE_DATABASE_PASSWORD}@${host}:5432/postgres`,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("✅ Connected!");

        console.log("Sending NOTIFY...");
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log("✅ NOTIFY sent.");

    } catch (e: any) {
        console.error("❌ Failed:", e.message);
    } finally {
        await client.end();
    }
}

reloadSchemaProven();
