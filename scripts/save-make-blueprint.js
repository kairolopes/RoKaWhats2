
const fs = require('fs');

async function fetchAndSaveBlueprint() {
  const scenarioId = '4547638';
  const token = 'a843de35-f49b-44f3-84a6-cda3a5c81880';
  const url = `https://us1.make.com/api/v2/scenarios/${scenarioId}/blueprint`;

  console.log('📥 Fetching Blueprint...');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Token ${token}` }
    });

    if (!response.ok) {
        console.error('❌ Failed:', response.status);
        return;
    }

    const data = await response.json();
    const blueprint = data.response.blueprint;

    fs.writeFileSync('blueprint.json', JSON.stringify(blueprint, null, 2));
    console.log('✅ Saved to blueprint.json');
    
    // Log module 1 summary
    const mod1 = blueprint.flow.find(m => m.id === 1);
    if (mod1) {
        console.log('Module 1 (Trigger):', JSON.stringify(mod1, null, 2));
    } else {
        console.log('Module 1 not found in flow');
        console.log('Modules:', blueprint.flow.map(m => m.id).join(', '));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fetchAndSaveBlueprint();
