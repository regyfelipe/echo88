# 🎨 Echo88 - Plataforma Social Moderna

<div align="center">

![Echo88 Logo](https://via.placeholder.com/200x200/6366f1/ffffff?text=Echo88)

**Uma plataforma social moderna e completa para compartilhamento de conteúdo**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)

</div>

---

## 📖 Sobre o Projeto

**Echo88** é uma plataforma social moderna e completa, inspirada nas melhores práticas de redes sociais como Instagram, Twitter e TikTok. O projeto oferece uma experiência rica para criação, compartilhamento e descoberta de conteúdo em diversos formatos.

### 🎯 Objetivo

Criar uma plataforma social completa que permita aos usuários:
- Compartilhar conteúdo em múltiplos formatos (texto, imagens, vídeos, áudios, documentos)
- Interagir com outros usuários através de likes, comentários, compartilhamentos
- Descobrir novos conteúdos e usuários através de busca e exploração
- Gerenciar seu perfil e privacidade de forma completa
- Comunicar-se através de mensagens diretas

---

## ✨ Funcionalidades Implementadas

### 🔐 Autenticação e Segurança

- ✅ **Sistema de Login/Signup completo**
  - Login com email ou username
  - Validação de disponibilidade de username em tempo real
  - Verificação de email
  - Recuperação de senha
  - Sessões múltiplas com gerenciamento
  - Logout em todos os dispositivos
  - Histórico de sessões

### 📱 Páginas Principais

- ✅ **Feed** (`/feed`)
  - Timeline de posts com cache inteligente
  - Suporte para múltiplos tipos de conteúdo
  - Anúncios Google AdSense integrados
  - Animações suaves de entrada
  - Refresh manual

- ✅ **Explorar** (`/explore`)
  - Grid estilo Instagram (3 colunas)
  - Busca unificada (posts, usuários, hashtags)
  - Filtros por tipo de conteúdo
  - Busca em tempo real com debounce
  - Hover effects e previews

- ✅ **Criar Post** (`/create`)
  - Editor completo de posts
  - Suporte para: texto, imagem, vídeo, áudio, galeria, documento
  - Editor de imagens integrado (crop, filtros, rotação)
  - Compressão automática de imagens
  - Preview antes de publicar
  - Progress bar durante upload
  - Suporte para GIFs animados

- ✅ **Perfil** (`/profile`)
  - Layout estilo Instagram
  - Estatísticas (posts, seguidores, seguindo, visualizações)
  - Bio personalizável
  - Edição de perfil completa
  - Abas: Posts, Áudios e Documentos, Salvos, Marcados
  - Grid de posts (imagens/vídeos)
  - Lista de publicações completas (áudios/documentos)
  - Páginas de seguidores/seguindo
  - Perfil por username (`/profile/[username]`)

- ✅ **Notificações** (`/notifications`)
  - Lista de notificações em tempo real
  - Tipos: like, comment, follow, share
  - Preview de posts
  - Indicador de não lidas
  - Suporte para múltiplos usuários

- ✅ **Mensagens** (`/messages`)
  - Mensagens diretas (DM)
  - Lista de conversas
  - Sistema de leitura/não lida
  - Interface de chat completa

- ✅ **Configurações** (`/settings`)
  - Privacidade (conta privada/pública)
  - Bloqueio e silenciamento de usuários
  - Notificações personalizáveis
  - Tema claro/escuro/sistema
  - Gerenciamento de sessões
  - Download de dados (LGPD)

### 🎨 Tipos de Conteúdo

- ✅ **Texto** - Posts de texto simples
- ✅ **Imagem** - Imagens únicas com suporte a GIFs
- ✅ **Vídeo** - Vídeos com player integrado
- ✅ **Áudio** - Áudios com player e metadados (título, artista)
- ✅ **Galeria** - Múltiplas imagens/vídeos com navegação por swipe
- ✅ **Documento** - Upload e compartilhamento de documentos

### 💬 Interações Sociais

- ✅ **Sistema de Likes/Dislikes**
  - Like e dislike separados
  - Contadores em tempo real
  - Estados visuais

- ✅ **Comentários Completos**
  - Comentários em posts
  - Respostas a comentários (threads)
  - Contagem automática
  - Interface completa de comentários

- ✅ **Sistema de Seguir**
  - Seguir/deixar de seguir usuários
  - Lista de seguidores e seguindo
  - Contadores atualizados

- ✅ **Compartilhamento**
  - Compartilhar posts
  - Compartilhar para redes sociais externas
  - Embed de posts
  - Contador de compartilhamentos

- ✅ **Salvar Posts**
  - Salvar posts para ver depois
  - Lista de posts salvos
  - Estado visual

