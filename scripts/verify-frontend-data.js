
const { createClient } = require('@supabase/supabase-js');

// Use the ANON key from page.tsx
const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0Nzc5OTUsImV4cCI6MjA4NjA1Mzk5NX0.W8nZf0tpxTAfLb0CELOJs0LYQdOonLJz9SkjMbu_KCg";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkFrontendData() {
  console.log('--- Checking Conversations (ANON) - SIMPLE ---');
  
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select(`
      id,
      created_at,
      workspace_id,
      contact_id
    `)
    .limit(5);

  if (convError) {
    console.error('Conversations Fetch Error:', convError);
  } else {
    console.log(`Found ${conversations.length} conversations.`);
    if (conversations.length > 0) {
        console.log('Sample conversation:', JSON.stringify(conversations[0], null, 2));
    } else {
        console.log('No conversations visible to ANON user.');
    }
  }

  console.log('\n--- Checking Contacts (ANON) ---');
  const { data: contacts, error: contactError } = await supabase
    .from('contacts')
    .select('*')
    .limit(5);

  if (contactError) {
    console.error('Contacts Fetch Error:', contactError);
  } else {
    console.log(`Found ${contacts.length} contacts.`);
  }
}

checkFrontendData();
