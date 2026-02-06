-- Adicionar coluna theme_colors à tabela settings
ALTER TABLE settings ADD COLUMN IF NOT EXISTS theme_colors JSONB;

-- Exemplo de como definir a cor do rodapé:
-- UPDATE settings SET theme_colors = jsonb_set(COALESCE(theme_colors, '{}'::jsonb), '{footerBg}', '"#1f2937"'::jsonb) WHERE id = 1;
-- UPDATE settings SET theme_colors = jsonb_set(COALESCE(theme_colors, '{}'::jsonb), '{footerText}', '"#d1d5db"'::jsonb) WHERE id = 1;

-- Ou definir tudo de uma vez:
-- UPDATE settings SET theme_colors = '{"footerBg": "#ff6b00", "footerText": "#ffffff"}'::jsonb WHERE id = 1;
