
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConstraints() {
  const { data, error } = await supabase.rpc('get_check_constraints', { table_name: 'messages' });
  
  if (error) {
      // If RPC fails (likely doesn't exist), try raw SQL via a different method if possible, 
      // or just try to infer by inserting valid values.
      // Since we can't run arbitrary SQL via client usually, we might have to guess.
      console.error('RPC failed:', error);
      
      // Let's try to query postgres tables directly if we have permission (Service Role usually can't execute raw SQL via client unless RPC is set up)
      // But we can guess.
  }
}

// Since I can't easily query constraints without SQL editor, I will try to insert with 'delivered' status to see if it works.
async function testStatus() {
    const params = {
        workspaceId: "6228cbce-c983-43c1-b2e8-f2dd647dc0ff",
        phone: "556285635204",
        text: "test status",
        direction: 'in',
        externalMessageId: "DEBUG_STATUS_" + Date.now()
    };

    const statuses = ['received', 'delivered', 'sent', 'read', 'queued'];
    
    for (const s of statuses) {
        console.log(`Testing status: ${s}`);
        const { error } = await supabase.from('messages').insert({
             workspace_id: params.workspaceId,
             // We need a conversation ID. I'll pick an existing one if I can, or let it fail foreign key? 
             // No, must be valid.
             conversation_id: "88c91b67-ce92-4448-b341-4256d86107c9", // From previous log
             content: params.text,
             direction: params.direction,
             type: 'text',
             status: s,
             external_message_id: params.externalMessageId + "_" + s
        });
        
        if (error) {
            console.log(`  FAILED: ${error.message}`);
        } else {
            console.log(`  SUCCESS!`);
        }
    }
}

testStatus();
