const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestMessage() {
  console.log('--- Checking Latest Message in DB ---');
  
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (messages.length === 0) {
    console.log('No messages found.');
  } else {
    console.log('Latest messages:');
    messages.forEach(m => {
      console.log(`[${m.direction}] ${m.created_at} | Content: ${m.content ? m.content.substring(0, 50) : '[no content]'} | Status: ${m.status}`);
    });
    
    // Check if any is very recent (last 5 mins)
    const lastMsgTime = new Date(messages[0].created_at).getTime();
    const now = Date.now();
    const diffMins = (now - lastMsgTime) / 1000 / 60;
    
    console.log(`\nTime since last message: ${diffMins.toFixed(2)} minutes`);
  }
}

checkLatestMessage();
