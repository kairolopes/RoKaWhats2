
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
const env = {};
const lines = fs.readFileSync(envPath, 'utf8').split('\n');
lines.forEach(line => {
    const p = line.indexOf('=');
    if (p > 0) env[line.substring(0, p).trim()] = line.substring(p + 1).trim();
});

async function updateScenario() {
    console.log('Fetching blueprint...');
    const res = await fetch('https://us1.make.com/api/v2/scenarios/4547638/blueprint', {
        headers: { 'Authorization': 'Token ' + env.MAKE_API_TOKEN_BACKUP }
    });
    const data = await res.json();
    
    if (!data.response || !data.response.blueprint) {
        console.error('Invalid blueprint data', data);
        return;
    }

    const flow = data.response.blueprint.flow;
    
    // --- Fix Module 3 (HTTP) ---
    const httpModule = flow.find(m => m.id === 3);
    if (httpModule) {
        httpModule.mapper = {
            "url": "https://api.z-api.io/instances/3EDCE29A3EB0A1453F66FAF4F663B13A/token/Ff94d05bcd8b546afb957fc52d8e33ebaS/send-text",
            "method": "post",
            "headers": [
                {
                    "key": "Content-Type",
                    "value": "application/json"
                },
                {
                    "key": "Client-Token",
                    "value": "Ff94d05bcd8b546afb957fc52d8e33ebaS"
                }
            ],
            "bodyType": "raw",
            "contentType": "application/json",
            "data": "{\n  \"phone\": \"{{1.to.phone}}\",\n  \"message\": \"Test simple payload\"\n}"
        };
    } else {
        console.error('Module 3 not found');
    }

    // --- Fix Module 5 (Webhook Response) ---
    const responseModule = flow.find(m => m.id === 5);
    if (responseModule) {
        // Ensure status is a Number
        responseModule.mapper.status = 200;
        
        // Ensure headers are correct structure (if needed)
        // responseModule.mapper.headers is array of {key, value} - this is usually fine as is.
    } else {
        console.error('Module 5 not found');
    }

    console.log('Updating blueprint...');
    const updateRes = await fetch('https://us1.make.com/api/v2/scenarios/4547638?confirmed=true', {
        method: 'PATCH',
        headers: {
            'Authorization': 'Token ' + env.MAKE_API_TOKEN_BACKUP,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ blueprint: JSON.stringify(data.response.blueprint) })
    });

    if (updateRes.ok) {
        console.log('Scenario updated successfully!');
    } else {
        const text = await updateRes.text();
        console.error('Failed to update scenario:', updateRes.status, text);
    }
}

updateScenario();
