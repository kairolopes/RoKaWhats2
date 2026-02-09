
// const fetch = require('node-fetch');

async function fetchBlueprint() {
  const scenarioId = '4547638';
  const token = 'a843de35-f49b-44f3-84a6-cda3a5c81880';
  const url = `https://us1.make.com/api/v2/scenarios/${scenarioId}/blueprint`;

  console.log('📥 Fetching Blueprint for Scenario:', scenarioId);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`
      }
    });

    if (!response.ok) {
        console.error('❌ Failed to fetch blueprint:', response.status, response.statusText);
        return;
    }

    const blueprint = await response.json();
    console.log('✅ Blueprint Fetched!');
    
    // Find Module 3
    const module3 = blueprint.response.blueprint.flow.find(m => m.id === 3);
    if (!module3) {
        console.log('❌ Module 3 NOT FOUND');
    } else {
        console.log('\n✅ Module 3 Found!');
        console.dir(module3.mapper, { depth: null });
    }

  } catch (error) {
    console.error('❌ Network Error:', error);
  }
}

fetchBlueprint();
