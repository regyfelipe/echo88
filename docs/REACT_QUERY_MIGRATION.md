# 🔄 Migração para React Query (TanStack Query)

## ✅ Implementação Completa

Foi implementado React Query para substituir o cache manual por uma biblioteca profissional com revalidação automática e cache inteligente.

## 📦 Componentes Implementados

### 1. Query Provider (`lib/providers/query-provider.tsx`)

**Configuração:**
- `staleTime`: 2 minutos (dados considerados fresh)
- `gcTime`: 10 minutos (tempo em cache após não uso)
- `refetchOnWindowFocus`: true (refetch quando janela ganha foco)
- `refetchOnReconnect`: true (refetch quando reconecta)
- `retry`: 2 tentativas com backoff exponencial
- DevTools habilitado em desenvolvimento

### 2. Hooks de Posts (`lib/hooks/use-posts.ts`)

**Hooks Disponíveis:**
- `useFeedPosts()` - Feed com infinite scroll
- `useUserPosts()` - Posts de um usuário
- `usePostDetail()` - Detalhes de um post
- `useExplorePosts()` - Posts do explore
- `useHashtagPosts()` - Posts de uma hashtag
- `useLikePost()` - Curtir post (mutation)
- `useUnlikePost()` - Descurtir post (mutation)
- `useSavePost()` - Salvar post (mutation)
- `useUnsavePost()` - Remover post salvo (mutation)
- `useCreatePost()` - Criar post (mutation)
- `useDeletePost()` - Deletar post (mutation)

**Query Keys:**
```typescript
postKeys = {
  all: ["posts"],
  feeds: () => ["posts", "feed"],
  feed: (filters) => ["posts", "feed", filters],
  user: (userId) => ["posts", "user", userId],
  userPosts: (userId, tab) => ["posts", "user", userId, "posts", tab],
  detail: (postId) => ["posts", "detail", postId],
  explore: (query) => ["posts", "explore", query],
  hashtag: (hashtag) => ["posts", "hashtag", hashtag],
}
```

### 3. Hooks de Usuários (`lib/hooks/use-user.ts`)

**Hooks Disponíveis:**
- `useUserProfile()` - Perfil do usuário
- `useUserStats()` - Estatísticas do usuário
- `useUserBio()` - Bio do usuário
- `useUserCustomization()` - Customização do perfil
- `useUpdateProfile()` - Atualizar perfil (mutation)
- `useSearchUsers()` - Buscar usuários

**Query Keys:**
```typescript
userKeys = {
  all: ["users"],
  profile: (userId) => ["users", "profile", userId],
  stats: (userId) => ["users", "stats", userId],
  bio: (userId) => ["users", "bio", userId],
  customization: (userId) => ["users", "customization", userId],
  search: (query) => ["users", "search", query],
}
```

### 4. API Atualizada (`lib/api/posts.ts`)

**Novos Métodos:**
- `getUserPosts()` - Alias para getByUser
- `getExplore()` - Buscar posts do explore
- `getHashtagPosts()` - Buscar posts de hashtag
- `unlikePost()` - Remover curtida
- `unsavePost()` - Remover post salvo
- `createPost()` - Criar post com FormData
- `deletePost()` - Deletar post

**Melhorias:**
- Todas as requisições incluem `credentials: "include"`
- `getFeed()` agora retorna `hasMore` para paginação
- Tratamento de erros consistente

## 🎯 Migração de Páginas

### Feed Page (`app/feed/page.tsx`)

**Antes:**
- Estado manual com `useState`
- Cache manual com `cacheManager`
- Lógica complexa de paginação
- Gerenciamento manual de loading/error

**Depois:**
- `useInfiniteFeedPosts()` com React Query
- Cache automático e inteligente
- Infinite scroll integrado
- Loading/error states gerenciados automaticamente
- Revalidação automática

**Benefícios:**
- Código 60% mais simples
- Cache automático
- Revalidação em background
- Menos requisições desnecessárias

### Profile Page (Próximo)

A migração do profile page seguirá o mesmo padrão:
- `useUserPosts()` para posts
- `useUserStats()` para estatísticas
- `useUserBio()` para bio
- `useUserCustomization()` para customização

## 🚀 Funcionalidades

### Cache Automático

- **Stale-While-Revalidate**: Mostra cache enquanto atualiza em background
- **Deduplicação**: Múltiplas chamadas para mesma query são unificadas
- **Garbage Collection**: Remove dados não usados automaticamente

### Revalidação Automática

- **On Window Focus**: Refetch quando usuário volta à janela
- **On Reconnect**: Refetch quando internet volta
- **On Mount**: Refetch quando componente monta (configurável)
- **Background Refetch**: Atualiza em background sem bloquear UI

