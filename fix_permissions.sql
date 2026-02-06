-- =====================================================
-- FIX PERMISSÕES SETTINGS
-- =====================================================

-- 1. Permitir que o script insira as configurações se a tabela estiver vazia
DROP POLICY IF EXISTS "Public insert settings" ON settings;
CREATE POLICY "Public insert settings" ON settings FOR INSERT WITH CHECK (true);

-- 2. Garantir que o UPDATE também funcione (já deve existir, mas reforçando)
DROP POLICY IF EXISTS "Public update settings" ON settings;
CREATE POLICY "Public update settings" ON settings FOR UPDATE USING (true);

-- 3. Inserir linha base se não existir
INSERT INTO settings (id, store_name, delivery_fee) 
VALUES (1, 'Minha Loja', 0) 
ON CONFLICT (id) DO NOTHING;

SELECT 'Permissões corrigidas! Pode rodar o script novamente.' as status;
