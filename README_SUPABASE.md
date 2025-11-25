# Integração Supabase

Este projeto está configurado para usar o Supabase como banco de dados.

## Configuração

As variáveis de ambiente já estão configuradas no arquivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://tcfypdzedtibmngmazbn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Setup do Banco de Dados

### 1. Execute a Migration

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Execute o SQL do arquivo `lib/supabase/migrations/001_initial_schema.sql`

Este SQL criará:
- Tabela `users` - Armazena informações dos usuários
- Tabela `login_sessions` - Armazena sessões de login
- Índices para performance
- Row Level Security (RLS) policies
- Triggers para atualização automática de timestamps

### 2. Verifique as Policies

As políticas RLS (Row Level Security) estão configuradas para:
- Usuários podem ler/atualizar apenas seus próprios dados
- Qualquer um pode criar uma conta (signup)
- Usuários podem gerenciar apenas suas próprias sessões

### 3. Teste a Integração

Após executar a migration, você pode testar:
- Criar uma conta em `/signup`
- Fazer login em `/login`
- Recuperar senha em `/forgot-password`
- Verificar email em `/verify-email`
- Ver sessões ativas em `/settings/sessions`

## Estrutura

### Clientes Supabase

- `lib/supabase/client.ts` - Cliente para uso no browser (Client Components)
- `lib/supabase/server.ts` - Cliente para uso no servidor (API routes, Server Components)

### Database Layer

- `lib/db/users-supabase.ts` - Funções de acesso ao banco usando Supabase
- Substitui o `lib/db/users.ts` (banco simulado em memória)

### Migrations

- `lib/supabase/migrations/001_initial_schema.sql` - Schema inicial

## Próximos Passos

1. **Autenticação do Supabase**: Considere usar a autenticação nativa do Supabase em vez de JWT customizado
2. **Storage**: Use o Supabase Storage para avatares e imagens
3. **Realtime**: Use o Supabase Realtime para notificações em tempo real
4. **Edge Functions**: Use Supabase Edge Functions para lógica serverless

## Notas

- O sistema ainda usa JWT customizado para sessões, mas os dados estão no Supabase
- Em produção, considere usar a autenticação nativa do Supabase para melhor segurança
- As senhas são hasheadas com bcrypt antes de serem armazenadas
- Os tokens são hasheados antes de serem armazenados no banco