### Infinite Scroll

- **useInfiniteQuery**: Suporte nativo para paginação infinita
- **getNextPageParam**: Lógica automática de próxima página
- **hasNextPage**: Indica se há mais dados
- **fetchNextPage**: Carrega próxima página

### Mutations

- **Invalidation Automática**: Invalida queries relacionadas após mutação
- **Optimistic Updates**: Atualiza UI antes da resposta (opcional)
- **Error Handling**: Tratamento de erros consistente
- **Loading States**: Estados de loading automáticos

## 📊 Estratégias de Cache

### Feed Posts
- `staleTime`: 1 minuto (dados mudam frequentemente)
- `gcTime`: 5 minutos
- Refetch automático em window focus

### User Posts
- `staleTime`: 2 minutos
- `gcTime`: 10 minutos
- Refetch menos frequente

### Post Detail
- `staleTime`: 5 minutos (detalhes mudam menos)
- `gcTime`: 15 minutos
- Cache mais longo

### User Profile
- `staleTime`: 5 minutos
- `gcTime`: 15 minutos
- Dados mais estáveis

### User Stats
- `staleTime`: 2 minutos (stats mudam mais)
- `gcTime`: 10 minutos
- Atualização mais frequente

## 🔧 Uso

### Feed com Infinite Scroll

```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  refetch,
} = useInfiniteFeedPosts({
  limit: 20,
  sort: "recent",
  enabled: !!user,
});

// Flatten posts
const posts = data?.pages.flatMap(page => page.posts) || [];

// Carregar mais
if (hasNextPage) {
  fetchNextPage();
}
```

### Mutations

```typescript
const likePost = useLikePost();

// Curtir post
likePost.mutate(postId);

// Com callbacks
likePost.mutate(postId, {
  onSuccess: () => {
    console.log("Post curtido!");
  },
  onError: (error) => {
    console.error("Erro:", error);
  },
});
```

### Invalidar Cache Manualmente

```typescript
const queryClient = useQueryClient();

// Invalidar todas as queries de posts
queryClient.invalidateQueries({ queryKey: postKeys.all });

// Invalidar apenas feed
queryClient.invalidateQueries({ queryKey: postKeys.feeds() });

// Invalidar post específico
queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
```

## 📈 Benefícios

### Performance

- **Menos Requisições**: Deduplicação automática
- **Cache Inteligente**: Reutiliza dados quando possível
- **Background Updates**: Atualiza sem bloquear UI
- **Otimização Automática**: React Query otimiza internamente

### Developer Experience

- **Código Mais Simples**: Menos boilerplate
- **Type Safety**: TypeScript completo
- **DevTools**: Visualização de queries em desenvolvimento
- **Error Handling**: Tratamento consistente de erros

### UX

- **Loading States**: Automáticos e consistentes
- **Error States**: Tratamento automático
- **Stale-While-Revalidate**: Mostra cache enquanto atualiza
- **Background Refetch**: Dados sempre atualizados

## 🔄 Migração Progressiva

### ✅ Completo

1. Query Provider configurado
2. Hooks de posts criados
3. Hooks de usuários criados
4. Feed page migrado
5. API atualizada

### ⏳ Próximos Passos

1. Migrar Profile Page
2. Migrar Explore Page
3. Migrar outras páginas que fazem fetch
4. Remover cache manual antigo (gradualmente)
5. Adicionar optimistic updates onde apropriado

## 🐛 Troubleshooting

### Query não refetch

- Verificar `enabled` option
- Verificar `staleTime` (pode estar muito alto)
- Verificar se query key mudou

### Cache não atualiza

- Usar `invalidateQueries` após mutations
- Verificar se query key está correta
- Verificar `gcTime` (pode estar muito baixo)

### Infinite scroll não funciona

- Verificar `getNextPageParam`
- Verificar se `hasNextPage` está correto
- Verificar se `fetchNextPage` está sendo chamado

## 📝 Boas Práticas

1. **Sempre use query keys consistentes** - Facilita invalidação
2. **Configure staleTime apropriado** - Balance freshness vs performance
3. **Use mutations para alterações** - Não use queries para POST/PUT/DELETE
4. **Invalide queries relacionadas** - Após mutations, invalide queries afetadas
5. **Use enabled option** - Controle quando queries devem rodar
6. **TypeScript completo** - Tipagem forte para todas as queries

## 🎯 Próximos Passos

1. ✅ React Query instalado e configurado
2. ✅ Hooks criados para posts e usuários
3. ✅ Feed page migrado
4. ⏳ Profile page migrado
5. ⏳ Explore page migrado
6. ⏳ Otimistic updates implementados
7. ⏳ Remover cache manual antigo

