const fs = require('fs');
const path = require('path');

const blueprintPath = path.resolve(__dirname, 'scenario_blueprint.json');
const outputPath = path.resolve(__dirname, 'make_inbound_fix.json');

const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));
const flow = blueprint.response.blueprint.flow;

// 1. Find the max ID to avoid collisions
let maxId = 0;
flow.forEach(m => { if (m.id > maxId) maxId = m.id; });
const newId = maxId + 1;

// 2. Create the new Z-API Fetch Module
// We clone Module 3 (HTTP) as a template but change parameters
const zapiModule = {
  "id": newId,
  "module": "http:ActionSendData",
  "version": 3,
  "metadata": {
    "designer": {
      "x": 650, // Position between Module 3 (437) and Module 4 (900)
      "y": 0
    },
    "expect": [ /* Standard HTTP expect definitions (omitted for brevity, Make fills this) */ ]
    // ... we can copy metadata from module 3 to be safe
  },
  "mapper": {
    "url": "https://api.z-api.io/instances/3EDCE29A3EB0A1453F66FAF4F663B13A/token/CC91F1EC21501AFE9182A3BC/contacts/{{1.phone}}",
    "method": "get",
    "headers": [
      {
        "name": "Client-Token",
        "value": "Ff94d05bcd8b546afb957fc52d8e33ebaS"
      },
      {
        "name": "content-type",
        "value": "application/json"
      }
    ],
    "serializeUrl": false,
    "parseResponse": true,
    "handleErrors": true,
    // Missing required parameters causing BundleValidationError
    "shareCookies": false,
    "rejectUnauthorized": true,
    "followRedirect": true,
    "useQuerystring": false,
    "gzip": true,
    "useMtls": false,
    "followAllRedirects": false,
    "ca": "",
    "qs": [],
    "timeout": "",
    "authPass": "",
    "authUser": "",
    "bodyType": "raw", // Even though it's GET, these might be required by the module definition
    "contentType": "application/json"
  },
  "parameters": {
    "handleErrors": true,
    "useNewZLibDeCompress": true
  }
};

// Copy full metadata from module 3 to ensure validity, then override designer
zapiModule.metadata = JSON.parse(JSON.stringify(flow.find(m => m.id === 3).metadata));
zapiModule.metadata.designer.x = 650;
zapiModule.metadata.designer.y = 0;

// 3. Add the new module to flow
// IMPORTANT: We must insert it BEFORE the avatar module (Module 4) so it runs first and variables are available.
// Current order assumed: 1 (Webhook) -> 3 (Send Data) -> 4 (Avatar Sync)
// We want: 1 -> 3 -> 5 (Z-API) -> 4
const avatarModuleIndex = flow.findIndex(m => m.module === 'http:ActionSendData' && m.mapper.url.includes('avatar/sync'));

if (avatarModuleIndex !== -1) {
  flow.splice(avatarModuleIndex, 0, zapiModule);
} else {
  // Fallback if not found (shouldn't happen based on previous logic)
  flow.push(zapiModule);
}

// 4. Update Module 4 (Avatar Sync) to use the new module's output
const avatarModule = flow.find(m => m.module === 'http:ActionSendData' && m.mapper.url.includes('avatar/sync'));

if (avatarModule) {
  // Update avatarUrl to use the result from the new Z-API module
  // Accessing property 'imgUrl' from the response body (data)
  // Make syntax: {{5.data.imgUrl}} where 5 is newId
  avatarModule.mapper.avatarUrl = `{{${newId}.data.imgUrl}}`;
  
  // Update X position to be further right to visually indicate flow
  avatarModule.metadata.designer.x = 1100;
}

// 5. Save the new blueprint
fs.writeFileSync(outputPath, JSON.stringify(blueprint, null, 2));
console.log(`Blueprint created with new module ID ${newId}`);
