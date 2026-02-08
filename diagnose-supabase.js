
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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
    } catch (e) {
        console.error('Erro ao ler .env:', e.message);
        return {};
    }
}

const env = getEnv();
const URL = env.SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = env.SUPABASE_ANON_KEY;

console.log('--- Diagnóstico de Conexão Supabase ---');
console.log(`URL: ${URL}`);

function checkKey(name, key) {
    if (!key) {
        console.log(`❌ ${name}: Não encontrada`);
        return;
    }
    console.log(`ℹ️  ${name}: ${key.substring(0, 10)}...${key.substring(key.length - 5)} (Len: ${key.length})`);
    
    // Check for whitespace
    if (/\s/.test(key)) {
        console.log(`   ⚠️  AVISO: A chave contém espaços em branco! Isso pode ser o problema.`);
    }
    // Check for non-printable chars
    for (let i = 0; i < key.length; i++) {
        if (key.charCodeAt(i) < 33 || key.charCodeAt(i) > 126) {
             console.log(`   ⚠️  AVISO: Caractere suspeito encontrado na posição ${i} (código ${key.charCodeAt(i)})`);
        }
    }
}

checkKey('SERVICE_ROLE_KEY', SERVICE_KEY);
checkKey('ANON_KEY', ANON_KEY);

async function testConnection(keyName, key) {
    console.log(`\nTestando conexão com ${keyName}...`);
    try {
        const sb = createClient(URL, key, {
            auth: { persistSession: false, autoRefreshToken: false }
        });
        
        // Tentar um ping simples: listar buckets ou health check
        // Storage listBuckets é bom porque geralmente não requer tabela
        const start = Date.now();
        const { data, error } = await sb.storage.listBuckets();
        const duration = Date.now() - start;

        if (error) {
            console.log(`❌ Falha (${duration}ms): ${error.message} (Status: ${error.statusCode || 'N/A'})`);
            // console.log(JSON.stringify(error, null, 2));
        } else {
            console.log(`✅ Sucesso (${duration}ms)! Buckets encontrados: ${data.length}`);
        }
    } catch (e) {
        console.log(`❌ Erro Fatal: ${e.message}`);
    }
}

async function run() {
    if (URL && SERVICE_KEY) await testConnection('SERVICE_ROLE_KEY', SERVICE_KEY);
    if (URL && ANON_KEY) await testConnection('ANON_KEY', ANON_KEY);
}

run();
