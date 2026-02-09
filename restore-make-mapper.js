
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
    
    const flow = data.response.blueprint.flow;
    const httpModule = flow.find(m => m.id === 3);

    if (!httpModule) {
        console.error('Module 3 not found');
        return;
    }

    // Restore to known working state (but with dynamic URL/Body)
    // We assume 'gzip' and 'useMtls' are NOT required if missing, or defaults apply.
    // However, I will check if I can use the same keys as before.
    
    httpModule.mapper = {
        "url": "https://api.z-api.io/instances/3EDCE29A3EB0A1453F66FAF4F663B13A/token/Ff94d05bcd8b546afb957fc52d8e33ebaS/send-{{1.message.type}}",
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
        // Re-using the dynamic body logic, hoping it wasn't the cause.
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
}`,
        "serializeUrl": false,
        "shareCookies": false,
        "parseResponse": true,
        "followRedirect": true,
        "useQuerystring": false,
        "followAllRedirects": false,
        "rejectUnauthorized": true
    };

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
