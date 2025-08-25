# Scripts de Manutenção

Este diretório contém scripts úteis para manutenção do banco de dados e outras tarefas administrativas.

## Scripts Disponíveis

### test-admin-stats.js

Este script testa a API de estatísticas administrativas para verificar se todas as consultas estão funcionando corretamente. É útil para debugar problemas com o dashboard administrativo.

### test-revenue.js

Este script testa especificamente a funcionalidade de receita, verificando pagamentos, status e cálculos de receita do dia. É útil para debugar problemas com a exibição de receita no dashboard.

### populate-test-revenue.js

Este script popula o banco de dados com dados de teste de receita para verificar se o dashboard está funcionando corretamente. Cria pagamentos de teste com diferentes valores e status.

### update-vip-categories.js

Este script modifica automaticamente a categoria dos vídeos premium que estão na categoria "VIP" e têm duração menor que 2 minutos, movendo-os para a categoria "VIP Amadores".

### update-vip-categories-dry-run.js

Este script executa uma simulação completa da operação sem fazer nenhuma alteração no banco de dados. É útil para verificar quais vídeos seriam afetados antes de executar a operação real.

### test-vip-premium.js

Este script testa se existem vídeos premium na categoria VIP e mostra estatísticas sobre eles. É útil para verificar se a funcionalidade premium está funcionando corretamente.

### test-vip-amadores.js

Este script testa se existem vídeos na categoria VIP Amadores e mostra estatísticas sobre eles. É útil para verificar se a funcionalidade de escolha entre VIP e VIP Amadores está funcionando corretamente.

### populate-categories.js

Este script popula o banco de dados com categorias padrão. Cria categorias como VIP, VIP Amadores, Amador, Brasileiro, etc. É útil para ter categorias básicas funcionando no sistema.

#### O que o script faz:

1. **Busca vídeos**: Encontra todos os vídeos premium que:
   - Estão na categoria "VIP"
   - Têm duração menor que 2 minutos (120 segundos)

2. **Cria categoria**: Se a categoria "VIP Amadores" não existir, ela é criada automaticamente

3. **Atualiza vídeos**: Para cada vídeo encontrado:
   - Remove "VIP" da lista de categorias
   - Adiciona "VIP Amadores" à lista de categorias

4. **Atualiza contadores**: Recalcula e atualiza os contadores de vídeos em ambas as categorias

#### Como executar:

```bash
# Primeiro, execute a simulação para verificar o que será alterado
npm run update-vip-categories-dry-run

# Se estiver satisfeito com os resultados, execute a operação real
npm run update-vip-categories

# Testar se existem vídeos premium na categoria VIP
npm run test-vip-premium

# Testar se existem vídeos na categoria VIP Amadores
npm run test-vip-amadores

# Popular categorias padrão
npm run populate-categories

# Testar API de estatísticas administrativas
npm run test-admin-stats

# Testar funcionalidade de receita
npm run test-revenue

# Popular dados de teste de receita
npm run populate-test-revenue

# Ou diretamente com node
node scripts/update-vip-categories-dry-run.js
node scripts/update-vip-categories.js
node scripts/test-vip-premium.js
node scripts/test-vip-amadores.js
node scripts/populate-categories.js
node scripts/test-admin-stats.js
node scripts/test-revenue.js
node scripts/populate-test-revenue.js
```

#### Exemplo de saída (Simulação):

```
🔍 MODO SIMULAÇÃO - Nenhuma alteração será feita no banco de dados
🚀 Iniciando simulação de atualização de categorias VIP...
📊 Encontrados 15 vídeos VIP com duração menor que 2 minutos
✅ A categoria "VIP Amadores" já existe

📋 Vídeos que seriam atualizados:
================================================================================
1. "Título do Vídeo 1"
   Duração: 95s
   Categorias atuais: VIP, Amador, Brasileiro
   Categorias após atualização: Amador, Brasileiro, VIP Amadores

2. "Título do Vídeo 2"
   Duração: 110s
   Categorias atuais: VIP, Caseiro
   Categorias após atualização: Caseiro, VIP Amadores

📈 Resumo da simulação:
📊 Vídeos que seriam movidos: 15
📊 Total atual de vídeos na categoria VIP: 150
📊 Total atual de vídeos na categoria VIP Amadores: 10
📊 Total estimado de vídeos na categoria VIP após atualização: 135
📊 Total estimado de vídeos na categoria VIP Amadores após atualização: 25

💡 Para executar as alterações reais, use: npm run update-vip-categories
🔌 Conexão com o banco de dados fechada
🎉 Simulação concluída com sucesso!
```

#### Exemplo de saída (Execução Real):

```
🚀 Iniciando atualização de categorias VIP...
📊 Encontrados 15 vídeos VIP com duração menor que 2 minutos
✅ Vídeo "Título do Vídeo 1" atualizado: VIP → VIP Amadores (95s)
✅ Vídeo "Título do Vídeo 2" atualizado: VIP → VIP Amadores (110s)
...
📊 Atualizando contadores das categorias...

📈 Resumo da operação:
✅ Vídeos atualizados com sucesso: 15
❌ Erros encontrados: 0
📊 Total de vídeos na categoria VIP: 135
📊 Total de vídeos na categoria VIP Amadores: 25
🔌 Conexão com o banco de dados fechada
🎉 Script executado com sucesso!
```

