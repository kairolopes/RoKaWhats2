
const fs = require('fs');
const path = require('path');

// Helper to read env safely
function getEnv() {
    try {
        const envPath = path.resolve(__dirname, '.env');
        const content = fs.readFileSync(envPath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx > -1) {
                const key = trimmed.substring(0, eqIdx).trim();
                const val = trimmed.substring(eqIdx + 1).trim();
                env[key] = val;
            }
        });
        return env;
    } catch (e) { return {}; }
}

const env = getEnv();
const ACCESS_TOKEN = env.SUPABASE_ACCESS_TOKEN;
const URL = env.SUPABASE_URL;

// Extract project ref from URL (https://xyz.supabase.co -> xyz)
const projectRef = URL ? URL.match(/https:\/\/([^.]+)\./)?.[1] : null;

console.log('--- Recuperação de Chaves Supabase ---');
console.log(`Project Ref: ${projectRef}`);
console.log(`Access Token: ${ACCESS_TOKEN ? 'Presente' : 'Ausente'}`);

if (!ACCESS_TOKEN || !projectRef) {
    console.error('❌ Falta Access Token ou URL inválida.');
    process.exit(1);
}

async function fetchKeys() {
    const apiEndpoint = `https://api.supabase.com/v1/projects/${projectRef}/api-keys`;
    console.log(`Consultando API: ${apiEndpoint}`);
    
    try {
        const res = await fetch(apiEndpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            console.error(`❌ Erro na API: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error('Detalhes:', text);
            return;
        }

        const keys = await res.json();
        console.log('\n✅ Chaves encontradas:');
        
        let foundAnon = null;
        let foundService = null;

        keys.forEach(k => {
            console.log(`- ${k.name}: ${k.api_key.substring(0, 10)}...`);
            if (k.name === 'anon') foundAnon = k.api_key;
            if (k.name === 'service_role') foundService = k.api_key;
        });

        // Verify if they are different from current .env
        let needsUpdate = false;
        if (foundAnon && foundAnon !== env.SUPABASE_ANON_KEY) {
            console.log('⚠️  A chave ANON no .env está incorreta/desatualizada.');
            needsUpdate = true;
        }
        if (foundService && foundService !== env.SUPABASE_SERVICE_ROLE_KEY) {
            console.log('⚠️  A chave SERVICE_ROLE no .env está incorreta/desatualizada.');
            needsUpdate = true;
        }

        if (needsUpdate) {
            console.log('\n💡 Sugestão: Atualizar o arquivo .env com as novas chaves.');
            // Generate new .env content
            const newEnv = `
# Supabase
SUPABASE_URL=${URL}
SUPABASE_SERVICE_ROLE_KEY=${foundService}
SUPABASE_ANON_KEY=${foundAnon}
SUPABASE_ACCESS_TOKEN=${ACCESS_TOKEN}

# Make (Integromat)
MAKE_API_TOKEN=${env.MAKE_API_TOKEN || ''}
MAKE_API_TOKEN_PRIMARY=${env.MAKE_API_TOKEN_PRIMARY || ''}
MAKE_API_TOKEN_BACKUP=${env.MAKE_API_TOKEN_BACKUP || ''}
MAKE_WEBHOOK_SECRET=${env.MAKE_WEBHOOK_SECRET || ''}
MAKE_SYNC_WEBHOOK_URL=${env.MAKE_SYNC_WEBHOOK_URL || ''}
MAKE_OUTBOX_WEBHOOK_URL=${env.MAKE_OUTBOX_WEBHOOK_URL || ''}
MAKE_AVATAR_WEBHOOK_URL=${env.MAKE_AVATAR_WEBHOOK_URL || ''}

# Z-API
ZAPI_AVATAR_URL_TEMPLATE=${env.ZAPI_AVATAR_URL_TEMPLATE || ''}
ZAPI_CLIENT_TOKEN=${env.ZAPI_CLIENT_TOKEN || ''}
`;
            fs.writeFileSync(path.resolve(__dirname, '.env'), newEnv.trim());
            console.log('✅ Arquivo .env atualizado com sucesso!');
        } else {
            console.log('✅ As chaves no .env já parecem estar corretas (ou a API retornou as mesmas).');
        }

    } catch (e) {
        console.error(`❌ Erro de execução: ${e.message}`);
    }
}

fetchKeys();
