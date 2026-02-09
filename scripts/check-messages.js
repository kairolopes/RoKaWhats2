
const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMessages() {
  console.log('🔍 Checking Messages for Conversation 90704f79-a54b-4626-a21f-e9a9d7a67f5b...');
  
  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, content, created_at, status, direction')
    .eq('conversation_id', '90704f79-a54b-4626-a21f-e9a9d7a67f5b')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error fetching messages:', error);
    return;
  }

  console.log(JSON.stringify(messages, null, 2));
}

checkMessages();
