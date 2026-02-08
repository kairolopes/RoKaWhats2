const fs = require('fs');
const path = require('path');

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

const API_TOKEN = env.MAKE_API_TOKEN_BACKUP;
const SCENARIO_ID = 4547848;
const REGION_BASE = 'https://us1.make.com/api/v2';

if (!API_TOKEN) {
  console.error('MAKE_API_TOKEN_BACKUP not found in .env');
  process.exit(1);
}

async function updateScenario() {
  console.log(`Buscando blueprint do cenário ${SCENARIO_ID}...`);
  
  try {
    const getRes = await fetch(`${REGION_BASE}/scenarios/${SCENARIO_ID}/blueprint`, {
      headers: { 'Authorization': `Token ${API_TOKEN}` }
    });

    if (!getRes.ok) {
      throw new Error(`Erro ao buscar blueprint: ${getRes.status} ${getRes.statusText}`);
    }

    const data = await getRes.json();
    const blueprint = data.response.blueprint;
    
    // Find Module 5 (Z-API Fetcher)
    const zapiModule = blueprint.flow.find(m => m.id === 5);
    
    if (zapiModule) {
      console.log('Módulo 5 encontrado.');
      console.log('URL atual:', zapiModule.mapper.url);
      
      // Change URL to /contacts/{{1.phone}}
      // The current URL template in .env is .../contacts/profile-picture?phone=...
      // We want .../contacts/{{1.phone}}
      
      // Let's assume the base instance URL is correct in the current mapper, we just need to strip the end
      // Current: .../token/ABC/contacts/profile-picture?phone={{1.phone}}
      // Target:  .../token/ABC/contacts/{{1.phone}}
      
      let currentUrl = zapiModule.mapper.url;
      let baseUrl = currentUrl.split('/contacts/')[0]; // Get everything up to /contacts/
      
      if (!baseUrl) {
          // Fallback if structure is different
          baseUrl = currentUrl.split('/profile-picture')[0];
      }

      // Construct new URL
      const newUrl = `${baseUrl}/contacts/{{1.phone}}`;
      
      if (zapiModule.mapper.url !== newUrl) {
        zapiModule.mapper.url = newUrl;
        console.log('Nova URL definida:', newUrl);
        
        // Update scenario
        console.log('Enviando atualização para o Make...');
        const updateRes = await fetch(`${REGION_BASE}/scenarios/${SCENARIO_ID}?confirmed=true`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Token ${API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            blueprint: JSON.stringify(blueprint)
          })
        });

        if (updateRes.ok) {
          console.log('Cenário atualizado com sucesso! Módulo 5 agora usa endpoint de detalhes do contato.');
        } else {
          const errBody = await updateRes.text();
          console.error('Erro ao atualizar cenário:', updateRes.status, errBody);
        }
      } else {
        console.log('A URL já está correta.');
      }
    } else {
      console.error('Módulo 5 não encontrado no blueprint.');
    }

  } catch (error) {
    console.error('Erro:', error.message);
  }
}

updateScenario();
