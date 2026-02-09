
const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkWorkspaces() {
  console.log('🔍 Checking Workspaces...');
  
  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('id, name');

  if (error) {
    console.error('❌ Error fetching workspaces:', error);
    return;
  }

  console.log('✅ Workspaces found:', workspaces);

  console.log('\n🔍 Checking recent conversations...');
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, workspace_id, contacts(name, phone), last_message_at')
    .order('last_message_at', { ascending: false })
    .limit(5);
    
  console.log(JSON.stringify(conversations, null, 2));
}

checkWorkspaces();
