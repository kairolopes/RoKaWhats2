
// const fetch = require('node-fetch');

async function inspectMapper() {
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
    
    // Find Z-API modules (usually HTTP or specific app)
    const modules = blueprint.response.blueprint.flow;
    const zapiModule = modules.find(m => m.id === 3);
    
    if (zapiModule) {
        console.log('\n🔍 Found Z-API Module (ID 3):');
        console.log('Mapper:', JSON.stringify(zapiModule.mapper, null, 2));
    } else {
        console.log('❌ Module 3 not found.');
    }

  } catch (error) {
    console.error('❌ Network Error:', error);
  }
}

inspectMapper();
