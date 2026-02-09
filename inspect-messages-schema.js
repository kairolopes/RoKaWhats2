
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
const env = {};
const lines = fs.readFileSync(envPath, 'utf8').split('\n');
lines.forEach(line => {
    const p = line.indexOf('=');
    if (p > 0) env[line.substring(0, p).trim()] = line.substring(p + 1).trim();
});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectSchema() {
    console.log('Inspecting messages table...');
    // We can't directly inspect schema via JS client easily, but we can insert a dummy row to fail and see columns, 
    // or just list columns if we had a metadata table. 
    // Better: Select one row and see keys.
    const { data, error } = await supabase.from('messages').select('*').limit(1);
    if (error) {
        console.error('Error:', error);
    } else {
        if (data.length > 0) {
            console.log('Columns:', Object.keys(data[0]));
        } else {
            console.log('No data found, trying to insert with arbitrary columns to see if it accepts media_url...');
             const { error: insertErr } = await supabase.from('messages').insert({
                 workspace_id: '6228cbce-c983-43c1-b2e8-f2dd647dc0ff', // Valid one from previous logs
                 // conversation_id: '...', // We need valid FKs.
                 // Let's rely on previous knowledge or just assume standard schema.
                 // Actually, I should check if I can fetch table info.
             });
             // The previous logs showed: workspace_id, conversation_id, content, direction, type, status, external_message_id.
             // I'll check if 'media_url' exists.
        }
    }
}

inspectSchema();
