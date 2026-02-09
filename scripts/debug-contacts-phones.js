
const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config({ path: '.env.local' });

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkContacts() {
  console.log("🔍 Checking Contacts & Phones...\n");

  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('id, name, phone, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("❌ Error fetching contacts:", error);
    return;
  }

  console.table(contacts.map(c => ({
    Name: c.name,
    Phone: c.phone,
    ID: c.id
  })));

  // Check for potential conflicts (normalized)
  const normalizedMap = {};
  contacts.forEach(c => {
    const clean = c.phone.replace(/\D/g, '');
    let key = clean;
    // Simple normalization check logic similar to backend
    if (clean.startsWith('55') && clean.length > 11) {
        const base = clean.substring(2);
        const number = base.length === 9 && base.startsWith('9') ? base.substring(1) : base;
        key = `55${base.substring(0, 2)}${number}`; // Normalized key (no 9th digit)
    }
    
    if (!normalizedMap[key]) normalizedMap[key] = [];
    normalizedMap[key].push(c.name);
  });

  console.log("\n🔍 Potential Conflicts (Shared Normalized Phone):");
  Object.keys(normalizedMap).forEach(key => {
    if (normalizedMap[key].length > 1) {
      console.log(`⚠️  Phone ${key} is shared by: ${normalizedMap[key].join(', ')}`);
    }
  });
}

checkContacts();
