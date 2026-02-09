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
    const scenarioId = 4547638;
    const headers = {
        'Authorization': 'Token ' + env.MAKE_API_TOKEN_BACKUP,
        'Content-Type': 'application/json'
    };

    console.log('Fetching blueprint...');
    const res = await fetch(`https://us1.make.com/api/v2/scenarios/${scenarioId}/blueprint`, { headers });
    const data = await res.json();
    
    fs.writeFileSync('current_blueprint.json', JSON.stringify(data, null, 2));
    console.log('Blueprint saved to current_blueprint.json');
}

inspect();
