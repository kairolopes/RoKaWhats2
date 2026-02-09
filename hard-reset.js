const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
const env = {};
const lines = fs.readFileSync(envPath, 'utf8').split('\n');
lines.forEach(line => {
    const p = line.indexOf('=');
    if (p > 0) env[line.substring(0, p).trim()] = line.substring(p + 1).trim();
});

async function hardReset() {
    const scenarioId = 4547638;
    const headers = {
        'Authorization': 'Token ' + env.MAKE_API_TOKEN_BACKUP,
        'Content-Type': 'application/json'
    };

    console.log('Stopping scenario...');
    const stopRes = await fetch(`https://us1.make.com/api/v2/scenarios/${scenarioId}/stop`, {
        method: 'POST',
        headers: headers
    });
    console.log('Stop response:', stopRes.status);

    console.log('Fetching blueprint...');
    const res = await fetch(`https://us1.make.com/api/v2/scenarios/${scenarioId}/blueprint`, { headers });
    const data = await res.json();
    
    if (!data.response || !data.response.blueprint) {
        console.error('Invalid blueprint data', data);
        return;
    }

    const flow = data.response.blueprint.flow;
    const httpModule = flow.find(m => m.id === 3);
    
    if (httpModule) {
        // Reset to ABSOLUTE BASICS but with ALL required fields
        httpModule.mapper = {
            "url": "https://api.z-api.io/instances/3EDCE29A3EB0A1453F66FAF4F663B13A/token/Ff94d05bcd8b546afb957fc52d8e33ebaS/send-text",
            "method": "post",
            "headers": [
                { "key": "Content-Type", "value": "application/json" },
                { "key": "Client-Token", "value": "Ff94d05bcd8b546afb957fc52d8e33ebaS" }
            ],
            "bodyType": "raw",
            "contentType": "application/json",
            "gzip": true,
            "useMtls": false,
            "data": `{
  "phone": "{{1.to.phone}}",
  "message": "{{1.message.text}}",
  "delayMessage": 1
}`,
            "serializeUrl": false,
            "shareCookies": false,
            "parseResponse": true,
            "followRedirect": true,
            "useQuerystring": false,
            "followAllRedirects": false,
            "rejectUnauthorized": true
        };
        // Ensure parameters are present
        httpModule.parameters = {
            "handleErrors": true,
            "useNewZLibDeCompress": true
        };
    }

    console.log('Updating blueprint...');
    const updateRes = await fetch(`https://us1.make.com/api/v2/scenarios/${scenarioId}?confirmed=true`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ blueprint: JSON.stringify(data.response.blueprint) })
    });

    if (updateRes.ok) {
        console.log('Scenario updated successfully!');
        
        console.log('Starting scenario...');
        const startRes = await fetch(`https://us1.make.com/api/v2/scenarios/${scenarioId}/start`, {
            method: 'POST',
            headers: headers
        });
        
        if (startRes.ok) {
            console.log('Scenario started successfully!');
        } else {
            const text = await startRes.text();
            console.log('Failed to start:', startRes.status, text);
        }

    } else {
        const text = await updateRes.text();
        console.error('Failed to update scenario:', updateRes.status, text);
    }
}

hardReset();
