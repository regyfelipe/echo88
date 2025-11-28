# 🔄 Service Worker e Cache de Imagens

## ✅ Implementação Completa

Foi implementado um sistema completo de Service Worker para cache offline e otimização de cache de imagens com múltiplas estratégias.

## 📦 Componentes Implementados

### 1. Service Worker (`public/sw.js`)

**Estratégias de Cache:**

1. **Stale While Revalidate (Imagens)**
   - Mostra cache imediatamente
   - Atualiza em background
   - Melhor UX com carregamento instantâneo

2. **Network First (APIs)**
   - Sempre busca atualizações
   - Usa cache apenas se offline
   - Garante dados atualizados

3. **Cache First (Assets Estáticos)**
   - CSS, JS, Fonts
   - Carregamento instantâneo
   - Atualiza apenas quando necessário

4. **Network First (Genérico)**
   - Para outros recursos
   - Cache como fallback

**Recursos:**
- Cache versionado (limpeza automática de versões antigas)
- Limpeza periódica de cache expirado
- Suporte offline completo
- Preload estratégico

### 2. Utilitários de Service Worker (`lib/utils/service-worker.ts`)

- `registerServiceWorker()` - Registra o SW
- `unregisterServiceWorker()` - Remove o SW
- `clearAllCaches()` - Limpa todos os caches
- `precacheResources()` - Pre-cache recursos específicos
- `isOnline()` - Verifica status de conexão
- `onConnectionChange()` - Escuta mudanças de conexão
- `useServiceWorker()` - Hook React

### 3. Cache de Imagens (`lib/utils/image-cache.ts`)

**Estratégia Multi-Camada:**

1. **Memory Cache** (Map)
   - Acesso instantâneo
   - Limite de 50 imagens
   - LRU (Least Recently Used)

2. **IndexedDB Cache**
   - Armazenamento persistente
   - Até 100MB
   - Limpeza automática

**Recursos:**
- `getCachedImage()` - Obtém imagem do cache
- `cacheImage()` - Adiciona imagem ao cache
- `preloadAndCacheImage()` - Preload e cache
- `clearImageCache()` - Limpa todo o cache
- `getCacheStats()` - Estatísticas do cache

### 4. Componente de Registro (`components/shared/service-worker-register.tsx`)

- Registra automaticamente o SW
- Monitora status de conexão
- Integrado no layout principal

## 🎯 Integração

### Service Worker

O SW é registrado automaticamente quando o app carrega através do componente `ServiceWorkerRegister` no `app/layout.tsx`.

### Cache de Imagens

O cache de imagens é integrado no componente `OptimizedImage`, que:
1. Tenta carregar do cache primeiro
2. Preload e cache em background
3. Fallback para URL original se cache falhar

## 📊 Estratégias de Cache

### Imagens

```typescript
// Stale While Revalidate
1. Verifica cache → Retorna imediatamente se disponível
2. Busca da rede em background → Atualiza cache
3. Próxima requisição usa versão atualizada
```

### APIs

```typescript
// Network First
1. Tenta rede → Cache se sucesso
2. Se offline → Usa cache
3. Se sem cache → Retorna erro 503
```

### Assets Estáticos

```typescript
// Cache First
1. Verifica cache → Retorna se disponível
2. Se não tiver → Busca rede e cacheia
```

## 🚀 Benefícios

### Performance

- **Carregamento Instantâneo**: Imagens do cache carregam imediatamente
- **Offline Support**: App funciona sem conexão
- **Bandwidth Reduzido**: Menos requisições à rede
- **LCP Melhorado**: Largest Contentful Paint mais rápido

### UX

- **Transições Suaves**: Sem "flash" ao carregar imagens
- **Modo Offline**: Experiência contínua sem internet
- **Preload Inteligente**: Carrega antes de ser necessário

### Manutenção

- **Auto-Update**: SW atualiza automaticamente
- **Limpeza Automática**: Remove cache expirado
- **Versionamento**: Gerencia múltiplas versões

## ⚙️ Configuração

### Service Worker

O SW está em `public/sw.js` e é servido automaticamente pelo Next.js.

**Versão do Cache:**
```javascript
const CACHE_VERSION = "v1.0.0";
```

**Durações:**
```javascript
const CACHE_DURATIONS = {
  static: 7 * 24 * 60 * 60 * 1000,  // 7 dias
  images: 30 * 24 * 60 * 60 * 1000, // 30 dias
  api: 5 * 60 * 1000,               // 5 minutos
};
```

### Cache de Imagens

**Limites:**
```typescript
const MAX_MEMORY_CACHE_SIZE = 50;        // 50 imagens
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 dias
```

## 🔧 Uso Avançado

### Preload de Imagens

```typescript
import { preloadAndCacheImage } from "@/lib/utils/image-cache";

// Preload quando próximo de aparecer
useEffect(() => {
  if (isNearViewport) {
    preloadAndCacheImage(imageUrl);
  }
}, [isNearViewport, imageUrl]);
```

### Limpar Cache Manualmente

```typescript
import { clearImageCache, clearAllCaches } from "@/lib/utils";

// Limpar apenas imagens
await clearImageCache();

// Limpar tudo (incluindo SW cache)
await clearAllCaches();
```

### Estatísticas do Cache

```typescript
import { getCacheStats } from "@/lib/utils/image-cache";

const stats = await getCacheStats();
console.log(stats);
// {
//   memoryCount: 25,
//   dbCount: 150,
//   totalSize: 52428800 // bytes
// }
```

## 📈 Métricas Esperadas

- **LCP**: Melhoria de 30-50% (imagens do cache)
- **FCP**: Melhoria de 20-30% (assets em cache)
- **Bandwidth**: Redução de 40-60% (cache hits)
- **Offline Support**: 100% funcionalidade básica

## 🐛 Troubleshooting

### Service Worker não registra

- Verificar se está em HTTPS (ou localhost)
- Verificar console para erros
- Verificar se `/sw.js` está acessível

### Imagens não aparecem offline

- Verificar se imagens foram cacheadas antes
- Verificar se SW está ativo
- Verificar IndexedDB no DevTools

### Cache muito grande

- Ajustar `MAX_CACHE_SIZE` em `image-cache.ts`
- Ajustar `CACHE_DURATIONS` em `sw.js`
- Limpar cache manualmente se necessário

### SW não atualiza

- Verificar versão do cache
- Forçar atualização: `navigator.serviceWorker.getRegistration().then(r => r?.update())`
- Limpar cache do navegador

## 🔄 Manutenção Futura

### Atualizar Versão do Cache

1. Alterar `CACHE_VERSION` em `public/sw.js`
2. SW antigo será removido automaticamente
3. Novo SW será instalado

### Ajustar Estratégias

Modificar funções em `public/sw.js`:
- `handleImageRequest()` - Estratégia de imagens
- `handleApiRequest()` - Estratégia de APIs
- `handleStaticAsset()` - Estratégia de assets

### Monitorar Performance

```typescript
// Adicionar métricas
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_HIT') {
    // Registrar métrica
  }
});
```

## 📝 Boas Práticas

1. **Sempre versionar cache** ao fazer mudanças
2. **Monitorar tamanho do cache** regularmente
3. **Testar offline** após mudanças
4. **Limpar cache antigo** periodicamente
5. **Usar preload** para imagens críticas

## 🎯 Próximos Passos

1. ✅ Service Worker implementado
2. ✅ Cache de imagens multi-camada
3. ✅ Integração com OptimizedImage
4. ⏳ Adicionar métricas de cache hit/miss
5. ⏳ Implementar notificação de atualização do SW
6. ⏳ Adicionar UI para gerenciar cache

