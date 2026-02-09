
// const fetch = require('node-fetch'); // Native fetch in Node 18+

async function testSendMedia() {
    const url = 'http://localhost:3000/api/inbox/send';
    
    const body = {
        workspaceId: '6228cbce-c983-43c1-b2e8-f2dd647dc0ff',
        to: {
            phone: '5562985635204'
        },
        message: {
            type: 'image',
            image: 'https://filesampleshub.com/download/image/jpg/sample1.jpg',
            caption: 'Teste de imagem via Trae'
        },
        externalMessageId: 'msg-img-' + Date.now()
    };

    console.log('Sending payload:', JSON.stringify(body, null, 2));

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response:', text);
    } catch (error) {
        console.error('Error:', error);
    }
}

testSendMedia();