### 🔍 Busca e Descoberta

- ✅ **Busca Unificada**
  - Busca por posts, usuários e hashtags
  - Filtros por tipo
  - Busca em tempo real

- ✅ **Hashtags**
  - Extração automática de hashtags
  - Hashtags clicáveis
  - Página de hashtag (`/hashtag/[hashtag]`)
  - Hashtags trending

- ✅ **Menções**
  - Menções de usuários (@username)
  - Links clicáveis
  - Notificações de menções

### 🎨 Design e UX

- ✅ **Design System Moderno**
  - Tailwind CSS 4
  - Shadcn UI components
  - Tema claro/escuro
  - Animações suaves
  - Glassmorphism e backdrop blur

- ✅ **Responsividade Completa**
  - Mobile-first design
  - Tablet e desktop otimizados
  - Touch-friendly
  - Layouts adaptativos

- ✅ **Performance**
  - Cache inteligente (localStorage)
  - Lazy loading de imagens
  - Code splitting
  - Turbopack para builds rápidos

### 🔧 Funcionalidades Técnicas

- ✅ **Upload de Mídia**
  - Upload para Supabase Storage
  - Compressão automática
  - Validação de tipos e tamanhos
  - Progress tracking

- ✅ **Editor de Imagens**
  - Crop e redimensionamento
  - Filtros
  - Rotação
  - Zoom

- ✅ **Sistema de Cache**
  - Cache de feed
  - Cache de perfil
  - Cache de estatísticas
  - Invalidação inteligente

---

## 🛠️ Tecnologias Utilizadas

### Frontend

- **Next.js 15.5.6** - Framework React com App Router
- **React 19.1.0** - Biblioteca UI
- **TypeScript 5.0** - Tipagem estática
- **Tailwind CSS 4** - Estilização utilitária
- **Shadcn UI** - Componentes UI acessíveis
- **Radix UI** - Primitivos UI acessíveis
- **Lucide React** - Ícones
- **Hugeicons** - Biblioteca de ícones premium

### Backend

- **Next.js API Routes** - API RESTful
- **Supabase** - Banco de dados PostgreSQL
- **Supabase Storage** - Armazenamento de arquivos
- **JWT (jose)** - Autenticação e sessões
- **bcryptjs** - Hash de senhas
- **Resend** - Envio de emails

### Ferramentas

- **Turbopack** - Build tool rápido
- **ESLint** - Linter
- **TypeScript** - Type checking
- **browser-image-compression** - Compressão de imagens
- **react-image-crop** - Editor de imagens

---

## 📁 Estrutura do Projeto

```
echo88/
├── app/                    # App Router (Next.js)
│   ├── api/               # API Routes
│   │   ├── auth/         # Autenticação
│   │   ├── posts/        # Posts
│   │   ├── comments/     # Comentários
│   │   ├── users/        # Usuários
│   │   ├── follow/       # Sistema de seguir
│   │   ├── messages/     # Mensagens
│   │   ├── hashtags/     # Hashtags
│   │   └── storage/      # Upload de arquivos
│   ├── feed/             # Feed principal
│   ├── explore/          # Explorar
│   ├── create/           # Criar post
│   ├── profile/          # Perfil
│   ├── notifications/    # Notificações
│   ├── messages/         # Mensagens
│   ├── settings/         # Configurações
│   └── ...
├── components/            # Componentes React
│   ├── ui/              # Componentes UI (Shadcn)
│   ├── post-card.tsx    # Card de post
│   ├── bottom-navigation.tsx
│   └── ...
├── contexts/             # React Contexts
│   └── auth-context.tsx  # Context de autenticação
├── lib/                  # Utilitários e helpers
│   ├── supabase/        # Configuração Supabase
│   │   └── migrations/  # Migrations SQL
│   ├── auth/            # Lógica de autenticação
│   ├── storage/          # Upload de arquivos
│   └── utils/           # Funções utilitárias
└── ...
```

---

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18+ ou superior
- pnpm, npm ou yarn
- Conta no Supabase
- Conta no Resend (para emails)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/echo88.git
cd echo88
```

2. **Instale as dependências**
```bash
pnpm install
# ou
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_jwt_secret

# Resend (Email)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Execute as migrations no Supabase**

Execute os arquivos SQL em `lib/supabase/migrations/` na ordem numérica no Supabase SQL Editor.

5. **Execute o projeto**

```bash
pnpm dev
# ou
npm run dev
```

Acesse `http://localhost:3000`

---

## 📚 Documentação da API

### Autenticação

