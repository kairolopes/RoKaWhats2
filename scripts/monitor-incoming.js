
const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config({ path: '.env' });

// Hardcode creds if env vars fail (fallback)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8"; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function monitor() {
  console.log("\n--- Checking Webhook Logs (Last 10) ---");
  const { data: logs, error: logError } = await supabase
    .from('webhook_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (logError) console.error("Log Error:", logError);
  else {
    logs.forEach(l => {
        console.log(`[${l.created_at}] Route: ${l.route}, Status: ${l.status}, Error: ${l.error}`);
        console.log("Payload:", JSON.stringify(l.payload, null, 2));
    });
  }

  console.log("\n--- Checking Messages (Last 5) ---");
  const { data: msgs, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (msgError) console.error("Msg Error:", msgError);
  else {
    msgs.forEach(m => {
        console.log(`[${m.created_at}] ID: ${m.id}, Content: ${m.content}, Direction: ${m.direction}`);
    });
  }
}

monitor();
