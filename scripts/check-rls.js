
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
// ANON KEY (Public) - Used by Frontend
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0Nzc5OTUsImV4cCI6MjA4NjA1Mzk5NX0.W8nZf0tpxTAfLb0CELOJs0LYQdOonLJz9SkjMbu_KCg";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRLS() {
  console.log('--- Checking RLS (Anon Access) ---');
  
  const conversationId = '82a776d8-cbc7-42a1-bd40-c7249da8d735'; // The conversation we know exists
  
  console.log(`Fetching messages for conversation: ${conversationId}`);
  
  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, content')
    .eq('conversation_id', conversationId)
    .limit(5);

  if (error) {
    console.error('❌ RLS Error (Anon cannot read):', error);
  } else {
    console.log(`✅ Success! Found ${messages.length} messages.`);
    messages.forEach(m => console.log(` - ${m.content}`));
  }
}

checkRLS();
