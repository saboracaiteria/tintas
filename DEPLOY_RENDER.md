# 🚀 Como Fazer Deploy no Render

Siga este guia passo-a-passo para colocar o **Casa das Cores** online gratuitamente usando o Render.

## 1. Crie sua conta no Render
Acesse [render.com](https://render.com) e crie uma conta usando seu **GitHub**.

## 2. Nova Web Service
No painel do Render (Dashboard), clique no botão **New +** e selecione **Static Site**.

**Por que Static Site?**
Como seu projeto é feito em React + Vite, ele gera arquivos estáticos (HTML/CSS/JS) que não precisam de um servidor rodando o tempo todo (Node.js), o que é mais barato e rápido.

## 3. Conecte o Repositório
- Na lista de repositórios, procure por `saboracaiteria/tintas`.
- Clique em **Connect**.

## 4. Configurações de Build
Preencha o formulário com as seguintes informações:

| Campo | Valor |
|---|---|
| **Name** | `casa-das-cores` (ou o nome que preferir) |
| **Branch** | `main` |
| **Root Directory** | `.` (deixe como está) |
| **Build Command** | `npm run build` |
| **Publish Directory** | `dist` |

## 5. Variáveis de Ambiente (Importante!)
Para que o site consiga conectar no banco de dados, você precisa adicionar as chaves do Supabase.

1. Role até a seção **Advanced**.
2. Clique em **Add Environment Variable**.
3. Adicione as seguintes chaves (copie os valores do seu arquivo `.env.local`):

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://sua-url-do-supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sua-chave-anonima-longa` |

## 6. Regra de Reescrita (Rewrite)
Como o site é uma SPA (Single Page Application), precisamos garantir que ao recarregar uma página interna (ex: `/panel`), o servidor não dê erro 404.

1. Ainda na seção **Advanced** ou na aba **Redirects/Rewrites** após criar.
2. Adicione uma regra de **Rewrite**:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`

## 7. Finalizar
Clique em **Create Static Site**.

O Render vai começar a baixar o código, instalar as dependências e fazer o build. Isso leva uns 2-3 minutos. Quando terminar, você verá um link do tipo `https://casa-das-cores.onrender.com`.

---

### Solução de Problemas Comuns

- **Página em Branco:** Verifique se adicionou as Variáveis de Ambiente corretamente e fez um novo Deploy.
- **Erro 404 ao atualizar página:** Verifique se configurou a regra de Rewrite (`/*` -> `/index.html`).
- **Build Falhou:** Clique em "Logs" para ver o erro. Geralmente é alguma dependência faltando ou erro de TypeScript.
