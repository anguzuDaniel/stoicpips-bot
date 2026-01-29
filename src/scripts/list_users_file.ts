
import { supabase } from '../config/supabase';
import fs from 'fs';
import path from 'path';

async function listUsers() {
    console.error("Listing profiles to file...");
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);

    if (error) {
        console.error("Error fetching profiles:", error);
    } else {
        const outputPath = path.resolve(__dirname, '../../users_dump.json');
        fs.writeFileSync(outputPath, JSON.stringify(profiles, null, 2));
        console.error(`Wrote ${profiles?.length} profiles to ${outputPath}`);
    }
}

listUsers().catch(console.error);
