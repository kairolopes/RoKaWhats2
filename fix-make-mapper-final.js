
const fs = require('fs');
const https = require('https');

// Load .env
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (e) {}

const SCENARIO_ID = 4547848;
const API_TOKEN = process.env.MAKE_API_TOKEN;
const HOSTNAME = 'us1.make.com';

if (!API_TOKEN) {
  console.error('Missing MAKE_API_TOKEN');
  process.exit(1);
}

async function run() {
  try {
    // 1. Fetch current blueprint
    console.log(`Fetching blueprint for scenario ${SCENARIO_ID}...`);
    const blueprint = await fetchBlueprint();
    
    // 2. Modify blueprint
    console.log('Modifying blueprint...');
    let modified = false;
    
    // Find the Z-API Get Contact module (ID 5 based on previous logs, but let's find by URL)
    const getContactModule = blueprint.flow.find(m => 
      m.module === 'http:ActionSendData' && 
      m.mapper && 
      m.mapper.url && 
      m.mapper.url.includes('/contacts/')
    );
    
    if (!getContactModule) {
      console.error('Could not find Z-API Get Contact module.');
      return;
    }
    const contactModuleId = getContactModule.id;
    console.log(`Found Get Contact module with ID: ${contactModuleId}`);

    // Find the App Webhook module (ID 3 based on logs, find by URL)
    const appWebhookModule = blueprint.flow.find(m => 
      m.module === 'http:ActionSendData' && 
      m.mapper && 
      m.mapper.url === 'https://rokawhats.onrender.com/api/inbox/webhook'
    );

    if (!appWebhookModule) {
      console.error('Could not find App Webhook module.');
      return;
    }
    console.log(`Found App Webhook module with ID: ${appWebhookModule.id}`);

    // Update data payload
    // We construct the JSON string with placeholders
    const newPayload = {
      workspaceId: "6228cbce-c983-43c1-b2e8-f2dd647dc0ff",
      externalMessageId: "{{1.messageId}}",
      phone: "{{1.phone}}",
      contactName: `{{${contactModuleId}.data.name}}`,
      contactAvatar: `{{${contactModuleId}.data.imgUrl}}`,
      provider: "z-api",
      message: {
        type: "{{1.type}}",
        text: "{{1.text.message}}",
        caption: "{{1.caption}}",
        image: "{{1.image.imageUrl}}",
        audio: "{{1.audio.audioUrl}}",
        video: "{{1.video.videoUrl}}",
        document: "{{1.document.documentUrl}}"
      }
    };
    
    appWebhookModule.mapper.data = JSON.stringify(newPayload, null, 2);
    
    // Also ensure headers are correct
    const secret = process.env.MAKE_WEBHOOK_SECRET || 'f3d6c8b55b820c1b2a0d5ee8f4e7a3d9859b6cfa1e2345b7c9d0ab12cd34ef56';
    appWebhookModule.mapper.headers = [
       { name: "content-type", value: "application/json" },
       { name: "x-make-secret", value: secret }
    ];
    
    console.log('Payload updated successfully.');

    // 3. Push updated blueprint
    console.log('Pushing updated blueprint...');
    await pushBlueprint(blueprint);
    console.log('Done!');

  } catch (e) {
    console.error('Error:', e.message);
  }
}

function fetchBlueprint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOSTNAME,
      path: `/api/v2/scenarios/${SCENARIO_ID}/blueprint`,
      method: 'GET',
      headers: { 'Authorization': `Token ${API_TOKEN}` }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data).response.blueprint);
        } else {
          reject(new Error(`Fetch failed: ${res.statusCode} ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function pushBlueprint(blueprint) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ blueprint: JSON.stringify(blueprint) });
    const options = {
      hostname: HOSTNAME,
      path: `/api/v2/scenarios/${SCENARIO_ID}?confirm=true`,
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${API_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`Push failed: ${res.statusCode} ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

run();
