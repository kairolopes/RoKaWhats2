
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
    
    // Find Z-API modules (usually HTTP or specific app)
    const modules = blueprint.response.blueprint.flow;
    const zapiModules = modules.filter(m => m.module.includes('http') || m.module.includes('z-api'));
    
    console.log('\n🔍 Found Modules (potential Z-API):');
    zapiModules.forEach(m => {
        console.log(`ID: ${m.id}, Module: ${m.module}`);
        if (m.parameters) console.log('Parameters:', JSON.stringify(m.parameters, null, 2));
        // HTTP modules store config in 'parameters' or 'mapper'
        // Let's print the whole module to be sure
        console.log(JSON.stringify(m, null, 2));
    });

  } catch (error) {
    console.error('❌ Network Error:', error);
  }
}

fetchBlueprint();
