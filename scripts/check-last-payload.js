const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLastPayload() {
  console.log('--- Checking Last Webhook Payload ---');
  
  const { data: logs } = await supabase
    .from('webhook_logs')
    .select('*')
    .eq('route', '/api/inbox/webhook')
    .order('created_at', { ascending: false })
    .limit(1);

  if (logs && logs.length > 0) {
    const log = logs[0];
    console.log(`Log ID: ${log.id}`);
    console.log('Payload:', JSON.stringify(log.payload, null, 2));
  }
}

checkLastPayload();
