
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPayloads() {
  console.log('--- Checking Webhook Payloads (Service Role) ---');
  const { data: logs, error: logError } = await supabase
    .from('webhook_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  if (logError) {
     console.error('Error fetching webhook_logs:', logError.message);
  } else {
     logs.forEach(l => {
         console.log(`Log ${l.id}: ${l.route} - ${l.status}`);
         console.log('Payload:', JSON.stringify(l.payload, null, 2));
         if (l.error) console.log('Error:', l.error);
         console.log('---');
     });
  }
}

checkPayloads();
