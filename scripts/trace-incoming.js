
const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config({ path: '.env.local' });

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

const supabase = createClient(supabaseUrl, supabaseKey);

async function traceLast() {
  console.log("🔍 Tracing last events...");

  // 1. Last Webhook Log (ALL)
  const { data: logs, error: logError } = await supabase
    .from('webhook_logs')
    .select('*')
    // .eq('route', '/api/inbox/webhook') 
    .order('created_at', { ascending: false })
    .limit(5);

  if (logError) console.error("Error fetching logs:", logError);
  else if (logs && logs.length > 0) {
    console.log(`\n📡 Last 5 Webhook Logs:`);
    logs.forEach(log => {
        console.log(`   [${log.created_at}] ID: ${log.id} | Route: ${log.route} | Status: ${log.status} | Phone: ${log.payload?.phone || 'N/A'}`);
    });
    
    // Detail the first one if it is inbox
    const inboxLog = logs.find(l => l.route.includes('webhook') || l.route.includes('inbox/webhook'));
    if (inboxLog) {
        console.log(`\n🔍 Detailed Last INBOX WEBHOOK Log (ID: ${inboxLog.id}):`);
        console.log(`   Full Payload: ${JSON.stringify(inboxLog.payload, null, 2)}`);
    }
  } else {
    console.log("\n📡 No Webhook Logs found.");
  }

  // 3. Check for specific Content
const contentSearch = 'tudo joia';
console.log(`\n🔎 Searching for Content: "${contentSearch}"`);
const { data: contentMsg, error: contentError } = await supabase
  .from('messages')
  .select('*')
  .ilike('content', `%${contentSearch}%`)
  .maybeSingle();

if (contentError) console.error("Error searching content:", contentError);
else if (contentMsg) {
  console.log(`   ✅ FOUND Message by Content!`);
  console.log(`   ID: ${contentMsg.id}`);
  console.log(`   Created At: ${contentMsg.created_at}`);
  console.log(`   External ID: ${contentMsg.external_message_id}`);
} else {
  console.log(`   ❌ Message NOT FOUND by Content.`);
}

  // 2. Last Message
  const { data: msgs, error: msgError } = await supabase
    .from('messages')
    .select(`
      *,
      conversations (
        id,
        contacts (
          name,
          phone
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(1);

  if (msgError) console.error("Error fetching messages:", msgError);
  else if (msgs && msgs.length > 0) {
    const msg = msgs[0];
    const contact = msg.conversations?.contacts;
    console.log(`\n💬 Last DB Message (${msg.created_at}):`);
    console.log(`   ID: ${msg.id}`);
    console.log(`   Content: ${msg.content}`);
    console.log(`   Direction: ${msg.direction}`);
    console.log(`   Contact Phone: ${contact?.phone || 'N/A'}`);
    console.log(`   Contact Name: ${contact?.name || 'N/A'}`);
  } else {
    console.log("\n💬 No Messages found.");
  }

    // 3. Last Conversation Updated
  const { data: convs, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(1);

    if (convError) console.error("Error fetching conversations:", convError);
    else if (convs && convs.length > 0) {
        const conv = convs[0];
        console.log(`\nGd Last Conversation Updated (${conv.last_message_at}):`);
        console.log(`   ID: ${conv.id}`);
        console.log(`   Contact Phone: ${conv.contact_phone}`);
        console.log(`   Unread: ${conv.unread_count}`);
    }

}

traceLast();
