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
  const avatarSyncModule = blueprint.flow.find(m => m.id === 4);
  
  if (avatarSyncModule) {
    console.log('Atualizando mapeamento do Módulo 4 para usar apenas imgUrl...');
    
    let jsonData = avatarSyncModule.mapper.data;
    
    // Simplificando diretamente para imgUrl conforme solicitado
    const newAvatarValue = "{{5.data.imgUrl}}";
    
    // Regex para substituir qualquer valor anterior de avatarUrl
    // Procura "avatarUrl": "..." (com qualquer conteúdo dentro das aspas)
    // E substitui por "avatarUrl": "{{5.data.imgUrl}}"
    
    if (jsonData.includes('"avatarUrl"')) {
        jsonData = jsonData.replace(/"avatarUrl":\s*"[^"]*"/, `"avatarUrl": "${newAvatarValue}"`);
    } else {
        // Se não existir, insere (embora deva existir)
        console.log('Campo avatarUrl não encontrado, verifique o JSON manual.');
    }
    
    avatarSyncModule.mapper.data = jsonData;
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
      console.log('Fórmula atualizada com sucesso!');
  }
}

updateScenario().catch(console.error);
