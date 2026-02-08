
const https = require('https');

// Configs
const INSTANCE_ID = '3EDCE29A3EB0A1453F66FAF4F663B13A';
const TOKEN = 'CC91F1EC21501AFE9182A3BC';
const CLIENT_TOKEN = 'Ff94d05bcd8b546afb957fc52d8e33ebaS';
const PHONE = '556285635204'; 

function testContactInfo() {
  const options = {
    hostname: 'api.z-api.io',
    path: `/instances/${INSTANCE_ID}/token/${TOKEN}/contacts/${PHONE}`,
    method: 'GET',
    headers: {
      'Client-Token': CLIENT_TOKEN,
      'Content-Type': 'application/json'
    }
  };

  console.log(`Testing Contact Details: ${options.path}`);

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`Status: ${res.statusCode}`);
      try {
        const json = JSON.parse(data);
        console.log(`Body:`, JSON.stringify(json, null, 2));
      } catch (e) {
        console.log(`Body (text):`, data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Error:`, e.message);
  });

  req.end();
}

testContactInfo();
