# Sistema de Cache Profissional

## Visão Geral

Este projeto implementa um sistema de cache robusto e profissional para produção, substituindo o uso direto de `localStorage` por uma solução centralizada e otimizada.

## Características

### ✅ Versionamento de Cache
- Cache versionado para garantir compatibilidade
- Migração automática quando a versão muda
- Limpeza de cache antigo ao atualizar

### ✅ Estratégias de Cache por Tipo de Dado
- **IMMEDIATE** (2 min): Feed, posts recentes
- **SHORT** (5 min): Perfil, posts do usuário
- **MEDIUM** (15 min): Stats, listas de usuários
- **LONG** (1 hora): Configurações
- **NONE**: Sem cache (sempre buscar do servidor)

### ✅ Armazenamento Inteligente
- **localStorage**: Para dados pequenos (< 100KB)
- **IndexedDB**: Para dados grandes (> 100KB)
- Limpeza automática de cache expirado
- Gerenciamento de espaço (limite de 4MB no localStorage)

### ✅ Revalidação em Background
- Opção de revalidar dados em background
- Retorna dados antigos enquanto revalida
- Atualiza automaticamente quando novos dados chegam

### ✅ Tratamento Robusto de Erros
- Não quebra a aplicação se o cache falhar
- Fallback automático para buscar do servidor
- Logs detalhados para debugging

## Uso

### Básico

```typescript
import { cache } from "@/lib/cache/cache-manager";

// Salvar
await cache.feed.set(posts, userId);

// Ler
const posts = await cache.feed.get(userId);

// Invalidar
await cache.feed.invalidate(userId);
```

### Com Hook React

```typescript
import { useCache } from "@/hooks/use-cache";

function MyComponent() {
  const { data, isLoading, error, revalidate } = useCache(
    "my-key",
    async () => {
      const response = await fetch("/api/data");
      return response.json();
    },
    {
      strategy: CacheStrategy.SHORT,
      revalidate: true, // Revalidar em background
      revalidateOnFocus: true, // Revalidar quando a janela recebe foco
    },
    userId
  );

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return <div>{JSON.stringify(data)}</div>;
}
```

## Helpers Disponíveis

### Feed
```typescript
cache.feed.get(userId)
cache.feed.set(data, userId)
cache.feed.invalidate(userId)
```

### Posts do Usuário
```typescript
cache.userPosts.get(userId)
cache.userPosts.set(data, userId)
cache.userPosts.invalidate(userId)
```

### Stats do Usuário
```typescript
cache.userStats.get(userId)
cache.userStats.set(data, userId)
cache.userStats.invalidate(userId)
```

### Perfil do Usuário
```typescript
cache.userProfile.get(userId)
cache.userProfile.set(data, userId)
cache.userProfile.invalidate(userId)
```

### Limpar Tudo
```typescript
// Limpar cache de um usuário específico
cache.clearUser(userId);

// Limpar todo o cache
cache.clearAll();
```

## Migração de Código Antigo

### Antes
```typescript
const CACHE_KEY = "my_cache";
const CACHE_TIMESTAMP_KEY = "my_cache_timestamp";
const CACHE_DURATION = 5 * 60 * 1000;

// Salvar
localStorage.setItem(CACHE_KEY, JSON.stringify(data));
localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

// Ler
const cached = localStorage.getItem(CACHE_KEY);
const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
if (cached && timestamp) {
  const age = Date.now() - parseInt(timestamp, 10);
  if (age < CACHE_DURATION) {
    const data = JSON.parse(cached);
  }
}
```

### Depois
```typescript
import { cache } from "@/lib/cache/cache-manager";

// Salvar
await cache.set("my-key", data, { strategy: CacheStrategy.SHORT }, userId);

// Ler
const data = await cache.get("my-key", { strategy: CacheStrategy.SHORT }, userId);
```

## Benefícios

1. **Performance**: Carregamento instantâneo de dados em cache
2. **Experiência do Usuário**: Dados aparecem imediatamente, atualizam em background
3. **Economia de Banda**: Menos requisições ao servidor
4. **Robustez**: Não quebra se o cache falhar
5. **Manutenibilidade**: Código centralizado e fácil de manter
6. **Escalabilidade**: Suporta dados grandes via IndexedDB

## Configuração

### Ajustar TTL por Estratégia

Edite `lib/cache/cache-manager.ts`:

```typescript
const TTL_CONFIG: Record<CacheStrategy, number> = {
  [CacheStrategy.IMMEDIATE]: 2 * 60 * 1000, // Ajuste aqui
  [CacheStrategy.SHORT]: 5 * 60 * 1000,    // Ajuste aqui
  // ...
};
```

### Ativar Compressão (Opcional)

Para melhor compressão, instale `lz-string`:

```bash
npm install lz-string
```

E descomente as linhas de compressão em `lib/cache/cache-manager.ts`.

## Troubleshooting

### Cache não está funcionando
- Verifique se o `userId` está sendo passado corretamente
- Verifique a versão do cache no localStorage: `echo88_cache_version`
- Limpe o cache: `cache.clearAll()`

### Dados antigos aparecendo
- A versão do cache pode ter mudado
- Limpe o cache manualmente ou aguarde a migração automática

### Erro de espaço
- O sistema limpa automaticamente cache antigo
- Dados grandes (> 100KB) são movidos para IndexedDB automaticamente

