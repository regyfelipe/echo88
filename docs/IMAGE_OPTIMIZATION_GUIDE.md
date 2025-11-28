# 🖼️ Guia de Otimização de Imagens

## ✅ Implementação Completa

Foi implementado um sistema completo de otimização de imagens usando `next/image` com um componente wrapper inteligente.

## 📦 Componente `OptimizedImage`

### Localização

`components/shared/optimized-image.tsx`

### Características

1. **Fallback Automático**

   - Placeholder quando imagem falha ao carregar
   - Ícone SVG como fallback visual

2. **Lazy Loading Inteligente**

   - Carrega apenas quando visível
   - Prioridade para imagens acima da dobra

3. **Otimização Automática**

   - Conversão para WebP/AVIF
   - Redimensionamento automático
   - Compressão otimizada

4. **Error Handling Robusto**

   - Tratamento de erros de carregamento
   - Retry automático (opcional)
   - Logging de erros

5. **Performance**
   - Blur placeholder opcional
   - Transições suaves
   - Cache de imagens

## 🎯 Uso

### Básico

```typescript
import { OptimizedImage } from "@/components/shared/optimized-image";

<OptimizedImage
  src="https://example.com/image.jpg"
  alt="Descrição da imagem"
  width={500}
  height={500}
/>;
```

### Com Fill (Container Responsivo)

```typescript
<div className="relative w-full h-64">
  <OptimizedImage
    src={imageUrl}
    alt="Imagem"
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 50vw"
  />
</div>
```

### Com Prioridade (Above the Fold)

```typescript
<OptimizedImage src={heroImage} alt="Hero" fill priority quality={90} />
```

### Com Blur Placeholder

```typescript
<OptimizedImage
  src={imageUrl}
  alt="Imagem"
  fill
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>
```

## ⚙️ Configuração do Next.js

### `next.config.ts`

```typescript
images: {
  formats: ["image/avif", "image/webp"],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,
  remotePatterns: [
    {
      protocol: "https",
      hostname: "**.supabase.co",
      pathname: "/storage/v1/object/public/**",
    },
  ],
}
```

## 📊 Arquivos Atualizados

### ✅ Componentes

- `components/posts/post-card/post-media.tsx` - Todas as imagens de posts
- `components/stories/stories-bar.tsx` - Avatares de stories
- `app/profile/page.tsx` - Grid de posts do perfil
- `app/explore/page.tsx` - Grid de exploração

### ⏳ Pendentes (Próximos Passos)

- `components/posts/post-detail-modal.tsx`
- `components/posts/media-viewer.tsx`
- `components/comments/comments-section.tsx`
- `components/profile/edit-profile-modal.tsx`
- `app/messages/page.tsx`
- `app/messages/[userId]/page.tsx`
- Outros arquivos com `<img>`

## 🚀 Benefícios

### Performance

- **LCP melhorado**: Imagens otimizadas carregam mais rápido
- **Bandwidth reduzido**: Até 50% menos dados transferidos
- **Cache eficiente**: Imagens servidas do CDN

### SEO

- **Core Web Vitals**: Melhor pontuação em métricas
- **Mobile-friendly**: Imagens responsivas automáticas

### UX

- **Loading suave**: Transições de opacidade
- **Fallback visual**: Sempre mostra algo ao usuário
- **Error handling**: Não quebra a experiência

## 🔧 Manutenção Futura

### Para Adicionar Novas Imagens

1. **Sempre use `OptimizedImage`** em vez de `<img>`
2. **Defina `sizes` apropriado** para responsividade
3. **Use `priority`** apenas para imagens acima da dobra
4. **Configure `quality`** baseado no uso (70-90)

### Para Substituir Imagens Existentes

```typescript
// Antes
<img src={url} alt="..." />

// Depois
<OptimizedImage
  src={url}
  alt="..."
  fill // ou width/height
  sizes="..."
/>
```

## 📈 Métricas Esperadas

- **LCP**: Redução de 20-40%
- **Bandwidth**: Redução de 30-50%
- **Bundle Size**: Aumento mínimo (~5KB)
- **User Experience**: Melhoria significativa

## 🐛 Troubleshooting

### Imagem não aparece

- Verificar se URL está no `remotePatterns` do `next.config.ts`
- Verificar se `fill` está dentro de container com `position: relative`
- Verificar console para erros de CORS

### Imagem muito grande

- Ajustar `quality` (padrão: 85)
- Usar `sizes` apropriado
- Considerar redimensionar no servidor

### Performance não melhorou

- Verificar se está usando `next/image` (não `<img>`)
- Verificar cache do navegador
- Verificar se imagens estão sendo servidas do CDN
