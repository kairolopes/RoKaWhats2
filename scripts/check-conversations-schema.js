
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables.');
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseServiceKey);

async function checkConversationsSchema() {
  console.log('🔍 Checking conversations table schema...');
  
  try {
    const { data, error } = await admin
      .from('conversations')
      .select('*')
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      console.log('✅ Found conversation. Keys:', Object.keys(data[0]));
    } else {
      console.log('⚠️ No conversations found, cannot infer schema easily via select.');
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
}

checkConversationsSchema();
