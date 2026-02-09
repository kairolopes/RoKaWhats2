
const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateTimestamp() {
  console.log('🔄 Updating last_message_at for conversation 90704f79-a54b-4626-a21f-e9a9d7a67f5b...');
  
  const { data, error } = await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', '90704f79-a54b-4626-a21f-e9a9d7a67f5b')
    .select();

  if (error) {
    console.error('❌ Error updating timestamp:', error);
  } else {
    console.log('✅ Timestamp updated! Conversation should be at the top now.');
  }
}

updateTimestamp();
