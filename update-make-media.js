
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
    const httpModule = flow.find(m => m.id === 3);

    if (!httpModule) {
        console.error('Module 3 not found');
        return;
    }

    // Dynamic URL
    // We assume 1.message.type is 'text', 'image', 'audio', 'video', 'document'
    // Z-API endpoints are /send-text, /send-image, etc.
    httpModule.mapper.url = "https://api.z-api.io/instances/3EDCE29A3EB0A1453F66FAF4F663B13A/token/Ff94d05bcd8b546afb957fc52d8e33ebaS/send-{{1.message.type}}";

    // Dynamic Body
    // We use nested if statements to output the correct JSON keys.
    // Note: We use single quotes in JS to wrap the string, and escaped double quotes for JSON.
    // Make syntax: "key": "value"
    
    // Logic:
    // phone is always present.
    // if type=text -> "message": "text"
    // if type=image -> "image": "url", "caption": "cap"
    // if type=audio -> "audio": "url"
    // if type=video -> "video": "url", "caption": "cap"
    // if type=document -> "document": "url", "fileName": "name", "caption": "cap"
    
    const dynamicBody = `{
  "phone": "{{1.to.phone}}",
  "delayMessage": 1,
  {{if(1.message.type = "text"; "\\\"message\\\": \\\"" + 1.message.text + "\\\""; 
    if(1.message.type = "image"; "\\\"image\\\": \\\"" + 1.message.image + "\\\", \\\"caption\\\": \\\"" + 1.message.caption + "\\\""; 
    if(1.message.type = "audio"; "\\\"audio\\\": \\\"" + 1.message.audio + "\\\""; 
    if(1.message.type = "video"; "\\\"video\\\": \\\"" + 1.message.video + "\\\", \\\"caption\\\": \\\"" + 1.message.caption + "\\\""; 
    if(1.message.type = "document"; "\\\"document\\\": \\\"" + 1.message.document + "\\\", \\\"fileName\\\": \\\"" + 1.message.fileName + "\\\", \\\"caption\\\": \\\"" + 1.message.caption + "\\\""; 
    "\\\"message\\\": \\\"Unsupported type: " + 1.message.type + "\\\""
    )))))}}
}`;

    httpModule.mapper.data = dynamicBody;

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
