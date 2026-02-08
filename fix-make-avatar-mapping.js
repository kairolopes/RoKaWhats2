const fs = require('fs');

// Carregar variáveis
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
  });
} catch (e) {}

const SCENARIO_ID = 4547848;
const API_TOKEN = process.env.MAKE_API_TOKEN;
const REGION_BASE = 'https://us1.make.com/api/v2';

async function updateScenario() {
  // 1. Obter blueprint atual
  console.log('Obtendo blueprint atual...');
  const getRes = await fetch(`${REGION_BASE}/scenarios/${SCENARIO_ID}/blueprint`, {
    headers: { 'Authorization': `Token ${API_TOKEN}` }
  });
  
  if (!getRes.ok) throw new Error(`Erro ao obter blueprint: ${getRes.status}`);
  const blueprint = (await getRes.json()).response.blueprint;

  // 2. Modificar Módulo 4 (Avatar Sync)
  // O módulo 4 é o que envia para /api/inbox/avatar/sync
  const avatarSyncModule = blueprint.flow.find(m => m.id === 4);
  
  if (avatarSyncModule) {
    console.log('Atualizando mapeamento do Módulo 4...');
    
    // O JSON atual está com "avatarUrl": ""
    // Vamos substituir por "avatarUrl": "{{5.data.link}}"
    // Assumindo que o módulo 5 retorna { link: "..." } (padrão Z-API profile-picture)
    
    // Parse do JSON string dentro de 'data'
    // CUIDADO: O Make usa placeholders {{...}} que podem quebrar JSON.parse se não tratados.
    // Mas aqui queremos apenas substituir a string dentro do valor.
    
    let jsonData = avatarSyncModule.mapper.data;
    
    // Substituição segura via regex ou string replace
    // Procura "avatarUrl": "" e troca por "avatarUrl": "{{5.data.link}}"
    // Se o endpoint for /contacts, seria {{5.data.imgUrl}}. 
    // Vamos usar fallback: {{ifempty(5.data.link; 5.data.imgUrl)}}
    
    const newAvatarValue = "{{ifempty(5.data.link; 5.data.imgUrl)}}";
    
    if (jsonData.includes('"avatarUrl": ""')) {
        jsonData = jsonData.replace('"avatarUrl": ""', `"avatarUrl": "${newAvatarValue}"`);
    } else {
        // Se já tiver algo, vamos forçar a substituição
        // Regex para "avatarUrl": "..."
        jsonData = jsonData.replace(/"avatarUrl":\s*"[^"]*"/, `"avatarUrl": "${newAvatarValue}"`);
    }
    
    avatarSyncModule.mapper.data = jsonData;
    
    // Remover chave solta incorreta se existir
    if (avatarSyncModule.mapper.avatarUrl) {
        delete avatarSyncModule.mapper.avatarUrl;
    }

    console.log('Novo payload data:', jsonData);
  } else {
      console.error('Módulo 4 não encontrado!');
      return;
  }

  // 3. Enviar atualização
  console.log('Enviando atualização...');
  const updateRes = await fetch(`${REGION_BASE}/scenarios/${SCENARIO_ID}?confirmed=true`, {
    method: 'PATCH',
    headers: { 
        'Authorization': `Token ${API_TOKEN}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ blueprint: JSON.stringify(blueprint) })
  });

  if (!updateRes.ok) {
      console.error('Erro ao atualizar:', await updateRes.text());
  } else {
      console.log('Cenário atualizado com sucesso!');
  }
}

updateScenario().catch(console.error);
