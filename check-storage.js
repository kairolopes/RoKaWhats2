
const { createClient } = require('@supabase/supabase-js');

// Load keys from known context
const SUPABASE_URL = 'https://pplduhvmiefrsnrslfwt.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const WORKSPACE_ID = '6228cbce-c983-43c1-b2e8-f2dd647dc0ff';
const PHONE = '556298590494';
const PATH = `avatars/${WORKSPACE_ID}/contacts/${PHONE}.jpg`;

async function checkStorage() {
  console.log(`Checking storage for: ${PATH}`);
  
  const { data, error } = await supabase
    .storage
    .from('avatars')
    .list(`avatars/${WORKSPACE_ID}/contacts`);

  if (error) {
    console.error('Error listing files:', error);
    return;
  }

  const found = data.find(f => f.name === `${PHONE}.jpg`);
  
  if (found) {
    console.log('✅ SUCCESS: File found!');
    console.log('File details:', found);
    
    // Get public URL
    const { data: publicUrl } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(PATH);
      
    console.log('Public URL:', publicUrl.publicUrl);
  } else {
    console.log('❌ FAIL: File not found.');
    console.log('Files in directory:', data.map(f => f.name));
  }
}

checkStorage();
