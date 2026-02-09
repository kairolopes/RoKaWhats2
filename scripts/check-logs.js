
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
  console.log('Checking recent webhook logs for /api/inbox/send...');
  
  const { data, error } = await supabase
    .from('webhook_logs')
    .select('*')
    // .eq('route', '/api/inbox/send') // Commented out to see all
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching logs:', error);
    return;
  }

  if (data.length === 0) {
    console.log('No logs found for /api/inbox/send');
  } else {
    data.forEach(log => {
      console.log(`[${log.created_at}] Route: ${log.route} | Status: ${log.status}`);
      console.log('Payload:', JSON.stringify(log.payload));
      console.log('Error:', log.error);
      console.log('---');
    });
  }
}

checkLogs();
