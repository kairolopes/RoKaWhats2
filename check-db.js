
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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
} catch (e) {}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTables() {
    console.log('--- Debug ENV ---');
    console.log(`URL: '${env.SUPABASE_URL}'`);
    console.log(`Key Length: ${env.SUPABASE_SERVICE_ROLE_KEY ? env.SUPABASE_SERVICE_ROLE_KEY.length : 0}`);
    console.log('-----------------');

    console.log('Verificando banco de dados...');
    
    const tables = ['profiles', 'contacts', 'workspaces', 'conversations', 'webhook_logs'];
    
    for (const t of tables) {
        const { data, error } = await supabase.from(t).select('*').limit(1);
        if (error) {
            console.log(`Tabela '${t}': Erro ou não existe (${error.message})`);
        } else {
            console.log(`Tabela '${t}': OK (${data.length} registros visíveis)`);
        }
    }
}

async function testStorage() {
    console.log('\nVerificando Storage...');
    try {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) {
            console.error('Erro ao listar buckets:', error.message);
        } else {
            console.log('Buckets encontrados:', data.map(b => b.name).join(', '));
            
            // Verifica se bucket avatars existe
            const hasAvatars = data.some(b => b.name === 'avatars');
            if (!hasAvatars) {
                console.log('⚠️ Bucket "avatars" não encontrado! Tentando criar...');
                const { error: createErr } = await supabase.storage.createBucket('avatars', { public: true });
                if (createErr) console.error('Erro ao criar bucket:', createErr.message);
                else console.log('Bucket "avatars" criado com sucesso.');
            }

            // Teste de upload simples
            const { error: upErr } = await supabase.storage
                .from('avatars')
                .upload('test-health.txt', Buffer.from('health check'), { upsert: true });
            if (upErr) {
                console.error('Erro ao fazer upload teste:', upErr.message);
            } else {
                console.log('Upload teste (avatars/test-health.txt): SUCESSO');
            }
        }
    } catch (e) {
        console.error('Exceção no teste de storage:', e.message);
    }
}

async function run() {
    await checkTables();
    await testStorage();
}

run();
