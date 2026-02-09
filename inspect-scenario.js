const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
const env = {};
const lines = fs.readFileSync(envPath, 'utf8').split('\n');
lines.forEach(line => {
    const p = line.indexOf('=');
    if (p > 0) env[line.substring(0, p).trim()] = line.substring(p + 1).trim();
});

async function inspect() {
    console.log('Fetching blueprint...');
    const res = await fetch('https://us1.make.com/api/v2/scenarios/4547638/blueprint', {
        headers: { 'Authorization': 'Token ' + env.MAKE_API_TOKEN_BACKUP }
    });
    const data = await res.json();
    
    if (!data.response || !data.response.blueprint) {
        console.error('Invalid blueprint data', data);
        return;
    }

    const httpModule = data.response.blueprint.flow.find(m => m.id === 3);
    console.log('Module 3 Mapper:', JSON.stringify(httpModule.mapper, null, 2));
    console.log('Module 3 Parameters:', JSON.stringify(httpModule.parameters, null, 2));
}

inspect();
