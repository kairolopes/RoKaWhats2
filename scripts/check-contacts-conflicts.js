
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkContacts() {
  console.log('--- Checking Contacts for Conflicts ---');
  
  // Fetch ALL contacts to check for duplicates manually
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('*');

  if (error) {
    console.error('Error fetching contacts:', error);
    return;
  }

  console.log(`Total Contacts: ${contacts.length}`);
  
  // Filter for the problematic number variants
  const targetNumbers = ['5562985635204', '556285635204'];
  
  const conflicts = contacts.filter(c => {
      const clean = c.phone ? c.phone.replace(/\D/g, '') : '';
      const name = c.name ? c.name.toLowerCase() : '';
      return targetNumbers.includes(clean) || name.includes('lorena') || name.includes('kairo');
  });

  console.log('--- ALL CONTACTS ---');
  contacts.forEach(c => {
      console.log(`ID: ${c.id}`);
      console.log(`Name: ${c.name}`);
      console.log(`Phone: ${c.phone}`);
      console.log('---');
  });
}

checkContacts();
