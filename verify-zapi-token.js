// const fetch = require('node-fetch');

const instanceId = '3EDCE29A3EB0A1453F66FAF4F663B13A';
const urlToken = 'CC91F1EC21501AFE9182A3BC'; // New Token in URL
const headerToken = 'Ff94d05bcd8b546afb957fc52d8e33ebaS'; // Old Token in Header
const phone = '5562985635204';

async function verifyToken() {
    const url = `https://api.z-api.io/instances/${instanceId}/token/${urlToken}/send-text`;
    
    console.log('Testing URL:', url);
    console.log('Testing Header Client-Token:', headerToken);
    
    const payload = {
        phone: phone,
        message: "Teste de verificação de Token Z-API (Híbrido)"
    };
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Client-Token': headerToken
            },
            body: JSON.stringify(payload)
        });
        
        console.log('Status:', res.status);
        console.log('Body:', await res.text());
        
    } catch (e) {
        console.error('Error:', e);
    }
}

verifyToken();
