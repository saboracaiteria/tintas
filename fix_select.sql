-- 🔓 LIBERAR LEITURA PÚBLICA (SELECT)
-- Este script corrige o problema de "0 Produtos" no app

-- 1. Products
DROP POLICY IF EXISTS "Public select products" ON products;
CREATE POLICY "Public select products" ON products FOR SELECT USING (true);

-- 2. Categories
DROP POLICY IF EXISTS "Public select categories" ON categories;
CREATE POLICY "Public select categories" ON categories FOR SELECT USING (true);

-- 3. Groups & Options
DROP POLICY IF EXISTS "Public select product_groups" ON product_groups;
CREATE POLICY "Public select product_groups" ON product_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public select product_options" ON product_options;
CREATE POLICY "Public select product_options" ON product_options FOR SELECT USING (true);

-- 4. Relations
DROP POLICY IF EXISTS "Public select product_group_relations" ON product_group_relations;
CREATE POLICY "Public select product_group_relations" ON product_group_relations FOR SELECT USING (true);

-- 5. Coupons (Leitura pública necessária para validar no checkout)
DROP POLICY IF EXISTS "Public select coupons" ON coupons;
CREATE POLICY "Public select coupons" ON coupons FOR SELECT USING (true);

-- 6. Settings (Reforço)
DROP POLICY IF EXISTS "Public select settings" ON settings;
CREATE POLICY "Public select settings" ON settings FOR SELECT USING (true);
