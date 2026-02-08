const fs = require('fs');

// Carregar variáveis do .env manualmente
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (e) {
  console.log('Erro ao ler .env:', e.message);
}

const SCENARIO_ID = 4547848;
const API_TOKEN = process.env.MAKE_API_TOKEN;
const REGION_BASE = 'https://us1.make.com/api/v2';

async function getBlueprint() {
  try {
    console.log(`Buscando blueprint do cenário ${SCENARIO_ID}...`);
    const response = await fetch(`${REGION_BASE}/scenarios/${SCENARIO_ID}/blueprint`, {
      headers: {
        'Authorization': `Token ${API_TOKEN}`
      }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const blueprint = data.response.blueprint;
    
    console.log('Módulos encontrados:');
    blueprint.flow.forEach(module => {
      console.log(`\n--- Módulo ID: ${module.id} (${module.module}) ---`);
      if (module.parameters) {
          console.log('Parameters:', JSON.stringify(module.parameters, null, 2));
      }
      if (module.mapper) {
          console.log('Mapper:', JSON.stringify(module.mapper, null, 2));
      }
    });

  } catch (error) {
    console.error('Erro ao buscar blueprint:', error.message);
  }
}

getBlueprint();
