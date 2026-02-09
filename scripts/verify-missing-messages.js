
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  console.log('--- Checking for specific messages ---');
  
  // Check for the messages "çoko" and "lkjl"
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .in('content', ['çoko', 'lkjl'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching messages:', error);
  } else {
    console.log(`Found ${messages.length} matching messages.`);
    console.log(messages);
  }

  // Check recent logs for errors
  console.log('\n--- Checking recent error logs ---');
  const { data: logs, error: logError } = await supabase
    .from('webhook_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (logError) {
    console.error('Error fetching logs:', logError);
  } else {
    logs.forEach(log => {
      console.log(`[${log.created_at}] Route: ${log.route}, Status: ${log.status}, Error: ${log.error}`);
    });
  }
}

check();
