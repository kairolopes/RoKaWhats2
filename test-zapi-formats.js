
const https = require('https');

// Load env vars manually since we don't want to rely on dotenv in this test script environment if possible, 
// or just hardcode the known values for this specific test as per user context.
// Based on previous reads:
const INSTANCE_ID = '3EDCE29A3EB0A1453F66FAF4F663B13A';
const TOKEN = 'CC91F1EC21501AFE9182A3BC';
const CLIENT_TOKEN = 'Ff94d05bcd8b546afb957fc52d8e33ebaS';
const PHONE = '556285635204'; // The number we used before

const BASE_URL = `https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}`;

const endpoints = [
  { name: 'Query Param', path: `/contacts/profile-picture?phone=${PHONE}` },
  { name: 'Path Param', path: `/contacts/${PHONE}/profile-picture` }
];

function testEndpoint(endpoint) {
  const options = {
    hostname: 'api.z-api.io',
    path: `/instances/${INSTANCE_ID}/token/${TOKEN}${endpoint.path}`,
    method: 'GET',
    headers: {
      'Client-Token': CLIENT_TOKEN,
      'Content-Type': 'application/json'
    }
  };

  console.log(`Testing ${endpoint.name}: ${options.path}`);

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`[${endpoint.name}] Status: ${res.statusCode}`);
      try {
        const json = JSON.parse(data);
        console.log(`[${endpoint.name}] Body:`, JSON.stringify(json, null, 2));
      } catch (e) {
        console.log(`[${endpoint.name}] Body (text):`, data);
      }
      console.log('---');
    });
  });

  req.on('error', (e) => {
    console.error(`[${endpoint.name}] Error:`, e.message);
  });

  req.end();
}

console.log('Starting Z-API Endpoint Format Tests...');
endpoints.forEach(ep => testEndpoint(ep));
