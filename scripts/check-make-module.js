
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function checkModule() {
  const scenarioId = '4547638';
  const token = process.env.MAKE_API_TOKEN;

  if (!token) {
    console.error("❌ Missing MAKE_API_TOKEN in .env.local");
    // Fallback to trying process.env if loaded differently
    if (!process.env.MAKE_API_TOKEN) process.exit(1);
  }

  const urlGet = `https://us1.make.com/api/v2/scenarios/${scenarioId}/blueprint`;

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
    if (!module) {
        console.error('Module 3 not found');
    } else {
        console.log('Module 3 Mapper:');
        console.dir(module.mapper, { depth: null });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkModule();
