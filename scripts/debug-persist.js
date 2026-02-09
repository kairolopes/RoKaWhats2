
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://pplduhvmiefrsnrslfwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwbGR1aHZtaWVmcnNucnNsZnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ3Nzk5NSwiZXhwIjoyMDg2MDUzOTk1fQ.n31ZY_ipbbT3O6G-Pi5G3oQAEeM-mI4EPJtmxMDyDs8";

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugPersist() {
  const params = {
    workspaceId: "6228cbce-c983-43c1-b2e8-f2dd647dc0ff",
    phone: "556285635204",
    contactName: "Kairo Kairo",
    contactAvatar: "https://pps.whatsapp.net/v/t61.24694-24/486712173_1348857862900775_1894845626129324066_n.jpg?ccb=11-4&oh=01_Q5Aa3wGlZCPShn9IVkcgaRhK8ImnawSiT44ztMpG3sNwA-FZ8A&oe=6996B1C7&_nc_sid=5e03e0&_nc_cat=105",
    text: "oiii",
    direction: 'in',
    status: 'received',
    type: "ReceivedCallback",
    externalMessageId: "3EB0140792346F9AF40C3F_DEBUG_" + Date.now() // Unique ID
  };

  console.log('Starting persist debug...');

  // 1. Get or Create Contact
  let contactId = null;
  const { data: contact, error: fetchContactErr } = await supabase
    .from('contacts')
    .select('id, name, profile_pic_url')
    .eq('workspace_id', params.workspaceId)
    .eq('phone', params.phone)
    .single();

  if (fetchContactErr && fetchContactErr.code !== 'PGRST116') {
      console.error('Fetch Contact Error:', fetchContactErr);
  }

  if (contact) {
    console.log('Contact found:', contact.id);
    contactId = contact.id;
  } else {
    console.log('Creating contact...');
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
      console.error('Contact create failed:', createContactErr);
      return;
    }
    contactId = newContact.id;
    console.log('Contact created:', contactId);
  }

  // 2. Get or Create Conversation
  let conversationId = null;
  const { data: conv, error: fetchConvErr } = await supabase
    .from('conversations')
    .select('id')
    .eq('workspace_id', params.workspaceId)
    .eq('contact_id', contactId)
    .single();

  if (fetchConvErr && fetchConvErr.code !== 'PGRST116') {
      console.error('Fetch Conv Error:', fetchConvErr);
  }

  if (conv) {
    console.log('Conversation found:', conv.id);
    conversationId = conv.id;
  } else {
    console.log('Creating conversation...');
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
      console.error('Conversation create failed:', createConvErr);
      return;
    }
    conversationId = newConv.id;
    console.log('Conversation created:', conversationId);
  }

  // 3. Insert Message
  console.log('Inserting message...');
  console.log('Type:', params.type);
  const { data: msg, error: msgErr } = await supabase
    .from('messages')
    .insert({
      workspace_id: params.workspaceId,
      conversation_id: conversationId,
      content: params.text,
      direction: params.direction,
      type: params.type || 'text',
      status: params.status,
      external_message_id: params.externalMessageId,
    })
    .select('id')
    .single();

  if (msgErr) {
    console.error('Message insert failed:', msgErr);
  } else {
    console.log('Message inserted successfully:', msg.id);
  }
}

debugPersist();
