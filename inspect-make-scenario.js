const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
const env = {};
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
} catch (e) {
    console.error('Error reading .env:', e.message);
}

const MAKE_API_TOKEN = env.MAKE_API_TOKEN;
const REGION_BASE = 'https://us1.make.com/api/v2';
const SCENARIO_ID = 4547848; // INBOUND_MESSAGE_ZAPI_TO_APP

async function inspectScenario() {
    console.log(`Fetching blueprint for scenario ${SCENARIO_ID}...`);
    try {
        const res = await fetch(`${REGION_BASE}/scenarios/${SCENARIO_ID}/blueprint`, {
            headers: { 'Authorization': `Token ${MAKE_API_TOKEN}` }
        });
        
        if (!res.ok) {
            console.error(`Error: ${res.status} ${res.statusText}`);
            console.error(await res.text());
            return;
        }

        const blueprint = await res.json();
        const outputPath = path.resolve(__dirname, 'scenario_blueprint.json');
        fs.writeFileSync(outputPath, JSON.stringify(blueprint, null, 2));
        console.log(`Blueprint saved to ${outputPath}`);
    } catch (e) {
        console.error('Exception:', e.message);
    }
}

inspectScenario();
