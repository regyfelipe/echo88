# 🛡️ Rate Limiting

## ✅ Implementação Completa

Foi implementado um sistema profissional de rate limiting para proteger as APIs contra abuso e garantir performance.

## 📦 Componentes Implementados

### 1. Rate Limiter (`lib/rate-limit/rate-limiter.ts`)

**Funcionalidades:**
- Suporte a múltiplas estratégias de rate limiting
- Integração com Upstash Redis (produção)
- Fallback in-memory (desenvolvimento)
- Diferentes limites por tipo de endpoint
- Headers de rate limit (X-RateLimit-*)

**Tipos de Rate Limits:**
- **Public**: 10 req/10s (login, registro)
- **Auth**: 5 req/1m (autenticação)
- **Posts**: 30 req/1m (criação, like, save)
- **Feed**: 60 req/1m (buscar feed)
- **Upload**: 10 req/1m (upload de arquivos)
- **Search**: 20 req/1m (busca)
- **Profile**: 30 req/1m (perfil)
- **Default**: 60 req/1m (outros endpoints)

### 2. Middleware (`lib/rate-limit/middleware.ts`)

**Funcionalidades:**
- Detecta automaticamente o tipo de endpoint
- Extrai User ID de cookies/headers
- Aplica rate limiting antes do handler
- Retorna 429 (Too Many Requests) quando excedido
- Headers informativos para o cliente

### 3. Rate Limit Decorator (`lib/rate-limit/rate-limit-decorator.ts`)

**Funcionalidades:**
- Wrapper para handlers de API
- Aplicação fácil em rotas individuais
- Callback customizado para quando limite é excedido
- Headers automáticos na response

### 4. Next.js Middleware (`middleware.ts`)

**Funcionalidades:**
- Aplica rate limiting globalmente
- Intercepta todas as requisições de API
- Configuração de matcher para otimização

## 🎯 Estratégias de Rate Limiting

### Por IP
- Aplicado quando usuário não está autenticado
- Baseado em `x-forwarded-for` header
- Útil para prevenir abuso de endpoints públicos

### Por User ID
- Aplicado quando usuário está autenticado
- Prioridade sobre IP
- Permite limites mais altos para usuários autenticados
- Previne abuso mesmo com múltiplos IPs

### Sliding Window
- Janela deslizante (não fixa)
- Mais preciso que fixed window
- Melhor experiência para usuários legítimos

## 📊 Headers de Rate Limit

Todas as respostas incluem headers informativos:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 2024-01-01T12:00:00Z
Retry-After: 30 (apenas quando limite excedido)
```

## 🔧 Uso

### Middleware Global

O middleware já está configurado e aplica rate limiting automaticamente em todas as rotas de API.

### Decorator em Rotas Específicas

```typescript
import { withRateLimit } from "@/lib/rate-limit/rate-limit-decorator";

export const GET = withRateLimit(
  async (request: NextRequest) => {
    // Seu handler aqui
    return NextResponse.json({ data: "..." });
  },
  {
    type: "feed", // Tipo de rate limit
    getUserId: async (req) => {
      // Lógica customizada para obter User ID
      return userId;
    },
    onLimitExceeded: async (req, retryAfter) => {
      // Response customizada quando limite excedido
      return NextResponse.json(
        { error: "Limite excedido" },
        { status: 429 }
      );
    },
  }
);
```

### Verificação Manual

```typescript
import { checkRateLimit } from "@/lib/rate-limit/rate-limiter";

const result = await checkRateLimit(request, "posts", userId);

if (!result.success) {
  return NextResponse.json(
    { error: "Too Many Requests" },
    { status: 429, headers: result.headers }
  );
}
```

## 🚀 Configuração

### Variáveis de Ambiente

Para usar Upstash Redis (recomendado para produção):

```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

Se não configurado, usa fallback in-memory (apenas para desenvolvimento).

### Ajustar Limites

Edite `RATE_LIMITS` em `lib/rate-limit/rate-limiter.ts`:

```typescript
export const RATE_LIMITS = {
  posts: {
    limit: 50, // Aumentar limite
    window: "1 m", // Janela de tempo
  },
  // ...
};
```

## 📈 Benefícios

### Segurança
- **Proteção contra DDoS**: Limita requisições por IP
- **Prevenção de abuso**: Limita ações por usuário
- **Proteção de recursos**: Evita sobrecarga do servidor

### Performance
- **Menos carga no servidor**: Limita requisições simultâneas
- **Melhor distribuição**: Evita picos de tráfego
- **Cache-friendly**: Headers permitem cache inteligente

### UX
- **Headers informativos**: Cliente sabe quando pode fazer requisições
- **Retry-After**: Cliente sabe quando tentar novamente
- **Limites razoáveis**: Não afeta usuários legítimos

## 🔍 Monitoramento

### Logs

O sistema loga quando um limite é excedido:

```
[RateLimit] Bloqueado: user123 - /api/posts/feed - Tipo: feed
```

### Métricas

Com Upstash Redis, você pode monitorar:
- Número de requisições bloqueadas
- Taxa de sucesso/falha
- Distribuição por tipo de endpoint

## 🐛 Troubleshooting

### Rate limit muito restritivo

- Ajuste os limites em `RATE_LIMITS`
- Verifique se está usando User ID (limites mais altos)
- Considere aumentar a janela de tempo

### Rate limit não funciona

- Verifique se middleware está ativo
- Verifique logs do servidor
- Teste com diferentes IPs/usuários

### Redis não conecta

- Verifique variáveis de ambiente
- Sistema usa fallback in-memory automaticamente
- Funciona, mas não persiste entre reinicializações

## 📝 Boas Práticas

1. **Use User ID quando possível** - Limites mais altos para usuários autenticados
2. **Ajuste limites por endpoint** - Endpoints críticos podem ter limites menores
3. **Monitore métricas** - Acompanhe quantas requisições são bloqueadas
4. **Comunique limites** - Use headers para informar o cliente
5. **Teste em produção** - Ajuste limites baseado em uso real

## 🎯 Próximos Passos

1. ✅ Rate limiting implementado
2. ✅ Middleware global configurado
3. ✅ Decorator para rotas específicas
4. ⏳ Integrar com Upstash Redis (produção)
5. ⏳ Dashboard de monitoramento
6. ⏳ Alertas automáticos para abuso
7. ⏳ Rate limiting adaptativo baseado em comportamento

