# Como corrigir o erro ao salvar categorias

O erro "Could not find the 'active' column" acontece porque o banco de dados está desatualizado. Para corrigir:

1. Acesse o painel do seu projeto no Supabase (ou seu banco de dados).
2. Vá para o **SQL Editor**.
3. Copie o conteúdo do arquivo `fix_categories_schema.sql` (que está na pasta do projeto).
4. Cole no editor e clique em **Run**.

Isso irá criar as colunas `active` e `display_order` que estavam faltando na tabela de categorias.

Após isso, o erro deve desaparecer e você poderá editar, ativar/desativar e reordenar categorias normalmente.
