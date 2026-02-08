const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env manually
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
} catch (e) {
  console.error('Erro ao ler .env:', e.message);
  process.exit(1);
}

const ZAPI_URL_TEMPLATE = env.ZAPI_AVATAR_URL_TEMPLATE;
const ZAPI_CLIENT_TOKEN = env.ZAPI_CLIENT_TOKEN;
const PHONE = '556285635204'; 

if (!ZAPI_URL_TEMPLATE) {
  console.error('ZAPI_AVATAR_URL_TEMPLATE not found in .env');
  process.exit(1);
}

// Construct URL for get-contacts (assuming /contacts/{phone})
// Template: .../contacts/profile-picture?phone={PHONE}
// Base: .../contacts
const baseUrl = ZAPI_URL_TEMPLATE.split('/contacts/')[0];
const url = `${baseUrl}/contacts/${PHONE}`;

console.log(`Testing Z-API Get Contact URL: ${url}`);
console.log(`Using Client-Token: ${ZAPI_CLIENT_TOKEN}`);

const options = {
  headers: {
    'Client-Token': ZAPI_CLIENT_TOKEN
  }
};

https.get(url, options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Body:', data);
    try {
      const json = JSON.parse(data);
      console.log('\nParsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('\nResponse is not JSON.');
    }
  });

}).on('error', (e) => {
  console.error('Error:', e.message);
});
