
const { createClient } = require('@supabase/supabase-js');

// Using keys from check-db.js
const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getWorkspaceInfo() {
  console.log('--- Fetching Workspace Info ---');

  // 1. Check Profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, role, workspace_id')
    .limit(10);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
  } else {
    console.log('\nUsers/Profiles found:');
    if (!profiles || profiles.length === 0) {
        console.log('No profiles found.');
    } else {
        profiles.forEach(p => {
            console.log(`- User: ${p.name || 'No Name'} (ID: ${p.id})`);
            console.log(`  Role: ${p.role}`);
            console.log(`  Workspace ID: ${p.workspace_id}`);
            console.log('  -------------------');
        });
    }
  }

  // 2. Check Messages
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('workspace_id')
    .limit(1)
    .order('created_at', { ascending: false });
    
   if (messagesError) {
       console.error('Error fetching messages:', messagesError);
   } else if (messages && messages.length > 0) {
       console.log(`\nMost recent message used Workspace ID: ${messages[0].workspace_id}`);
   }
}

getWorkspaceInfo();
