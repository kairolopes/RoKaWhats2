
const { createClient } = require('@supabase/supabase-js');

// Use the ANON key from page.tsx (hardcoded for test)
const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0Nzc5OTUsImV4cCI6MjA4NjA1Mzk5NX0.W8nZf0tpxTAfLb0CELOJs0LYQdOonLJz9SkjMbu_KCg";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRLS() {
  console.log('--- Checking Messages with ANON Key ---');
  
  // Try to fetch any message
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .limit(5);

  if (error) {
    console.error('RLS Error:', error);
  } else {
    console.log(`RLS OK. Found ${messages.length} messages.`);
    if (messages.length > 0) {
        console.log('First message content:', messages[0].content);
    } else {
        console.log('No messages found (Table might be empty or RLS hides them)');
    }
  }
}

checkRLS();