#### Requisitos:

- Node.js instalado
- Prisma configurado e conectado ao banco de dados
- Variável de ambiente `DATABASE_URL` configurada

#### Segurança:

- O script faz backup automático das operações através de logs detalhados
- Cada operação é executada individualmente para evitar perda de dados
- Em caso de erro em um vídeo específico, o script continua com os demais

#### Observações:

- O script só modifica vídeos que são **premium** e estão na categoria **VIP**
- A duração é verificada em segundos (120 segundos = 2 minutos)
- O script preserva todas as outras categorias do vídeo, apenas substituindo "VIP" por "VIP Amadores"

## 🎯 Funcionalidade Premium VIP

Após executar os scripts de atualização de categorias, a página inicial foi modificada para oferecer uma experiência especial para usuários premium:

### Para Usuários Premium:
- **Vídeos Exclusivos**: Veem apenas vídeos das categorias VIP ou VIP Amadores
- **Escolha de Categoria**: Podem alternar entre "VIP" e "VIP Amadores" usando botões
- **Conteúdo Aleatório**: Os vídeos são sempre exibidos de forma aleatória
- **Interface Especial**: Título alterado para "VIDEOS [CATEGORIA] ALEATÓRIOS"
- **Indicador Visual**: Badge "✨ Conteúdo VIP exclusivo"
- **Mensagem de Boas-vindas**: Banner especial na página inicial
- **Vídeos Aleatórios**: Vídeos são exibidos de forma aleatória ao carregar a página
- **Sem Anúncios**: Não veem anúncios na página de vídeo
- **Indicador "Sem Anúncios"**: Badge especial na página de vídeo

### Para Usuários Não Premium:
- **Vídeos Aleatórios**: Veem vídeos mistos (gratuitos + alguns premium) aleatórios ao carregar a página
- **Indicador Visual**: Badge "🎲 Vídeos sempre aleatórios"
- **Banner de Upgrade**: Vêem o banner para se tornarem premium

### Como Funciona:
1. O sistema verifica automaticamente se o usuário é premium
2. Se premium, força o filtro para "random" e permite escolher entre categoria "VIP" ou "VIP Amadores"
3. Se não premium, força o filtro para "random" para sempre exibir vídeos aleatórios
4. A API filtra os vídeos adequadamente baseado no status do usuário e categoria escolhida
5. Os botões permitem alternar entre as categorias VIP em tempo real
6. **Vídeos Aleatórios**: Os vídeos são exibidos de forma aleatória ao carregar a página

## 🎲 Funcionalidade de Vídeos Aleatórios

### Características:
- **Aleatoriedade**: Vídeos são exibidos de forma aleatória ao carregar a página
- **Cache Inteligente**: O sistema usa cache para evitar carregamentos desnecessários
- **Funciona para Todos**: Tanto usuários premium quanto não premium
- **Performance**: Não há intervalos automáticos, apenas ao carregar a página

### Benefícios:
- **Conteúdo Variado**: Usuários veem vídeos diferentes a cada visita
- **Descoberta**: Permite que usuários descubram novos vídeos
- **Performance**: Menos requisições ao servidor
- **Experiência Estável**: Vídeos não mudam durante a navegação

## 🚫 Funcionalidade de Anúncios para Premium

### Características:
- **Ocultação Automática**: Usuários premium não veem anúncios na página de vídeo
- **Indicador Visual**: Badge "✨ Sem anúncios" na seção de informações
- **Anúncios Afetados**: Todos os anúncios da página de vídeo são ocultados
- **Layout Responsivo**: Funciona em desktop e mobile

### Anúncios Ocultados:
- **Mobile**: Anúncio 300x100 acima do vídeo
- **Mobile**: Anúncio 300x250 abaixo das informações
- **Desktop**: Anúncio 728x90 abaixo do vídeo
- **Desktop**: Sidebar com 3 anúncios 300x250

### Benefícios:
- **Experiência Limpa**: Usuários premium têm experiência sem interrupções
- **Valor Agregado**: Benefício adicional para assinantes premium
- **Incentivo**: Motiva usuários a se tornarem premium
- **Performance**: Menos elementos para carregar

## 🎛️ Funcionalidade de Escolha VIP

### Botões de Categoria:
- **VIP**: Mostra vídeos premium da categoria VIP (vídeos com duração >= 2 minutos)
- **VIP AMADORES**: Mostra vídeos premium da categoria VIP Amadores (vídeos com duração < 2 minutos)

### Interface:
- Botões destacados com cores diferentes (vermelho para ativo, cinza para inativo)
- Título dinâmico que muda conforme a categoria selecionada
- Transição suave entre categorias
- Reset automático para primeira página ao trocar categoria

