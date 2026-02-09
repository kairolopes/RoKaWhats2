
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('--- List Conversations ---');
  const { data: convs, error: listErr } = await supabase
    .from('conversations')
    .select('id, workspace_id, contact_id')
    .limit(5);

  if (listErr) {
    console.error('List Error:', listErr);
    return;
  }
  
  if (convs.length === 0) {
    console.log('No conversations found.');
    return;
  }
  
  const conv = convs[0];
  console.log('Using Conversation:', conv);

  // 2. Insert Message
  console.log('--- Attempting INSERT ---');
  const { data, error } = await supabase
    .from('messages')
    .insert({
      workspace_id: conv.workspace_id,
      conversation_id: conv.id,
      content: 'Debug Insert Test ' + Date.now(),
      direction: 'out',
      status: 'sent',
      type: 'text'
    })
    .select()
    .single();

  if (error) {
    console.error('INSERT FAILED:', error);
  } else {
    console.log('INSERT SUCCESS:', data);
  }
}

testInsert();