- `POST /api/auth/signup` - Criar conta
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/logout` - Fazer logout
- `GET /api/auth/me` - Obter usuário atual
- `POST /api/auth/verify-email` - Verificar email

### Posts

- `GET /api/posts/feed` - Obter feed
- `POST /api/posts/create` - Criar post
- `GET /api/posts/user/[userId]` - Posts do usuário
- `POST /api/posts/[postId]/like` - Curtir post
- `POST /api/posts/[postId]/dislike` - Não curtir post
- `POST /api/posts/[postId]/save` - Salvar post
- `POST /api/posts/[postId]/share` - Compartilhar post

### Comentários

- `GET /api/comments/[postId]` - Listar comentários
- `POST /api/comments/create` - Criar comentário
- `DELETE /api/comments/[commentId]` - Deletar comentário

### Usuários

- `GET /api/users/profile` - Obter perfil
- `PATCH /api/users/profile` - Atualizar perfil
- `GET /api/users/[userId]/stats` - Estatísticas do usuário
- `GET /api/users/[userId]/followers` - Seguidores
- `GET /api/users/[userId]/following` - Seguindo

### Mensagens

- `GET /api/messages/conversations` - Listar conversas
- `GET /api/messages/[userId]` - Mensagens com usuário
- `POST /api/messages/send` - Enviar mensagem

---

## 🎯 Roadmap e Sugestões de Implementação

### 🔜 Próximas Funcionalidades (Alta Prioridade)

- [ ] **Chat em Tempo Real**
  - Integração com Supabase Realtime
  - Notificações push
  - Indicadores de digitação

- [ ] **Stories Temporárias**
  - Stories que expiram em 24h
  - Editor de stories
  - Visualizações únicas

- [ ] **Busca Avançada**
  - Filtros por data, tipo, localização
  - Busca por localização
  - Histórico de buscas

- [ ] **Analytics para Criadores**
  - Dashboard de métricas
  - Estatísticas de engajamento
  - Melhor horário para postar

### 💡 Funcionalidades Futuras

#### 🎨 Personalização
- [ ] Temas customizáveis
- [ ] Cores personalizadas
- [ ] Capa de perfil customizável
- [ ] Bio com links clicáveis

#### 📱 Mobile
- [ ] App nativo (React Native)
- [ ] Notificações push
- [ ] Câmera integrada
- [ ] Modo offline

#### 🤖 Inteligência Artificial
- [ ] Geração automática de legendas
- [ ] Tradução automática
- [ ] Sugestões de hashtags
- [ ] Detecção de conteúdo inadequado
- [ ] Recomendações personalizadas

#### 💰 Monetização
- [ ] Sistema de assinaturas
- [ ] Doações/tips
- [ ] Produtos digitais
- [ ] Marketplace de conteúdo

#### 🌐 Internacionalização
- [ ] Múltiplos idiomas (i18n)
- [ ] Tradução automática de posts
- [ ] Formatação por região

#### 📊 Analytics Avançado
- [ ] Dashboard administrativo
- [ ] Relatórios de negócios
- [ ] Análise de audiência
- [ ] Métricas de crescimento

#### 🔄 Real-time
- [ ] WebSockets para atualizações live
- [ ] Presença online
- [ ] Atualizações em tempo real do feed

#### 🎯 Gamificação
- [ ] Sistema de pontos
- [ ] Níveis de usuário
- [ ] Conquistas e badges
- [ ] Rankings
- [ ] Desafios semanais

#### 📝 Conteúdo Avançado
- [ ] Editor de texto rico
- [ ] Polls/enquetes
- [ ] Questionários
- [ ] Eventos
- [ ] Lives/streaming

#### 🛡️ Moderação
- [ ] Sistema de reportar conteúdo
- [ ] Moderação automática
- [ ] Filtros de palavras
- [ ] Painel de moderação

#### 🔗 Integrações
- [ ] API REST pública
- [ ] Webhooks
- [ ] Integração com Spotify/Apple Music
- [ ] Integração com YouTube
- [ ] Importar de outras plataformas

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👥 Autores

- **Equipe Echo88** - Desenvolvimento inicial

---

## 🙏 Agradecimentos

- Next.js pela excelente framework
- Supabase pela infraestrutura
- Shadcn pela biblioteca de componentes
- Comunidade open source

---

## 📞 Contato

Para dúvidas, sugestões ou suporte, entre em contato através de:

- **Email**: contato@echo88.com
- **GitHub Issues**: [Abrir uma issue](https://github.com/seu-usuario/echo88/issues)

---

<div align="center">

**Feito com ❤️ pela equipe Echo88**

⭐ Se este projeto foi útil para você, considere dar uma estrela!

</div>
