
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConversations() {
  console.log('--- Checking Conversations for Conflicting Contacts ---');
  
  const contactIds = ['34b0cd87-2c70-494e-8662-f0a3f1e6ee5a', '243af833-58fe-435c-9831-ae061eb812f8'];
  
  const { data: convs, error } = await supabase
    .from('conversations')
    .select('id, contact_id, last_message_at, contacts(phone, name)')
    .in('contact_id', contactIds);

  if (error) {
    console.error('Error fetching conversations:', error);
    return;
  }

  console.log(`Found ${convs.length} conversations:`);
  convs.forEach(c => {
      console.log(`Conv ID: ${c.id}`);
      console.log(`Contact: ${c.contacts.phone} (${c.contacts.name})`);
      console.log(`Last Msg: ${c.last_message_at}`);
      console.log('---');
  });
}

checkConversations();
