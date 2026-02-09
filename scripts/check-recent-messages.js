
const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config({ path: '.env.local' });

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentMessages() {
  console.log('--- Checking Recent Messages (Last 10) ---');
  
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching messages:', error);
  } else {
    if (messages.length === 0) {
      console.log('No messages found in DB.');
    } else {
      console.log(`Found ${messages.length} messages:`);
      messages.forEach(m => {
            console.log(`ID: ${m.id}`);
            console.log(`Created: ${m.created_at}`);
            console.log(`Content: "${m.content}"`);
            console.log(`Direction: ${m.direction}`);
            console.log(`Status: ${m.status}`);
            console.log(`ExtID: ${m.external_message_id}`);
            console.log(`Workspace: ${m.workspace_id}`);
            console.log('---');
          });
    }
  }
}

checkRecentMessages();
