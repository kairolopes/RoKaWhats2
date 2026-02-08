
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Carregar .env manualmente
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
}

const SUPABASE_URL = env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const MAKE_WEBHOOK_SECRET = env.MAKE_WEBHOOK_SECRET;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('--- Iniciando Teste de Avatar Sync ---');

  // 1. Buscar um workspace válido
  console.log('Buscando um workspace válido no banco de dados...');
  let workspaceId = '';
  
  const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);

  if (workspaces && workspaces.length > 0) {
    workspaceId = workspaces[0].id;
    console.log(`Workspace encontrado: ${workspaceId}`);
  } else {
    workspaceId = '00000000-0000-0000-0000-000000000000';
    console.log('Usando Workspace ID fictício');
  }

  // 2. Preparar payload
  const contactPhone = '5511999999999';
  const avatarUrl = 'https://github.com/github.png'; // Imagem válida
  
  const payload = {
    workspaceId,
    contactPhone,
    avatarUrl
  };

  const url = 'http://127.0.0.1:3001/api/inbox/avatar/sync';
  console.log(`Enviando requisição para: ${url}`);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-make-secret': MAKE_WEBHOOK_SECRET || ''
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const status = response.status;
    const text = await response.text();
    
    console.log(`\nStatus HTTP: ${status}`);
    console.log('Resposta:', text);

    if (response.ok) {
        console.log('\n✅ SUCESSO! A API aceitou a requisição.');
    } else {
        console.log('\n❌ ERRO! A API retornou falha.');
    }
  } catch (e) {
      console.error('\n❌ Exceção na requisição:', e.message);
      if (e.cause) console.error('Causa:', e.cause);
  }
}

run();
