const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8"; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDebugLogs() {
  console.log("--- Checking DEBUG Logs (Last 20) ---");
  const { data: logs, error } = await supabase
    .from('webhook_logs')
    .select('*')
    .eq('route', 'DEBUG:persistMessage')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching debug logs:", error);
    return;
  }

  if (logs.length === 0) {
    console.log("No DEBUG logs found.");
  } else {
    logs.forEach(log => {
      console.log(`[${log.created_at}] Payload:`, JSON.stringify(log.payload, null, 2));
    });
  }
}

checkDebugLogs();