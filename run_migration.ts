import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config();

async function runMigration() {
    console.log("Starting migration...");

    const dbUrl = process.env.SUPABASE_URL || '';
    // Extract host from URL (e.g. https://xyz.supabase.co -> db.xyz.supabase.co)
    // Actually Supabase DB host is usually db.[project-ref].supabase.co
    // Project ref is the subdomain.

    let host = '';
    const match = dbUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (match) {
        host = `db.${match[1]}.supabase.co`;
    } else {
        console.error("Could not parse SUPABASE_URL");
        process.exit(1);
    }

    const password = process.env.SUPABASE_DATABASE_PASSWORD;
    if (!password) {
        console.error("Missing SUPABASE_DATABASE_PASSWORD");
        process.exit(1);
    }

    const connectionString = `postgres://postgres:${password}@${host}:5432/postgres`;
    console.log(`Connecting to ${host}...`);

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false } // Supabase requires SSL
    });

    try {
        await client.connect();
        console.log("Connected to database.");

        // Restore original logic to run specific migration
        const migrationPath = path.join(__dirname, 'migrations', '010_create_notifications.sql');
        const sql = fs.readFileSync(migrationPath, 'utf-8');

        console.log("Executing SQL from 010_create_notifications.sql...");
        await client.query(sql);
        console.log("Migration executed successfully! Table should now exist.");

    } catch (err: any) {
        console.error("Migration failed:", err.message);
    } finally {
        await client.end();
    }
}

runMigration();
