
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8"; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function persistMessage(s, params) {
  console.log("Starting persistMessage...");
  console.log("Params:", JSON.stringify(params, null, 2));

  // 1. Get or Create Contact
  let contactId = null;
  
  // Normalize phone check (Handle Brazil 9th digit)
  const cleanPhone = params.phone.replace(/\D/g, '');
  let possiblePhones = [params.phone];
  
  if (cleanPhone.startsWith('55') && (cleanPhone.length === 12 || cleanPhone.length === 13)) {
      const base = cleanPhone.substring(2);
      const ddd = base.substring(0, 2);
      const number = base.substring(2);
      
      if (number.length === 8) {
          possiblePhones.push(`55${ddd}9${number}`);
      } else if (number.length === 9 && number.startsWith('9')) {
          possiblePhones.push(`55${ddd}${number.substring(1)}`);
      }
  }
  console.log("Possible phones:", possiblePhones);

  const { data: contacts, error: contactError } = await s
    .from('contacts')
    .select('id, name, profile_pic_url, phone')
    .eq('workspace_id', params.workspaceId)
    .in('phone', possiblePhones)
    .limit(1);

  if (contactError) console.error("Contact Error:", contactError);
  console.log("Found contacts:", contacts);

  const contact = contacts && contacts.length > 0 ? contacts[0] : null;

  if (contact) {
    console.log("Using existing contact:", contact.id);
    contactId = contact.id;
    // Update logic skipped for brevity, but let's see if it crashes
  } else {
    console.log("Creating new contact...");
    const { data: newContact, error: createContactErr } = await s
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
      console.error("Create Contact Error:", createContactErr);
      return { error: `contact_create_failed: ${createContactErr.message}` };
    }
    contactId = newContact.id;
    console.log("Created contact:", contactId);
  }

  // 2. Get or Create Conversation
  let conversationId = null;
  const { data: conv, error: convError } = await s
    .from('conversations')
    .select('id')
    .eq('workspace_id', params.workspaceId)
    .eq('contact_id', contactId)
    .single();

  if (convError && convError.code !== 'PGRST116') console.error("Get Conv Error:", convError); // PGRST116 is no rows
  
  if (conv) {
    console.log("Using existing conversation:", conv.id);
    conversationId = conv.id;
    await s.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
  } else {
    console.log("Creating new conversation...");
    const { data: newConv, error: createConvErr } = await s
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
      console.error("Create Conv Error:", createConvErr);
      return { error: `conversation_create_failed: ${createConvErr.message}` };
    }
    conversationId = newConv.id;
    console.log("Created conversation:", conversationId);
  }

  // 3. Insert Message
  let finalContent = params.text || '';
  if (params.mediaUrl) {
    finalContent = params.text ? `${params.mediaUrl}\n${params.text}` : params.mediaUrl;
  }

  console.log("Inserting message...");
  const { data: msg, error: msgErr } = await s
    .from('messages')
    .insert({
      workspace_id: params.workspaceId,
      conversation_id: conversationId,
      content: finalContent,
      direction: params.direction,
      type: params.type || 'text',
      status: params.status,
      external_message_id: params.externalMessageId,
    })
    .select('id')
    .single();

  if (msgErr) {
    console.error("Insert Message Error:", msgErr);
    return { error: `message_insert_failed: ${msgErr.message}` };
  }
  console.log("Message persisted:", msg.id);

  return { ok: true, messageId: msg.id, conversationId, contactId };
}

// Run simulation
const payload = {
  "phone": "556285635204",
  "message": {
    "text": "oiiiii",
    "type": "ReceivedCallback",
    "audio": "",
    "image": "",
    "video": "",
    "caption": "",
    "document": ""
  },
  "provider": "z-api",
  "contactName": "Kairo Kairo",
  "workspaceId": "6228cbce-c983-43c1-b2e8-f2dd647dc0ff",
  "contactAvatar": "https://pps.whatsapp.net/v/t61.24694-24/486712173_1348857862900775_1894845626129324066_n.jpg?ccb=11-4&oh=01_Q5Aa3wFDYt6WfAG6eIXyqqXauO-Z-xuix5eMUuWUdznMSLEqDw&oe=69972247&_nc_sid=5e03e0&_nc_cat=105",
  "externalMessageId": "3EB0DD691DE69242B9BE22_TEST_" + Date.now() // Unique ID to avoid dedup
};

// Map to persist params
const persistParams = {
    workspaceId: payload.workspaceId,
    phone: payload.phone,
    contactName: payload.contactName,
    contactAvatar: payload.contactAvatar,
    text: payload.message.text || payload.message.caption || '',
    mediaUrl: payload.message.image || payload.message.audio || payload.message.video || payload.message.document,
    type: 'text', // Simplified for test
    direction: 'in',
    status: 'delivered',
    externalMessageId: payload.externalMessageId
};

persistMessage(supabase, persistParams).then(res => {
    console.log("Result:", res);
});
