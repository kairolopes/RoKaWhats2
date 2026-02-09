
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkLatest() {
  console.log('🔍 Checking for latest messages...');
  
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*, conversation_id')
    .ilike('content', '%Teste de envio via API%')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error fetching messages:', error);
    return;
  }

  if (messages.length === 0) {
    console.log('❌ No messages found with that text.');
    return;
  }

  console.log(`✅ Found ${messages.length} messages.`);
  
  for (const msg of messages) {
    console.log(`\n📩 Message ID: ${msg.id}`);
    console.log(`   Content: ${msg.content}`);
    console.log(`   Created At: ${msg.created_at}`);
    console.log(`   Conversation ID: ${msg.conversation_id}`);
    
    // Check conversation
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', msg.conversation_id)
      .single();
      
    if (convError) {
      console.error('   ❌ Error fetching conversation:', convError);
    } else {
      console.log(`   📂 Conversation Status: ${conv.status}`);
      console.log(`   🕒 Last Message At: ${conv.last_message_at}`);
      console.log(`   👤 Contact ID: ${conv.contact_id}`);
    }
  }
}

checkLatest();
