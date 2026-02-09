
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables. Run with: source .env.local && node scripts/fix-timestamp-force.js");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixTimestamps() {
  console.log('🔍 Checking for conversations with NULL last_message_at...');
  
  // 1. Get conversations with null timestamp
  const { data: convs, error } = await supabase
    .from('conversations')
    .select('id, created_at')
    .is('last_message_at', null);

  if (error) {
    console.error('❌ Error fetching conversations:', error);
    return;
  }

  console.log(`found ${convs.length} conversations to fix.`);

  for (const conv of convs) {
    // Use created_at or current time
    const newTime = conv.created_at || new Date().toISOString();
    console.log(`🛠 Fixing conversation ${conv.id} -> ${newTime}`);
    
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ last_message_at: newTime })
      .eq('id', conv.id);
      
    if (updateError) {
      console.error(`  ❌ Failed to update ${conv.id}:`, updateError);
    } else {
      console.log(`  ✅ Fixed ${conv.id}`);
    }
  }
}

fixTimestamps();
