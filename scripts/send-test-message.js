
const { createClient } = require('@supabase/supabase-js');

// Use the exact credentials that are confirmed working locally
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables.');
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseServiceKey);

async function sendTestMessage() {
  console.log('🚀 Sending Test Message to 5562985635204 (Lorena Teste)...');
  
  const targetPhone = '5562985635204';
  const workspaceId = '6228cbce-c983-43c1-b2e8-f2dd647dc0ff';
  const messageText = 'Olá! Esta é uma mensagem de teste enviada via Trae após a correção do deploy. 🚀';

  // 1. Get or Create Contact (Assuming existing for now based on list output)
  const { data: contact } = await admin
    .from('contacts')
    .select('id')
    .eq('phone', targetPhone)
    .single();

  if (!contact) {
      console.error('❌ Contact not found.');
      return;
  }

  // 2. Get or Create Conversation
  const { data: conversation } = await admin
    .from('conversations')
    .select('id')
    .eq('contact_id', contact.id)
    .single();

  if (!conversation) {
      console.error('❌ Conversation not found.');
      return;
  }

  console.log(`✅ Found Conversation ID: ${conversation.id}`);

  // 3. Insert Outbound Message (This should trigger the Webhook/Make scenario if configured, 
  //    BUT our main goal is to see it appear on the frontend).
  //    Actually, to test the "sending" flow we usually hit an API endpoint, 
  //    but inserting into DB is enough to test if it appears on the screen via Realtime.
  
  const { data: msg, error } = await admin
    .from('messages')
    .insert({
      workspace_id: workspaceId,
      conversation_id: conversation.id,
      content: messageText,
      direction: 'out',
      status: 'sent',
      type: 'text'
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to insert message:', error.message);
  } else {
    console.log('✅ Message inserted successfully!');
    console.log('   ID:', msg.id);
    console.log('   Content:', msg.content);
    console.log('👉 Please check https://rokawhats2.onrender.com/inbox to see if it appears instantly.');
  }
}

sendTestMessage();
