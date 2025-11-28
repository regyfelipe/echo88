# Sanitização de Dados e Error Boundaries

## 📋 Visão Geral

Este documento descreve a implementação de sanitização de dados do usuário e Error Boundaries para melhorar a segurança e estabilidade da aplicação.

## 🔒 Sanitização de Dados

### Implementação

A sanitização é implementada usando `isomorphic-dompurify`, que funciona tanto no servidor quanto no cliente.

#### Arquivos Principais

- **`lib/utils/sanitize.ts`**: Utilitários de sanitização
- **`components/shared/sanitized-content.tsx`**: Componente React para renderizar conteúdo sanitizado

### Funcionalidades

#### 1. Sanitização de HTML

```typescript
import { sanitizeHtml } from "@/lib/utils/sanitize";

const safeHtml = sanitizeHtml(userContent);
```

#### 2. Sanitização de Texto

```typescript
import { sanitizeText } from "@/lib/utils/sanitize";

const safeText = sanitizeText(userContent);
```

#### 3. Sanitização Específica

- **Bio**: `sanitizeBio(bio)` - Configuração mais restritiva
- **Posts/Comentários**: `sanitizePostContent(content)` - Permite mais tags
- **URLs**: `sanitizeUrl(url)` - Valida e sanitiza URLs

#### 4. Componente React

```tsx
import { SanitizedContent } from "@/components/shared/sanitized-content";

<SanitizedContent
  content={userContent}
  type="post" // "text" | "html" | "bio" | "post"
  className="..."
/>
```

### Configurações de Segurança

#### Tags Permitidas (Padrão)
- `p`, `br`, `strong`, `em`, `u`, `s`
- `a`, `ul`, `ol`, `li`
- `blockquote`, `code`, `pre`
- `span`, `div`, `h1-h6`

#### Tags Bloqueadas
- `script`, `style`, `iframe`, `object`, `embed`, `form`, `input`

#### Atributos Permitidos
- `href`, `title`, `target`, `rel`, `class`

#### Atributos Bloqueados
- `onerror`, `onload`, `onclick`, `onmouseover`, `onfocus`, `onblur`

### Integração

#### Bio Renderer

```tsx
// components/profile/bio-renderer.tsx
import { sanitizeBio, sanitizeUrl } from "@/lib/utils/sanitize";

const sanitizedBio = sanitizeBio(bio);
const safeUrl = sanitizeUrl(url);
```

#### Post Card

```tsx
// components/posts/post-card/post-card.tsx
import { SanitizedContent } from "@/components/shared/sanitized-content";

<SanitizedContent content={content} type="post" />
```

#### Comments Section

```tsx
// components/comments/comments-section.tsx
import { sanitizePostContent } from "@/lib/utils/sanitize";

const safeContent = sanitizePostContent(comment.content);
```

## 🛡️ Error Boundaries

### Implementação

Error Boundaries são componentes React que capturam erros JavaScript em qualquer lugar da árvore de componentes filhos.

#### Arquivos Principais

- **`components/shared/error-boundary.tsx`**: Componente Error Boundary
- **`app/error.tsx`**: Página de erro do Next.js
- **`app/global-error.tsx`**: Handler de erro global

### Funcionalidades

#### 1. Error Boundary Básico

```tsx
import { ErrorBoundary } from "@/components/shared/error-boundary";

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

#### 2. Error Boundary com Callback

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error("Erro capturado:", error, errorInfo);
    // Enviar para serviço de monitoramento
  }}
>
  <YourComponent />
</ErrorBoundary>
```

#### 3. Error Boundary com Reset Keys

```tsx
<ErrorBoundary
  resetKeys={[userId, postId]}
  resetOnPropsChange={true}
>
  <YourComponent />
</ErrorBoundary>
```

#### 4. HOC para Error Boundary

```tsx
import { withErrorBoundary } from "@/components/shared/error-boundary";

const SafeComponent = withErrorBoundary(YourComponent, {
  onError: (error, errorInfo) => {
    // Tratar erro
  },
});
```

