import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
    const email = `test_user_${Date.now()}@example.com`;
    const password = 'Password123!';

    console.log(`Attempting signup for ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error('❌ Signup Error:', error.message);
        if (error.status) console.error('Status:', error.status);
    } else {
        console.log('✅ Signup Successful!');
        console.log('User ID:', data.user?.id);

        // Check if profile was created
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user?.id)
            .single();

        if (profileError) {
            console.error('❌ Profile Fetch Error:', profileError.message);
        } else {
            console.log('✅ Profile found:', profile);
        }
    }
}

testSignup();
