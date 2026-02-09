
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

// Helper to load env manually if dotenv fails or .env is not standard
const fs = require('fs');
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (e) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMessages() {
  console.log('Checking last 5 messages...');
  
  const { data: messages, error } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      status,
      direction,
      workspace_id,
      contact:contacts(name, phone, profile_pic_url)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching messages:', error);
    return;
  }

  if (messages.length === 0) {
    console.log('No messages found.');
  } else {
    messages.forEach(m => {
      console.log(`[${m.created_at}] ${m.direction.toUpperCase()} (${m.status}): ${m.content}`);
      if (m.contact) {
        console.log(`  Contact: ${m.contact.name} (${m.contact.phone})`);
      }
    });
  }
}

checkMessages();
