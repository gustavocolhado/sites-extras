# Sistema de Domínios Múltiplos

Este sistema permite que o aplicativo funcione com múltiplos domínios, cada um com sua própria configuração de branding, SEO e aparência.

## Domínios Configurados

O sistema suporta os seguintes domínios:

1. **confissoesdecorno.com** - Confissões de Corno
2. **cornofilmando.com** - Corno Filmando
3. **cornomanso.com.br** - Corno Manso
4. **cornoplay.com** - Corno Play
5. **cornosbrasil.com** - Cornos Brasil (padrão)
6. **cornostv.com** - Cornos TV
7. **cornosvip.com** - Cornos VIP
8. **cornotube.com** - Corno Tube
9. **cornovideos.com** - Corno Videos
10. **esposadecorno.com** - Esposa de Corno
11. **esposagozando.com** - Esposa Gozando
12. **esposasafada.com** - Esposa Safada
13. **maridocorno.com** - Marido Corno
14. **mulherdecorno.com** - Mulher de Corno
15. **mulherdocorno.com** - Mulher do Corno
16. **videosdecorno.com** - Videos de Corno

## Como Funciona

### 1. Configuração de Domínios

A configuração dos domínios está em `config/domains.ts`. Cada domínio tem:

```typescript
interface DomainConfig {
  name: string           // Nome amigável
  title: string         // Título da página
  description: string   // Meta description
  keywords: string[]    // Palavras-chave
  logo: string         // Caminho do logo
  favicon: string      // Caminho do favicon
  primaryColor: string // Cor primária do tema
  theme: 'dark' | 'light' // Tema
  canonical: string    // URL canônica
  ogImage: string      // Imagem para Open Graph
  siteName: string     // Nome do site
}
```

### 2. Detecção Automática

O sistema detecta automaticamente o domínio através de:

- **Cliente**: `useDomainContext()` hook
- **Servidor**: `getServerDomainConfig()` função
- **Middleware**: Headers HTTP

### 3. Componentes Atualizados

Os seguintes componentes foram atualizados para usar a configuração dinâmica:

- `Logo.tsx` - Logo específico do domínio
- `SEOHead.tsx` - Meta tags dinâmicas
- `DynamicMetadata.tsx` - Atualização de metadata no cliente


## Uso

### No Cliente (React Components)

```typescript
import { useDomainContext } from '@/contexts/DomainContext'

function MyComponent() {
  const { domainConfig, currentDomain, isLoading } = useDomainContext()
  
  if (isLoading) return <div>Carregando...</div>
  
  return (
    <div style={{ color: domainConfig.primaryColor }}>
      <h1>{domainConfig.siteName}</h1>
      <p>{domainConfig.description}</p>
    </div>
  )
}
```

### No Servidor (API Routes/Server Components)

```typescript
import { getServerDomainConfig } from '@/lib/domain'

export async function GET() {
  const domainConfig = getServerDomainConfig()
  
  return Response.json({
    siteName: domainConfig.siteName,
    title: domainConfig.title
  })
}
```

### Metadata Dinâmica

```typescript
import { generateMetadata } from '@/lib/domain'

export async function generateMetadata() {
  const domainConfig = getServerDomainConfig()
  return generateMetadata(domainConfig)
}
```

## Cores Dinâmicas

O sistema suporta cores dinâmicas através de variáveis CSS:

```css
:root {
  --primary-color: #e74c3c; /* Será sobrescrito dinamicamente */
  --primary-color-hover: #c0392b;
}
```

No Tailwind CSS:

```html
<div class="bg-domain-primary text-white">
  Botão com cor do domínio
</div>
```

## Adicionando Novos Domínios

1. Adicione a configuração em `config/domains.ts`:

```typescript
'novodominio.com': {
  name: 'Novo Domínio',
  title: 'NOVO DOMÍNIO - Descrição',
  description: 'Descrição do novo domínio...',
  keywords: ['palavra', 'chave'],
  logo: '/imgs/logo-novo.png',
  favicon: '/favicon-novo.png',
  primaryColor: '#ff0000',
  theme: 'dark',
  canonical: 'https://novodominio.com',
  ogImage: '/imgs/og-novo.jpg',
  siteName: 'NOVO DOMÍNIO'
}
```

2. Adicione os arquivos de imagem correspondentes em `public/imgs/`

3. Teste com o script: `node scripts/test-domains.js`



## Fallback

Se um domínio não estiver configurado, o sistema usa `cornosbrasil.com` como fallback padrão.

## Testes

Execute o script de teste:

```bash
node scripts/test-domains.js
```

## Estrutura de Arquivos

```
config/
  domains.ts          # Configurações dos domínios
contexts/
  DomainContext.tsx   # Contexto React para domínios
hooks/
  useDomain.ts        # Hook personalizado
lib/
  domain.ts          # Utilitários do servidor
components/
  DynamicMetadata.tsx # Metadata dinâmica
middleware.ts        # Middleware de detecção
```
