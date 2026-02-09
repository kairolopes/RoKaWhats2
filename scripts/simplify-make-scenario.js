
// const fetch = require('node-fetch');

async function simplifyScenario() {
  const scenarioId = '4547638';
  const token = process.env.MAKE_API_TOKEN;

  if (!token) {
    console.error("❌ Missing MAKE_API_TOKEN");
    process.exit(1);
  }
  const urlGet = `https://us1.make.com/api/v2/scenarios/${scenarioId}/blueprint`;
  const urlPatch = `https://us1.make.com/api/v2/scenarios/${scenarioId}`;

  console.log('📥 Fetching Blueprint...');
  try {
    const response = await fetch(urlGet, {
      method: 'GET',
      headers: { 'Authorization': `Token ${token}` }
    });
    
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const data = await response.json();
    const blueprint = data.response.blueprint;

    // Find Module 3
    const module = blueprint.flow.find(m => m.id === 3);
    if (!module) throw new Error('Module 3 not found');

    // CORRECT URL with Token ID inserted
    const correctUrl = 'https://api.z-api.io/instances/3EDCE29A3EB0A1453F66FAF4F663B13A/token/CC91F1EC21501AFE9182A3BC/send-text';

    // SIMPLE BODY for testing mapping
    // We assume input is { to: { phone: "..." }, message: { text: "..." } }
    // Make syntax: {{1.to.phone}}
    const simpleBody = `{
      "phone": "{{1.to.phone}}",
      "message": "{{1.message.text}}"
    }`;

    module.mapper.url = correctUrl;
    module.mapper.method = "post";
    module.mapper.data = simpleBody;

    console.log('✏️ Updating URL to FIXED:', correctUrl);
    console.log('✏️ Updating BODY to SIMPLE DYNAMIC:', simpleBody);

    // Push update via PATCH
    const updateResponse = await fetch(urlPatch, {
      method: 'PATCH',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ blueprint: JSON.stringify(blueprint) })
    });

    if (!updateResponse.ok) {
        const errText = await updateResponse.text();
        throw new Error(`Update failed: ${updateResponse.status} - ${errText}`);
    }

    console.log('✅ Scenario Simplified Successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

simplifyScenario();
