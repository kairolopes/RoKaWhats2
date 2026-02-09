
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

// if (!supabaseUrl || !supabaseServiceKey) {
//   console.error("❌ Missing environment variables.");
//   process.exit(1);
// }

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkData() {
  console.log('🔍 Checking Contacts...');
  const { data: contacts, error: contactError } = await supabase
    .from('contacts')
    .select('id, name, phone, workspace_id')
    .or('phone.eq.5562985635204,phone.eq.556285635204')
    
  if (contactError) console.error('Error fetching contacts:', contactError);
  else console.table(contacts);

  console.log('\n🔍 Checking ALL Contacts (limit 20)...');
   const { data: allContacts } = await supabase
     .from('contacts')
     .select('id, name, phone, profile_pic_url, workspace_id')
     .limit(20);
   console.table(allContacts);

  console.log('\n🔍 Checking Conversations with Contact Details...');
  const { data: convsFull, error: convFullError } = await supabase
    .from('conversations')
    .select(`
      id,
      contact_id,
      contacts (
        name,
        phone
      )
    `)
    .limit(10);

  if (convFullError) console.error('Error fetching full conversations:', convFullError);
  else {
      convsFull.forEach(c => {
          console.log(`Conv ${c.id}: Phone=${c.contacts?.phone}, Name=${c.contacts?.name}`);
      });
  }

  console.log('\n🔍 Checking Webhook Logs (Outbound)...');
  const { data: logs, error: logError } = await supabase
    .from('webhook_logs')
    .select('payload, created_at')
    .eq('route', '/api/inbox/send')
    .order('created_at', { ascending: false })
    .limit(5);

  if (logError) console.error('Error fetching logs:', logError);
  else {
      logs.forEach(l => {
          console.log(`[${l.created_at}] To: ${l.payload?.to?.phone}, Msg: ${l.payload?.message?.text}`);
      });
  }
}

checkData();
