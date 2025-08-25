# CNN AMADOR - Site Adulto

Um site adulto moderno construído com Next.js 14 e Tailwind CSS, inspirado no layout mostrado nas imagens.

## Características

- 🎨 Design dark theme moderno
- 📱 Layout responsivo
- ⚡ Next.js 14 com App Router
- 🎯 Tailwind CSS para estilização
- 🔍 Barra de busca funcional
- 📋 Menu lateral responsivo
- 🏷️ Seção de tags mais buscadas
- 🎥 Grid de vídeos com cards
- 🎭 Ícones do Lucide React
- 🔞 Verificação de idade obrigatória
- 🛡️ Proteção para menores de 18 anos

## Tecnologias Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Ícones
- **PostCSS** - Processamento CSS

## Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd cornosbrasilnew
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter

## Estrutura do Projeto

```
cornosbrasilnew/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── TrendingTags.tsx
│   ├── VideoCard.tsx
│   └── VideoSection.tsx
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── tsconfig.json
```

## Componentes

### Header
- Logo CNN AMADOR
- Barra de busca
- Navegação principal
- Botões de login/cadastro

### Sidebar
- Menu lateral responsivo
- Navegação por categorias
- Ícones para cada seção

### TrendingTags
- Tags mais buscadas do dia
- Destaque para "XVIDEOS ONLYFANS"

### VideoSection
- Grid de vídeos
- Filtros de ordenação
- Cards com thumbnails

### VideoCard
- Thumbnail do vídeo
- Duração
- Badges (HD, ADS)
- Labels
- Título

### AgeVerificationModal
- Modal de verificação de idade obrigatória
- Aparece na primeira visita ao site
- Armazena confirmação no localStorage
- Redireciona menores para site seguro
- Design responsivo e acessível

### AgeVerificationWrapper
- Wrapper que controla a exibição do modal
- Verifica estado no localStorage
- Mostra loading durante verificação
- Integra com o sistema de providers

## Testando a Verificação de Idade

### Para Desenvolvedores
1. **Resetar verificação**: No menu do usuário (desktop), clique em "🧪 Reset Age Check"
2. **Via console**: Execute `localStorage.removeItem("ageConfirmed")` e recarregue a página
3. **Script de teste**: Execute `node scripts/test-age-verification.js`

### Para Usuários Finais
- O modal aparece automaticamente na primeira visita
- Após confirmar, não aparece novamente (salvo no localStorage)
- Se recusar, é redirecionado para um site seguro

## Personalização

### Cores
As cores podem ser personalizadas no arquivo `tailwind.config.js`:

```javascript
colors: {
  'dark-bg': '#1a1a1a',
  'dark-card': '#2d2d2d',
  'dark-hover': '#3d3d3d',
  'accent-red': '#dc2626',
  'accent-red-hover': '#b91c1c',
  'text-primary': '#ffffff',
  'text-secondary': '#a3a3a3'
}
```

### Conteúdo
- Os vídeos podem ser modificados no componente `VideoSection.tsx`
- As tags podem ser alteradas no componente `TrendingTags.tsx`
- Os itens do menu podem ser editados no componente `Sidebar.tsx`

## Deploy

Para fazer o deploy em produção:

```bash
npm run build
npm run start
```

## Licença

Este projeto é apenas para fins educacionais e de demonstração. 

# CORNOS BRASIL - Video Player com HLS.js

Este projeto utiliza o HLS.js para reprodução de vídeos HLS, oferecendo uma experiência moderna e responsiva.

## Player com HLS.js

O componente `Player` foi atualizado para usar o HLS.js, oferecendo:

- ✅ Reprodução nativa de HLS (.m3u8)
- ✅ Fallback automático para HLS nativo quando disponível
- ✅ Suporte a MP4 e outros formatos
- ✅ Controles nativos do navegador
- ✅ Interface responsiva e moderna
- ✅ Tratamento robusto de erros

## Verificação VIP Otimizada

### 🚀 **Melhorias Implementadas:**

1. **Verificação Local**: O status premium agora é verificado usando apenas os dados da sessão do usuário
2. **Sem Chamadas API**: Eliminadas as chamadas desnecessárias para `/api/user/premium-status`
3. **Verificação de Expiração**: Inclui verificação automática da data de expiração
4. **Performance**: Redução significativa de requisições ao servidor
5. **Consistência**: Status sempre sincronizado com a sessão do usuário

### 📋 **Hooks Disponíveis:**

