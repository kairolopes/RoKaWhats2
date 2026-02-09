
const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config({ path: '.env.local' });

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupContacts() {
  console.log("🧹 Cleaning up conflicting contacts...");

  // IDs to delete based on previous check
  const idsToDelete = [
    'c2ba1f16-d143-479d-997c-aefe0df8f5f1', // Lorena Teste (5562985635204)
    'b294e70c-5a77-42b4-b6b1-a66a13be1003'  // null (556285635204)
  ];

  // First, delete conversations associated with these contacts
  const { error: convError } = await supabase
    .from('conversations')
    .delete()
    .in('contact_id', idsToDelete);

  if (convError) {
    console.error("❌ Error deleting conversations:", convError);
  } else {
    console.log("✅ Deleted associated conversations.");
  }

  // Then delete the contacts
  const { error: contactError } = await supabase
    .from('contacts')
    .delete()
    .in('id', idsToDelete);

  if (contactError) {
    console.error("❌ Error deleting contacts:", contactError);
  } else {
    console.log("✅ Deleted conflicting contacts 'Lorena Teste' and duplicated null contact.");
  }
}

cleanupContacts();
