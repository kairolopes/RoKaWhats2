
const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config({ path: '.env.local' });

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

const supabase = createClient(supabaseUrl, supabaseKey);

async function persistMessageDebug() {
  const params = {
    workspaceId: "6228cbce-c983-43c1-b2e8-f2dd647dc0ff",
    phone: "556285635204",
    contactName: "Kairo Kairo",
    contactAvatar: "https://pps.whatsapp.net/v/t61.24694-24/486712173_1348857862900775_1894845626129324066_n.jpg?ccb=11-4&oh=01_Q5Aa3wFDYt6WfAG6eIXyqqXauO-Z-xuix5eMUuWUdznMSLEqDw&oe=69972247&_nc_sid=5e03e0&_nc_cat=105",
    text: "Barquinho no rio",
    mediaUrl: "",
    type: "text",
    direction: "in",
    status: "delivered",
    externalMessageId: "AC2610518B5A17A7350C55450395BE45"
  };

  console.log("🛠️ Starting Persist Debug with params:", params);

  // 1. Get or Create Contact
  // Normalize phone check (Handle Brazil 9th digit)
  const cleanPhone = params.phone.replace(/\D/g, '')
  let possiblePhones = [params.phone]
  
  if (cleanPhone.startsWith('55') && (cleanPhone.length === 12 || cleanPhone.length === 13)) {
      const base = cleanPhone.substring(2)
      const ddd = base.substring(0, 2)
      const number = base.substring(2)
      
      if (number.length === 8) {
          possiblePhones.push(`55${ddd}9${number}`)
      } else if (number.length === 9 && number.startsWith('9')) {
          possiblePhones.push(`55${ddd}${number.substring(1)}`)
      }
  }

  console.log("📞 Possible Phones:", possiblePhones);

  const { data: contacts, error: contactErr } = await supabase
    .from('contacts')
    .select('id, name, profile_pic_url, phone')
    .eq('workspace_id', params.workspaceId)
    .in('phone', possiblePhones)
    .limit(1);

  if (contactErr) console.error("❌ Error fetching contacts:", contactErr);
  console.log("👤 Contacts Found:", contacts);

  let contactId = null;
  if (contacts && contacts.length > 0) {
      contactId = contacts[0].id;
      console.log("✅ Using Existing Contact:", contactId);
  } else {
      console.log("🆕 Creating New Contact...");
      const { data: newContact, error: createContactErr } = await supabase
        .from('contacts')
        .insert({
          workspace_id: params.workspaceId,
          phone: params.phone,
          name: params.contactName || params.phone,
          profile_pic_url: params.contactAvatar || null,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (createContactErr) {
          console.error("❌ Error creating contact:", createContactErr);
          return;
      }
      contactId = newContact.id;
      console.log("✅ New Contact Created:", contactId);
  }

  // 2. Get or Create Conversation
  console.log("💬 Finding Conversation for Contact:", contactId);
  const { data: conv, error: convErr } = await supabase
    .from('conversations')
    .select('id')
    .eq('workspace_id', params.workspaceId)
    .eq('contact_id', contactId)
    .single();

  if (convErr && convErr.code !== 'PGRST116') console.error("❌ Error fetching conversation:", convErr);
  console.log("📂 Conversation Found:", conv);

  let conversationId = null;
  if (conv) {
      conversationId = conv.id;
      // Update last_message_at
      const { error: updateErr } = await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
      if (updateErr) console.error("❌ Error updating conversation:", updateErr);
  } else {
      console.log("🆕 Creating New Conversation...");
      const { data: newConv, error: createConvErr } = await supabase
        .from('conversations')
        .insert({
          workspace_id: params.workspaceId,
          contact_id: contactId,
          status: 'open',
          created_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (createConvErr) {
          console.error("❌ Error creating conversation:", createConvErr);
          return;
      }
      conversationId = newConv.id;
      console.log("✅ New Conversation Created:", conversationId);
  }

  // 3. Insert Message
  console.log("📝 Inserting Message into Conversation:", conversationId);
  const insertData = {
      workspace_id: params.workspaceId,
      conversation_id: conversationId,
      content: params.text,
      direction: params.direction,
      type: params.type || 'text',
      status: params.status,
      external_message_id: params.externalMessageId,
  };
  console.log("Message Data:", insertData);

  const { data: msg, error: msgErr } = await supabase
    .from('messages')
    .insert(insertData)
    .select('id')
    .single();

  if (msgErr) console.error("❌ Error inserting message:", msgErr);
  else console.log("✅ Message Inserted Successfully:", msg);
}

persistMessageDebug();