#### 5. Hook para Erros

```tsx
import { useErrorHandler } from "@/components/shared/error-boundary";

function MyComponent() {
  const handleError = useErrorHandler();
  
  const handleClick = () => {
    try {
      // Código que pode gerar erro
    } catch (error) {
      handleError(error);
    }
  };
}
```

### Características

#### Recuperação Automática
- Reset automático quando `resetKeys` mudam
- Reset automático quando props mudam (se `resetOnPropsChange` estiver habilitado)

#### Logging e Monitoramento
- Log automático de erros no console
- Armazenamento local de erros (últimos 10) para debug
- Integração preparada para serviços de monitoramento (Sentry, LogRocket, etc.)

#### UI de Erro
- Interface amigável para o usuário
- Botões para tentar novamente ou recarregar
- Detalhes do erro em modo de desenvolvimento

### Integração Global

O Error Boundary está integrado no `app/layout.tsx` para capturar erros em toda a aplicação:

```tsx
// app/layout.tsx
import { ErrorBoundary } from "@/components/shared/error-boundary";

<ErrorBoundary>
  <QueryProvider>
    <AuthProvider>
      {/* ... */}
    </AuthProvider>
  </QueryProvider>
</ErrorBoundary>
```

### Páginas de Erro do Next.js

#### `app/error.tsx`
- Captura erros em rotas específicas
- Permite reset sem recarregar a página

#### `app/global-error.tsx`
- Captura erros críticos que não foram tratados
- Requer recarregamento completo da aplicação

## 🔧 Configuração

### Variáveis de Ambiente

Nenhuma variável de ambiente adicional é necessária. A sanitização e Error Boundaries funcionam automaticamente.

### Dependências

```json
{
  "isomorphic-dompurify": "^2.33.0"
}
```

## 📊 Benefícios

### Segurança
- ✅ Prevenção de XSS (Cross-Site Scripting)
- ✅ Sanitização de URLs maliciosas
- ✅ Remoção de scripts e eventos perigosos

### Estabilidade
- ✅ Captura de erros não tratados
- ✅ Prevenção de crashes da aplicação
- ✅ Recuperação automática de erros

### Experiência do Usuário
- ✅ Mensagens de erro amigáveis
- ✅ Opções de recuperação
- ✅ Logging para debug

## 🚀 Uso Recomendado

### Sanitização

1. **Sempre sanitize conteúdo do usuário antes de renderizar**
2. **Use o tipo apropriado** (`bio`, `post`, `text`, `html`)
3. **Sanitize URLs antes de usar em links**

### Error Boundaries

1. **Use Error Boundaries em componentes críticos**
2. **Configure callbacks para monitoramento**
3. **Use reset keys para recuperação automática**

## 📝 Exemplos

### Exemplo 1: Sanitizar Bio

```tsx
import { sanitizeBio } from "@/lib/utils/sanitize";

const safeBio = sanitizeBio(user.bio);
```

### Exemplo 2: Renderizar Post Sanitizado

```tsx
import { SanitizedContent } from "@/components/shared/sanitized-content";

<SanitizedContent
  content={post.content}
  type="post"
  className="post-content"
/>
```

### Exemplo 3: Error Boundary com Monitoramento

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Enviar para Sentry
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }}
>
  <CriticalComponent />
</ErrorBoundary>
```

## 🔍 Debugging

### Ver Erros Armazenados

```javascript
// No console do navegador
JSON.parse(localStorage.getItem("errorLog") || "[]")
```

### Testar Sanitização

```typescript
import { containsDangerousHtml } from "@/lib/utils/sanitize";

const isDangerous = containsDangerousHtml(userContent);
if (isDangerous) {
  console.warn("Conteúdo perigoso detectado!");
}
```

## 📚 Referências

- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js Error Handling](https://nextjs.org/docs/app/api-reference/file-conventions/error)

