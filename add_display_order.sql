-- ADICIONAR COLUNA FALTANTE
-- Este script corrige o erro 400 (Bad Request)

-- 1. Adicionar display_order na tabela products
ALTER TABLE products ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 2. Atualizar permissões (garantir que seja visível)
GRANT SELECT ON products TO anon;
GRANT SELECT ON products TO authenticated;
GRANT SELECT ON products TO service_role;

-- 3. Preencher com valores padrão (opcional, só para garantir ordem)
UPDATE products SET display_order = 0 WHERE display_order IS NULL;
