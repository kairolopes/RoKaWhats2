
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

async function run() {
  try {
    console.log(`Fetching blueprint for scenario ${SCENARIO_ID}...`);
    const blueprint = await fetchBlueprint();
    
    const flow = blueprint.flow;
    
    // Find modules by ID
    const module1Index = flow.findIndex(m => m.id === 1);
    const module3Index = flow.findIndex(m => m.id === 3);
    const module5Index = flow.findIndex(m => m.id === 5);
    const module4Index = flow.findIndex(m => m.id === 4);
    
    console.log('Current indexes:', { 1: module1Index, 3: module3Index, 5: module5Index, 4: module4Index });

    if (module3Index === -1 || module5Index === -1) {
      console.error('Modules not found.');
      return;
    }

    // Desired order: 1 -> 5 -> 3 -> 4
    // We construct a new flow array
    const newFlow = [];
    
    // Add Module 1 (Webhook)
    if (module1Index !== -1) newFlow.push(flow[module1Index]);
    
    // Add Module 5 (Z-API Contact)
    newFlow.push(flow[module5Index]);
    
    // Add Module 3 (App Webhook)
    newFlow.push(flow[module3Index]);
    
    // Add Module 4 (Avatar Sync) and others
    if (module4Index !== -1) newFlow.push(flow[module4Index]);
    
    // Add any remaining modules that weren't 1, 3, 5, 4
    flow.forEach(m => {
        if (![1, 3, 5, 4].includes(m.id)) {
            newFlow.push(m);
        }
    });

    // Update coordinates for UI niceness (Linear left-to-right)
    // 1: (0, 0)
    // 5: (300, 0)
    // 3: (600, 0)
    // 4: (900, 0)
    
    const updateCoord = (module, x, y) => {
        if (module && module.metadata && module.metadata.designer) {
            module.metadata.designer.x = x;
            module.metadata.designer.y = y;
        }
    };
    
    // We need to find the objects in the newFlow array now
    const m1 = newFlow.find(m => m.id === 1);
    const m5 = newFlow.find(m => m.id === 5);
    const m3 = newFlow.find(m => m.id === 3);
    const m4 = newFlow.find(m => m.id === 4);
    
    updateCoord(m1, 0, 0);
    updateCoord(m5, 300, 0);
    updateCoord(m3, 600, 0);
    updateCoord(m4, 900, 0);

    blueprint.flow = newFlow;
    
    console.log('Pushing reordered blueprint...');
    await pushBlueprint(blueprint);
    console.log('Done!');

  } catch (e) {
    console.error('Error:', e.message);
  }
}

run();