### Experiência do Usuário:
- Clicar em "VIP" mostra vídeos VIP tradicionais
- Clicar em "VIP AMADORES" mostra vídeos VIP de duração menor
- Ambos os modos exibem vídeos aleatórios ao carregar a página
- Interface responsiva funciona em todos os dispositivos

## 📂 Página de Categorias

A página de categorias foi criada para permitir que os usuários naveguem por diferentes tipos de conteúdo:

### Funcionalidades:
- **Lista de Categorias**: Mostra todas as categorias disponíveis com contadores
- **Navegação por Slug**: URLs amigáveis como `/categories/vip`, `/categories/amador`
- **Filtros de Vídeo**: Cada categoria tem seus próprios filtros (recentes, populares, curtidos)
- **Suporte Premium**: Usuários premium veem conteúdo aleatório nas categorias
- **SEO Otimizado**: Meta tags específicas para cada categoria

### Estrutura de Arquivos:
- `app/categories/page.tsx` - Página principal de categorias
- `app/categories/[slug]/page.tsx` - Página dinâmica de categoria específica
- `app/api/categories/route.ts` - API pública para buscar categorias

### Como Usar:
1. Execute `npm run populate-categories` para criar categorias padrão
2. Acesse `/categories` para ver todas as categorias
3. Clique em uma categoria para ver os vídeos
4. Use os filtros para organizar os vídeos

### Categorias Padrão:
- VIP, VIP Amadores, Amador, Brasileiro, Caseiro
- Corno, Anal, Oral, Trio, Gangbang
- Lesbico, Gay, Trans, Fetiche, BDSM

## 🎯 Página de Campanha (/c)

A página de campanha foi criada para capturar leads e converter visitantes em assinantes premium:

### Funcionalidades:
- **Landing Page Completa**: Design atrativo com vídeo de fundo e chamadas para ação
- **Captura de Campanha**: Rastreia automaticamente dados de campanha (UTM, referrer, etc.)
- **Logo Clicável**: Logo no header e footer redireciona para a página inicial
- **Botões de Ação**: 
  - "ASSINAR AGORA" - Leva para o processo de assinatura premium
  - "Acesse nosso conteúdo grátis" - Redireciona para a página inicial
- **Seção para Usuários Logados**: Interface especial para usuários já cadastrados
- **FAQ Interativo**: Perguntas frequentes com animações
- **Design Responsivo**: Funciona perfeitamente em desktop e mobile

### Estrutura de Arquivos:
- `app/c/page.tsx` - Página de campanha
- `components/LandingPage.tsx` - Componente principal da landing page

### Como Usar:
1. Acesse `/c` para ver a página de campanha
2. Use parâmetros UTM para rastrear campanhas: `/c?utm_source=facebook&utm_campaign=blackfriday`
3. Os botões permitem escolher entre assinar premium ou acessar conteúdo grátis
4. Usuários logados veem interface especial com status da conta

### Benefícios:
- **Conversão**: Design otimizado para conversão de visitantes
- **Rastreamento**: Captura automática de dados de campanha
- **Flexibilidade**: Duas opções claras para o usuário
- **Experiência**: Interface adaptada ao status do usuário

## 🏢 Dashboard Administrativo

O dashboard administrativo foi criado para fornecer uma visão completa do sistema para administradores:

### Funcionalidades:
- **Estatísticas do Dia**: Métricas em destaque para o dia atual
  - Usuários cadastrados hoje
  - Receita de assinaturas do dia
  - Usuários ativos que acessaram o site hoje
  - Visualizações de vídeos no dia
- **Estatísticas Gerais**: Visão geral de todo o sistema
- **Atividade Recente**: Log de atividades do sistema
- **Vídeos Populares**: Ranking dos vídeos mais vistos
- **Design Responsivo**: Interface adaptada para todos os dispositivos

### Estrutura de Arquivos:
- `app/admin/page.tsx` - Dashboard principal
- `app/api/admin/stats/route.ts` - API de estatísticas
- `app/api/admin/recent-activity/route.ts` - API de atividades recentes

### Como Usar:
1. Acesse `/admin` com uma conta de administrador (access: 1)
2. Visualize as estatísticas do dia em destaque no topo
3. Analise as estatísticas gerais do sistema
4. Monitore atividades recentes e vídeos populares

### Métricas Disponíveis:
- **Hoje**: Usuários novos, receita, usuários ativos, visualizações
- **Geral**: Total de usuários, vídeos, visualizações, receita, likes, etc.
- **Tempo Real**: Atividades recentes do sistema

### Benefícios:
- **Visão Clara**: Estatísticas do dia em destaque
- **Monitoramento**: Acompanhamento em tempo real
- **Decisões**: Base de dados para tomada de decisões
- **Performance**: Interface otimizada e responsiva

### Problemas Corrigidos:
- **Campo de Data**: Corrigido uso de `transactionDate` em vez de `created_at` para pagamentos
- **Campo de Atualização**: Corrigido uso de `updated_at` em vez de `update_at` para vídeos
- **Consultas Otimizadas**: Todas as consultas agora usam os campos corretos do schema
- **Teste Automatizado**: Script `test-admin-stats.js` para verificar funcionamento
