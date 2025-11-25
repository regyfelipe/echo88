# 🚀 Setup do Supabase

## 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tcfypdzedtibmngmazbn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjZnlwZHplZHRpYm1uZ21hemJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDM2MTQsImV4cCI6MjA3OTMxOTYxNH0.Bv_s2EqwKn3j9mw1R_6UPiFAu322cpkX-jk8OKFFPMY
```

## 2. Executar Migration no Supabase

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto: `tcfypdzedtibmngmazbn`
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Copie e cole todo o conteúdo do arquivo `lib/supabase/migrations/001_initial_schema.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)

Isso criará:
- ✅ Tabela `users` com todos os campos necessários
- ✅ Tabela `login_sessions` para histórico de sessões
- ✅ Índices para performance
- ✅ Row Level Security (RLS) policies
- ✅ Triggers para timestamps automáticos

## 3. Verificar Tabelas

Após executar a migration, verifique se as tabelas foram criadas:

1. No Supabase Dashboard, vá em **Table Editor**
2. Você deve ver as tabelas:
   - `users`
   - `login_sessions`

## 4. Testar a Integração

Agora você pode testar:

1. **Criar conta**: Acesse `/signup` e crie uma conta
2. **Verificar email**: Acesse `/verify-email` (o email será simulado no console)
3. **Fazer login**: Acesse `/login` e faça login
4. **Recuperar senha**: Acesse `/forgot-password`
5. **Ver sessões**: Acesse `/settings/sessions`

## 5. Estrutura de Dados

### Tabela `users`
- `id` (UUID) - ID único do usuário
- `email` (TEXT) - Email único
- `username` (TEXT) - Username único
- `full_name` (TEXT) - Nome completo
- `password_hash` (TEXT) - Hash da senha (bcrypt)
- `email_verified` (BOOLEAN) - Status de verificação
- `email_verification_token` (TEXT) - Token de verificação
- `email_verification_expires` (TIMESTAMPTZ) - Expiração do token
- `password_reset_token` (TEXT) - Token de recuperação
- `password_reset_expires` (TIMESTAMPTZ) - Expiração do token
- `avatar_url` (TEXT) - URL do avatar
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Última atualização

### Tabela `login_sessions`
- `id` (UUID) - ID único da sessão
- `user_id` (UUID) - Referência ao usuário
- `device_id` (TEXT) - ID do dispositivo
- `device_info` (JSONB) - Informações do dispositivo
- `created_at` (TIMESTAMPTZ) - Data de criação
- `last_active_at` (TIMESTAMPTZ) - Última atividade
- `is_active` (BOOLEAN) - Status da sessão

## 6. Segurança (RLS)

As políticas Row Level Security estão configuradas:

- ✅ Usuários só podem ler/atualizar seus próprios dados
- ✅ Qualquer um pode criar uma conta (signup)
- ✅ Usuários só podem gerenciar suas próprias sessões

## 7. Próximos Passos

Após o setup básico, considere:

1. **Autenticação Nativa do Supabase**: Migrar para `supabase.auth` em vez de JWT customizado
2. **Storage**: Configurar Supabase Storage para avatares e imagens
3. **Realtime**: Usar Supabase Realtime para notificações
4. **Edge Functions**: Criar funções serverless para lógica complexa

## Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env.local` existe e tem as variáveis corretas
- Reinicie o servidor de desenvolvimento (`pnpm dev`)

### Erro: "relation does not exist"
- Execute a migration SQL no Supabase Dashboard
- Verifique se está no projeto correto

### Erro: "permission denied"
- Verifique as políticas RLS no Supabase
- Certifique-se de que as policies foram criadas corretamente

## Suporte

Para mais informações, consulte:
- [Documentação do Supabase](https://supabase.com/docs)
- [README_SUPABASE.md](./README_SUPABASE.md)

