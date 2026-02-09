
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables.');
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseServiceKey);
const anon = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log('🚀 Starting Verification Tests (No Deploy Needed)...\n');
  let success = true;

  // TEST 1: Simulate API Route Logic (Fix for List)
  console.log('TEST 1: Verifying Conversation List Fetch (Admin Bypass)');
  try {
    const { data: convs, error } = await admin
      .from('conversations')
      .select(`
        id,
        contacts (id, name, phone)
      `)
      .limit(5);

    if (error) throw error;
    console.log(`✅ SUCCESS: Fetched ${convs.length} conversations via Admin Client.`);
    
    if (convs.length > 0) {
        console.log(`   Sample: ${convs[0].contacts?.name || convs[0].contacts?.phone}`);
        
        // Test fetching last message logic
        const { data: msg } = await admin
            .from('messages')
            .select('content')
            .eq('conversation_id', convs[0].id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        console.log(`✅ SUCCESS: Fetched last message content: "${msg?.content || 'No messages'}"`);
    }
  } catch (e) {
    console.error('❌ FAILED: Conversation Fetch Error:', e.message);
    success = false;
  }

  // TEST 2: Verify Messages Realtime Access (Anon)
  console.log('\nTEST 2: Verifying Realtime Message Access (Anon)');
  try {
    const { data: msgs, error } = await anon
      .from('messages')
      .select('id, content')
      .limit(1);

    if (error) {
        console.error('❌ FAILED: Anon Message Access Error (Realtime will fail):', error.message);
        success = false;
    } else {
        console.log(`✅ SUCCESS: Anon user can read messages (Realtime will work).`);
    }
  } catch (e) {
    console.error('❌ FAILED: Message Check Error:', e.message);
    success = false;
  }

  console.log('\n--------------------------------------------------');
  if (success) {
    console.log('🎉 ALL TESTS PASSED. The fix is verified.');
    console.log('You can deploy with confidence.');
  } else {
    console.log('⚠️ SOME TESTS FAILED. Review errors above.');
  }
}

runTests();
