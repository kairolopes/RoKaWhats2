
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixContacts() {
  console.log('--- Fixing Contacts ---');
  
  // 1. Delete the unused 8-digit contact
  const unusedContactId = '243af833-58fe-435c-9831-ae061eb812f8';
  console.log(`Deleting unused contact: ${unusedContactId}`);
  const { error: deleteErr } = await supabase
    .from('contacts')
    .delete()
    .eq('id', unusedContactId);
    
  if (deleteErr) console.error('Error deleting:', deleteErr);
  else console.log('Deleted successfully.');

  // 2. Rename the active contact to clear confusion
  const activeContactId = '34b0cd87-2c70-494e-8662-f0a3f1e6ee5a';
  console.log(`Renaming active contact: ${activeContactId}`);
  const { error: updateErr } = await supabase
    .from('contacts')
    .update({ name: 'Kairo (Meu Número)' })
    .eq('id', activeContactId);

  if (updateErr) console.error('Error updating:', updateErr);
  else console.log('Updated name successfully.');
}

fixContacts();
