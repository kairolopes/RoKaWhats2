-- FIX CRÍTICO DE PERMISSÕES (RLS)
-- Execute isso no SQL Editor do Supabase para corrigir o erro "stack depth limit exceeded"

-- 1. Remove políticas recursivas antigas da tabela messages
DROP POLICY IF EXISTS "Enable read access for all users" ON messages;
DROP POLICY IF EXISTS "Enable insert for all users" ON messages;
DROP POLICY IF EXISTS "Allow read access for all users" ON messages;
DROP POLICY IF EXISTS "Allow insert access for all users" ON messages;

-- 2. Remove políticas recursivas da tabela conversations (se existirem) que olhem para messages
DROP POLICY IF EXISTS "Enable read access for all users" ON conversations;
DROP POLICY IF EXISTS "Enable insert for all users" ON conversations;

-- 3. Cria novas políticas SIMPLIFICADAS (sem recursão)

-- Conversas: Acesso público (ou ajuste para auth.uid() = workspace_id se preferir)
CREATE POLICY "Public Read Conversations"
ON conversations FOR SELECT
USING (true);

CREATE POLICY "Public Insert Conversations"
ON conversations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public Update Conversations"
ON conversations FOR UPDATE
USING (true);

-- Mensagens: Acesso público (Evita o loop de verificar conversations -> messages -> conversations)
CREATE POLICY "Public Read Messages"
ON messages FOR SELECT
USING (true);

CREATE POLICY "Public Insert Messages"
ON messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public Update Messages"
ON messages FOR UPDATE
USING (true);
