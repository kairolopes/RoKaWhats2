
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
const env = {};
const lines = fs.readFileSync(envPath, 'utf8').split('\n');
lines.forEach(line => {
    const p = line.indexOf('=');
    if (p > 0) env[line.substring(0, p).trim()] = line.substring(p + 1).trim();
});

async function getBlueprint() {
    const res = await fetch('https://us1.make.com/api/v2/scenarios/4547638/blueprint', {
        headers: { 'Authorization': 'Token ' + env.MAKE_API_TOKEN_BACKUP }
    });
    const data = await res.json();
    const flow = data.response.blueprint.flow;
    const m3 = flow.find(m => m.id === 3);
    console.log('Module 3 Type:', m3.module);
    console.log('Module 3 Mapper:', JSON.stringify(m3.mapper, null, 2));
}

getBlueprint();
