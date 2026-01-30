import { Client } from 'pg';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config();

async function reloadSchemaV2() {
    console.log("Reloading schema (v2)...");

    const dbUrl = process.env.SUPABASE_URL || '';
    let host = '';
    const match = dbUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (match) {
        host = `db.${match[1]}.supabase.co`;
    } else {
        console.error("Could not parse SUPABASE_URL");
        process.exit(1);
    }

    console.log("Host:", host);

    const password = process.env.SUPABASE_DATABASE_PASSWORD;
    const connectionString = `postgres://postgres:${password}@${host}:5432/postgres`;

    // Use the pooler if possible? No, reloading schema needs direct.
    // Ensure we are connecting to port 5432 which is usually direct.

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Connected!");

        console.log("Executing NOTIFY...");
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log("Done.");

    } catch (err: any) {
        console.error("Failed:", err.message);
    } finally {
        await client.end();
    }
}

reloadSchemaV2();
