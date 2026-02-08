const fs = require('fs');
const path = require('path');

// Load .env
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

const tokens = [
    env.MAKE_API_TOKEN,
    env.MAKE_API_TOKEN_BACKUP
].filter(Boolean);

const REGION_BASE = 'https://us1.make.com/api/v2';

async function tryListScenarios(token) {
    console.log(`\nTesting token: ${token.substring(0, 5)}...`);
    try {
        const orgsRes = await fetch(`${REGION_BASE}/organizations`, {
            headers: { 'Authorization': `Token ${token}` }
        });
        
        if (!orgsRes.ok) {
            console.error('Error fetching orgs:', await orgsRes.text());
            return;
        }

        const orgsData = await orgsRes.json();
        if (orgsData.organizations.length === 0) {
            console.log('No organizations found.');
            return;
        }

        for (const org of orgsData.organizations) {
            console.log(`Checking Org: ${org.name} (${org.id})`);
            const res = await fetch(`${REGION_BASE}/scenarios?organizationId=${org.id}&limit=50`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            
            if (!res.ok) {
                console.error(`Error listing scenarios for org ${org.id}: ${res.status}`);
                continue;
            }

            const data = await res.json();
            console.log(`Found ${data.scenarios.length} scenarios in ${org.name}:`);
            data.scenarios.forEach(s => {
                console.log(`- [${s.id}] ${s.name} (Running: ${s.isrunning})`);
            });
        }
    } catch (e) {
        console.error('Exception:', e.message);
    }
}

async function run() {
    for (const token of tokens) {
        await tryListScenarios(token);
    }
}

run();
