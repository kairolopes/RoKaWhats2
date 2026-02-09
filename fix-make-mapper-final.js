const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
const env = {};
const lines = fs.readFileSync(envPath, 'utf8').split('\n');
lines.forEach(line => {
    const p = line.indexOf('=');
    if (p > 0) env[line.substring(0, p).trim()] = line.substring(p + 1).trim();
});

async function update() {
    console.log('Fetching blueprint...');
    const res = await fetch('https://us1.make.com/api/v2/scenarios/4547638/blueprint', {
        headers: { 'Authorization': 'Token ' + env.MAKE_API_TOKEN_BACKUP }
    });
    const data = await res.json();
    
    const flow = data.response.blueprint.flow;
    const httpModule = flow.find(m => m.id === 3);
    
    if (httpModule) {
        httpModule.mapper = {
            "url": "https://api.z-api.io/instances/3EDCE29A3EB0A1453F66FAF4F663B13A/token/Ff94d05bcd8b546afb957fc52d8e33ebaS/send-{{1.message.type}}",
            "method": "post",
            "headers": [
                { "key": "Content-Type", "value": "application/json" },
                { "key": "Client-Token", "value": "Ff94d05bcd8b546afb957fc52d8e33ebaS" }
            ],
            "bodyType": "raw",
            // Set contentType to text/plain to avoid Make's JSON validation on the template string
            "contentType": "text/plain", 
            "data": `{
  "phone": "{{1.to.phone}}",
  "delayMessage": 1,
  {{if(1.message.type = "text"; "\\\"message\\\": \\\"" + 1.message.text + "\\\""; 
    if(1.message.type = "image"; "\\\"image\\\": \\\"" + 1.message.image + "\\\", \\\"caption\\\": \\\"" + 1.message.caption + "\\\""; 
    if(1.message.type = "audio"; "\\\"audio\\\": \\\"" + 1.message.audio + "\\\""; 
    if(1.message.type = "video"; "\\\"video\\\": \\\"" + 1.message.video + "\\\", \\\"caption\\\": \\\"" + 1.message.caption + "\\\""; 
    if(1.message.type = "document"; "\\\"document\\\": \\\"" + 1.message.document + "\\\", \\\"fileName\\\": \\\"" + 1.message.fileName + "\\\", \\\"caption\\\": \\\"" + 1.message.caption + "\\\""; 
    "\\\"message\\\": \\\"Unsupported type: " + 1.message.type + "\\\""
    )))))}}
}`
        };
        // Remove extra parameters to be safe
        delete httpModule.parameters;
    }

    // Also fix Module 5 (Webhook Response) just in case
    const responseModule = flow.find(m => m.id === 5);
    if (responseModule) {
        responseModule.mapper.status = 200;
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
        
        // Try to activate (or ensure it stays active)
        const activateRes = await fetch('https://us1.make.com/api/v2/scenarios/4547638/start', {
             method: 'POST',
             headers: { 'Authorization': 'Token ' + env.MAKE_API_TOKEN_BACKUP }
        });
        if (activateRes.ok) console.log('Scenario activated!');
        else {
             const text = await activateRes.text();
             console.log('Activation response:', text); // Might be "Already running"
        }

    } else {
        const text = await updateRes.text();
        console.error('Failed to update scenario:', updateRes.status, text);
    }
}

update();
