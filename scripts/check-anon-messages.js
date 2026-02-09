const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (ANON KEY - simula o frontend)
const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0Nzc5OTUsImV4cCI6MjA4NjA1Mzk5NX0.W8nZf0tpxTAfLb0CELOJs0LYQdOonLJz9SkjMbu_KCg";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAnonMessages() {
  console.log('--- Checking Messages Access (Anon Role) ---');

  // 1. Primeiro pega uma conversa qualquer para ter um ID válido
  const { data: convs, error: convError } = await supabase
    .from('conversations')
    .select('id')
    .limit(1);

  if (convError) {
    console.error('Error fetching conversations (Anon):', convError);
    return;
  }

  if (!convs || convs.length === 0) {
    console.log('No conversations found for Anon user. Cannot test messages.');
    return;
  }

  const conversationId = convs[0].id;
  console.log(`Testing with Conversation ID: ${conversationId}`);

  // 2. Tenta buscar mensagens dessa conversa
  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .limit(5);

  if (msgError) {
    console.error('Error fetching messages (Anon):', msgError);
  } else {
    console.log(`Found ${messages.length} messages for this conversation (Anon).`);
    if (messages.length > 0) {
      console.log('Sample message:', messages[0]);
    }
  }
  
  // 3. Tenta buscar qualquer mensagem globalmente (só para garantir)
  console.log('--- Checking Any Message Global (Anon Role) ---');
  const { data: allMsg, error: allErr } = await supabase
    .from('messages')
    .select('id, content')
    .limit(3);
    
  if (allErr) {
    console.error('Error fetching any messages:', allErr);
  } else {
    console.log(`Global fetch found ${allMsg.length} messages.`);
  }
}

checkAnonMessages();
