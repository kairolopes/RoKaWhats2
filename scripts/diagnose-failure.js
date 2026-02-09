
const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnoseFailure() {
  console.log('🔍 Diagnosing recent activity...');

  // 1. Check Messages (Last 10 min)
  console.log('\n1️⃣ Checking Messages (Last 5 created):');
  const { data: messages } = await supabase
    .from('messages')
    .select('id, content, status, created_at, conversation_id')
    .order('created_at', { ascending: false })
    .limit(5);
  console.log(JSON.stringify(messages, null, 2));

  // 2. Check Webhook Logs (API logs calls to Make here)
  console.log('\n2️⃣ Checking Webhook Logs (Last 5 entries):');
  const { data: logs } = await supabase
    .from('webhook_logs')
    .select('id, route, status, error, payload, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  console.log(JSON.stringify(logs, null, 2));

  // 3. Check Conversation Timestamp
  if (messages && messages.length > 0) {
      const lastMsg = messages[0];
      console.log(`\n3️⃣ Checking Conversation ${lastMsg.conversation_id} timestamp:`);
      const { data: conv } = await supabase
        .from('conversations')
        .select('id, last_message_at, updated_at')
        .eq('id', lastMsg.conversation_id)
        .single();
      console.log(JSON.stringify(conv, null, 2));
  }
}

diagnoseFailure();
