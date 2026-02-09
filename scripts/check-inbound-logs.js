const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWebhookLogs() {
  console.log('--- Checking Webhook Logs ---');
  
  const { data: logs, error } = await supabase
    .from('webhook_logs')
    .select('*')
    .eq('route', '/api/inbox/webhook')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching logs:', error);
    return;
  }

  if (logs.length === 0) {
    console.log('No webhook logs found for /api/inbox/webhook.');
  } else {
    console.log(`Found ${logs.length} logs:`);
    logs.forEach(l => {
      console.log(`[${l.created_at}] Status: ${l.status} | Error: ${l.error} | ExtID: ${l.external_message_id}`);
    });
    
    // Check timing
    const lastLogTime = new Date(logs[0].created_at).getTime();
    const now = Date.now();
    const diffMins = (now - lastLogTime) / 1000 / 60;
    console.log(`\nTime since last log: ${diffMins.toFixed(2)} minutes`);
  }
}

checkWebhookLogs();
