const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env
const envPath = path.resolve(__dirname, '.env');
let env = {};
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const firstEq = line.indexOf('=');
    if (firstEq > -1) {
      const key = line.substring(0, firstEq).trim();
      const val = line.substring(firstEq + 1).trim();
      env[key] = val;
    }
  });
} catch (e) { console.error(e); process.exit(1); }

const MAKE_API_TOKEN = env.MAKE_API_TOKEN;
const SCENARIO_ID = 4547848; // INBOUND_MESSAGE_ZAPI_TO_APP
const BLUEPRINT_PATH = path.resolve(__dirname, 'make_inbound_fix.json');

const fullJson = JSON.parse(fs.readFileSync(BLUEPRINT_PATH, 'utf8'));
// Extract the blueprint object and STRINGIFY it because API expects a string
const blueprint = JSON.stringify(fullJson.response.blueprint);

const payload = JSON.stringify({
  blueprint: blueprint
});

console.log(`Updating scenario ${SCENARIO_ID} with new blueprint (Size: ${payload.length} bytes)...`);

const options = {
  hostname: 'us1.make.com',
  path: `/api/v2/scenarios/${SCENARIO_ID}?confirm=true`, // confirm=true to overwrite even if locked/active
  method: 'PATCH', // Make API v2 usually uses PATCH for updates
  headers: {
    'Authorization': `Token ${MAKE_API_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(payload);
req.end();
