-- ADICIONAR COLUNA FALTANTE EM CATEGORIAS
-- Isso corrige o erro de carregamento das categorias

-- 1. Adicionar display_order na tabela categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 2. Atualizar permissões (garantir que seja editável)
GRANT ALL ON categories TO authenticated;
GRANT ALL ON categories TO service_role;
GRANT SELECT ON categories TO anon;

-- 3. Notificar reload
NOTIFY pgrst, 'reload schema';
