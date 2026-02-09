const fs = require('fs');
const path = require('path');

// Manual .env parser
const envPath = path.resolve(__dirname, '.env');
const envConfig = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        acc[key] = value;
    }
    return acc;
}, {});

const SCENARIO_ID = 4547638;
const API_TOKEN = envConfig.MAKE_API_TOKEN_BACKUP || envConfig.MAKE_API_TOKEN;
const BASE_URL = 'https://us1.make.com/api/v2';

if (!API_TOKEN) {
    console.error('Error: MAKE_API_TOKEN not found in .env');
    process.exit(1);
}

async function getBlueprint() {
  console.log(`Fetching blueprint for ${SCENARIO_ID}...`);
  try {
    const res = await fetch(`${BASE_URL}/scenarios/${SCENARIO_ID}/blueprint`, {
      headers: { 'Authorization': `Token ${API_TOKEN}` }
    });
    
    if (!res.ok) {
      throw new Error(`Error fetching blueprint: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const blueprint = data.response.blueprint;
    
    fs.writeFileSync('debug_blueprint.json', JSON.stringify(blueprint, null, 2));
    console.log('Saved blueprint to debug_blueprint.json');
    
    // Inspect Module 3 (HTTP) mapping
    const httpModule = blueprint.flow.find(m => m.id === 3);
    if (httpModule) {
        console.log('Module 3 Mapper:', JSON.stringify(httpModule.mapper, null, 2));
    } else {
        console.log('Module 3 not found');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

getBlueprint();