```typescript
// Hook completo com loading e mensagens
const { isPremium, premiumExpiresAt, message, loading } = usePremiumStatus()

// Hook simples para verificações rápidas
const isPremium = useIsPremium()

// Função utilitária para uso fora de componentes
const isPremium = checkPremiumStatus(user)
```

### 🔧 **Como Funciona:**

1. **Dados da Sessão**: O NextAuth já inclui `premium` e `expireDate` na sessão
2. **Verificação Local**: O hook verifica se `premium = true` E `expireDate > now`
3. **Atualização Automática**: Quando a sessão muda, o status é atualizado automaticamente
4. **Sem Cache**: Não há necessidade de cache manual ou limpeza

### 📊 **APIs Deprecated:**

As seguintes APIs podem ser removidas após confirmação:
- `/api/user/premium-status` - Status agora vem da sessão
- `/api/user/clear-premium-cache` - Cache não é mais necessário

## Props do Player

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `videoUrl` | `string` | - | URL do vídeo (obrigatório) |
| `poster` | `string` | - | URL da thumbnail |
| `title` | `string` | - | Título do vídeo |
| `autoPlay` | `boolean` | `false` | Reproduzir automaticamente |
| `muted` | `boolean` | `false` | Vídeo sem som |
| `loop` | `boolean` | `false` | Repetir vídeo |
| `controls` | `boolean` | `true` | Mostrar controles |
| `preload` | `'auto' \| 'metadata' \| 'none'` | `'metadata'` | Estratégia de pré-carregamento |
| `onError` | `(error: string) => void` | - | Callback de erro |
| `onLoad` | `() => void` | - | Callback de carregamento |

### Estilos Personalizados

O player HLS vem com estilos personalizados que incluem:

- Controles nativos do navegador
- Progress bar com cor personalizada (#dc2626)
- Volume slider com estilo personalizado
- Responsividade para mobile
- Compatibilidade com tema escuro

### Suporte a Formatos

- **HLS (.m3u8)**: Suporte nativo via HLS.js
- **MP4**: Suporte nativo do navegador
- **Outros formatos**: Dependem do suporte do navegador

### Configuração

O HLS.js está configurado com:

- Worker habilitado para melhor performance
- Modo de baixa latência
- Buffer de 90 segundos
- Fallback automático para HLS nativo quando disponível

## Uso Básico

```tsx
import VideoJSPlayer from '@/components/Player'

function VideoPage() {
  return (
    <VideoJSPlayer
      videoUrl="https://example.com/video.m3u8"
      poster="https://example.com/thumbnail.jpg"
      title="Meu Vídeo"
      controls={true}
      preload="metadata"
      onError={(error) => console.error('Erro:', error)}
      onLoad={() => console.log('Vídeo carregado')}
    />
  )
}
```

## Uso Avançado

```tsx
import VideoJSPlayer from '@/components/Player'

function VideoPage() {
  const handleError = (error: string) => {
    console.error('Erro no player:', error)
    // Implementar lógica de fallback
  }

  const handleLoad = () => {
    console.log('Vídeo carregado com sucesso')
    // Implementar analytics ou outras ações
  }

  return (
    <div className="max-w-4xl mx-auto">
      <VideoJSPlayer
        videoUrl={videoData.url}
        poster={videoData.thumbnail}
        title={videoData.title}
        autoPlay={false}
        muted={false}
        loop={false}
        controls={true}
        preload="metadata"
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  )
}
```

## Estrutura do Projeto

```
components/
├── Player.tsx          # Player principal com HLS.js
├── VideoCard.tsx       # Card de vídeo com verificação VIP
└── VideoSection.tsx    # Seção de vídeos

hooks/
├── usePremiumStatus.ts # Hook para verificação VIP
└── useVideos.ts        # Hook para buscar vídeos

contexts/
└── AuthContext.tsx     # Contexto de autenticação com verificação VIP
```

## Tecnologias Utilizadas

- **Next.js 14**: Framework React
- **HLS.js**: Biblioteca para reprodução HLS
- **NextAuth.js**: Autenticação e sessão
- **Prisma**: ORM para banco de dados
- **Tailwind CSS**: Estilização
- **TypeScript**: Tipagem estática

## Performance

- ✅ Verificação VIP sem chamadas API
- ✅ Cache automático da sessão
- ✅ Lazy loading de vídeos
- ✅ Otimização de imagens
- ✅ Bundle splitting automático

## Segurança

- ✅ Verificação de autenticação
- ✅ Validação de URLs
- ✅ Sanitização de dados
- ✅ Proteção contra XSS
- ✅ Rate limiting nas APIs 