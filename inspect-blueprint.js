
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

async function run() {
  try {
    console.log(`Fetching blueprint for scenario ${SCENARIO_ID}...`);
    const blueprint = await fetchBlueprint();
    
    fs.writeFileSync('current_blueprint.json', JSON.stringify(blueprint, null, 2));
    console.log('Blueprint saved to current_blueprint.json');
    
  } catch (e) {
    console.error('Error:', e.message);
  }
}

run();
