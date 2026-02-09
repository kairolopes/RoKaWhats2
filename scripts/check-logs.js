
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.error("Ensure .env.local exists and contains these variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
  console.log("🔍 Checking Webhook Logs for /api/inbox/send...");

  const { data: logs, error } = await supabase
    .from('webhook_logs')
    .select('*')
    .eq('route', '/api/inbox/send')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("❌ Error fetching logs:", error);
    return;
  }

  if (!logs || logs.length === 0) {
    console.log("⚠️ No logs found.");
    return;
  }

  console.log(`✅ Found ${logs.length} logs:\n`);
  logs.forEach((log, index) => {
    console.log(`[${index + 1}] ID: ${log.id} | Status: ${log.status} | Time: ${log.created_at}`);
    console.log(`    Error: ${log.error || 'None'}`);
    console.log(`    Payload Phone: ${log.payload?.to?.phone || 'N/A'}`);
    console.log(`    Payload Message: ${log.payload?.message?.text || 'N/A'}`);
    console.log('---');
  });
}

checkLogs();
