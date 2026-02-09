
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
// Using SERVICE ROLE key to bypass RLS
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMessages() {
  console.log('--- Checking Messages (Service Role) ---');
  
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching messages:', error);
  } else {
    if (messages.length === 0) {
      console.log('No messages found in DB.');
    } else {
      console.log(`Found ${messages.length} messages:`);
      messages.forEach(m => {
        console.log(`[${m.direction}] ${m.created_at} - ${m.status}: ${m.content ? m.content.substring(0, 50) : '[no content]'}`);
      });
    }
  }

  console.log('\n--- Checking Webhook Logs (Service Role) ---');
  const { data: logs, error: logError } = await supabase
    .from('webhook_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (logError) {
     console.error('Error fetching webhook_logs:', logError.message);
  } else {
     logs.forEach(l => {
         console.log(`Log ${l.id}: ${l.route} - ${l.status} (${l.created_at})`);
         if (l.error) console.log(`  Error: ${l.error}`);
     });
  }
}

checkMessages();
