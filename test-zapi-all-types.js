const fs = require('fs');
// const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

// const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendTestMessage(type, payload, description) {
    console.log(`\n--- Testing ${description} (${type}) ---`);
    const workspaceId = '6228cbce-c983-43c1-b2e8-f2dd647dc0ff';
    const phone = '5562985635204'; // Use consistent test phone
    const externalMessageId = `test-${type}-${Date.now()}`;

    // 1. Construct Payload for Make
    // Note: The app sends { to: {phone}, message: {...}, externalMessageId }
    // We match the Universal Mapper expectations
    
    const makePayload = {
        to: { phone },
        message: {
            type,
            ...payload
        },
        externalMessageId
    };

    console.log('Payload:', JSON.stringify(makePayload, null, 2));

    // 2. Forward to Make
    const url = env.MAKE_OUTBOX_WEBHOOK_URL;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(makePayload)
        });

        console.log(`Make Response: ${res.status}`);
        const text = await res.text();
        console.log('Body:', text);
        
        if (res.status === 200) {
            console.log('✅ Success');
        } else {
            console.log('❌ Failed');
        }
    } catch (e) {
        console.error('Error sending to Make:', e);
    }
    
    // Minimal delay between tests
    await delay(2000);
}

async function runTests() {
    // 1. Text
    await sendTestMessage('text', { text: "Teste Universal Z-API: Texto" }, "Simple Text");

    // 2. Image
    await sendTestMessage('image', { 
        image: "https://via.placeholder.com/150.png", 
        caption: "Teste Universal Z-API: Imagem" 
    }, "Image with Caption");

    // 3. Link
    await sendTestMessage('link', {
        linkUrl: "https://z-api.io",
        title: "Z-API Docs",
        linkDescription: "Documentação Oficial",
        image: "https://via.placeholder.com/150.png"
    }, "Link Preview");

    // 4. Location
    await sendTestMessage('location', {
        latitude: -16.686891,
        longitude: -49.264794,
        title: "Praça Cívica",
        address: "Goiânia, GO"
    }, "Location");

    // 5. Contact
    await sendTestMessage('contact', {
        contactName: "Suporte Z-API",
        contactPhone: "5511999999999"
    }, "Contact Card");
    
    // 6. Sticker (Requires a valid webp url, using placeholder might fail validation but tests the mapping)
    // Using a known sticker URL if possible, or skip to avoid strict validation errors from Z-API
    // await sendTestMessage('sticker', { sticker: "https://raw.githubusercontent.com/WhatsApp/stickers/master/Android/WAStickersThirdParty/app/src/main/assets/1/01_Cuppy_smile.webp" }, "Sticker");
}

runTests();
