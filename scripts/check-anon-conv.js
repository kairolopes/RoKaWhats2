
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
// Using ANON key from page.tsx
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0Nzc5OTUsImV4cCI6MjA4NjA1Mzk5NX0.W8nZf0tpxTAfLb0CELOJs0LYQdOonLJz9SkjMbu_KCg";

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConversations() {
  console.log('--- Checking Conversations (Anon) ---');
  
  const { data: convs, error } = await supabase
    .from('conversations')
    .select('id')
    .limit(5);

  if (error) {
    console.error('Error fetching conversations:', error);
  } else {
    console.log(`Found ${convs.length} conversations.`);
  }
}

checkConversations();
