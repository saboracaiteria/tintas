-- SUPER FIX CATEGORIAS
-- Este script força a correção das permissões e insere uma categoria de teste

-- 1. Garantir coluna display_order
ALTER TABLE categories ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 2. RESETAR Permissões (Público Total)
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert categories" ON categories;
CREATE POLICY "Public insert categories" ON categories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update categories" ON categories;
CREATE POLICY "Public update categories" ON categories FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete categories" ON categories;
CREATE POLICY "Public delete categories" ON categories FOR DELETE USING (true);

-- 3. Inserir Categoria de Teste (Se não houver nenhuma)
INSERT INTO categories (title, icon, display_order)
SELECT 'Categoria Teste', '🧪', 0
WHERE NOT EXISTS (SELECT 1 FROM categories);

-- 4. Notificar Schema
NOTIFY pgrst, 'reload schema';
