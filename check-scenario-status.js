const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
const env = {};
const lines = fs.readFileSync(envPath, 'utf8').split('\n');
lines.forEach(line => {
    const p = line.indexOf('=');
    if (p > 0) env[line.substring(0, p).trim()] = line.substring(p + 1).trim();
});

async function checkStatus() {
    console.log('Fetching scenario details...');
    const res = await fetch('https://us1.make.com/api/v2/scenarios/4547638', {
        headers: { 'Authorization': 'Token ' + env.MAKE_API_TOKEN_BACKUP }
    });
    const data = await res.json();
    console.log('Scenario Data:', JSON.stringify(data, null, 2));
}

checkStatus();
