# Configuração do Sistema CPA Tracking - TrafficStars

## Visão Geral

Este sistema permite rastrear conversões de campanhas CPA do TrafficStars e enviar postbacks S2S (Server-to-Server) automaticamente quando usuários convertem.

## Como Funciona

1. **Detecção de Fonte CPA**: O sistema detecta quando um usuário acessa com `source=cpa-*` na URL
2. **Armazenamento de Dados**: Os dados de tracking são salvos no localStorage/sessionStorage
3. **Conversão**: Quando o usuário faz um pagamento, o sistema:
   - Registra a conversão internamente
   - Envia postback S2S para o TrafficStars
   - Registra logs detalhados

## URLs de Exemplo

```
https://cornosbrasil.com/c?source=cpa-01&campaign=trafficstars&clickid=abc123
https://cornosbrasil.com/c?source=cpa-02&campaign=test&clickid=def456&value=29.90
```

## Configuração no TrafficStars

### 1. Configuração da Campanha

No painel do TrafficStars, configure:

- **Goal**: Lead (padrão)
- **Postback Type**: Simple
- **Postback URL**: `https://cornosbrasil.com/api/trafficstars/postback`
- **Parâmetros**:
  - `value={value}` - Valor da conversão
  - `clickid={click_id}` - ID do clique
  - `key=GODOiGyqwq6r1PxUDZTPjkyoyTeocItpUE7K` - Sua chave
  - `goalid=0` - ID do objetivo

### 2. URL Final do Postback

```
https://cornosbrasil.com/api/trafficstars/postback?value={value}&clickid={click_id}&key=GODOiGyqwq6r1PxUDZTPjkyoyTeocItpUE7K&goalid=0
```

## Estrutura do Banco de Dados

### Tabela: TrafficStarsConversion

```sql
{
  id: String (ObjectId)
  clickId: String // ID do clique do TrafficStars
  value: Float? // Valor da conversão
  price: Float? // Preço da conversão
  goalId: Int // ID do objetivo (padrão: 0)
  leadCode: String? // Código do lead
  allowDuplicates: Boolean // Permitir duplicatas
  convertedAt: DateTime // Data da conversão
  createdAt: DateTime
  updatedAt: DateTime
}
```

## APIs Disponíveis

### 1. Receber Postbacks
```
GET /api/trafficstars/postback
```

### 2. Listar Conversões
```
GET /api/trafficstars/conversions?limit=50&offset=0&clickid=abc123
```

### 3. Testar Postback
```
GET /api/trafficstars/test?clickid=test-123&value=29.90
```

## Componentes

### 1. useCPATracking Hook
```typescript
const { trackingData, isCPASource, sendConversion } = useCPATracking()
```

### 2. CPATracking Component
```tsx
<CPATracking userId={userId} onConversion={(success) => console.log(success)} />
```

## Logs e Monitoramento

O sistema gera logs detalhados:

```
🎯 CPA Tracking detectado: { source: "cpa-01", campaign: "trafficstars", clickId: "abc123" }
✅ Conversão CPA registrada com sucesso
🎯 Enviando postback para TrafficStars: https://tsyndicate.com/api/v1/cpa/action?...
✅ Postback enviado com sucesso para TrafficStars
```

## Testando o Sistema

### 1. Teste Manual
```bash
# Acesse a URL de teste
https://cornosbrasil.com/c?source=cpa-01&campaign=trafficstars&clickid=test-123

# Verifique os logs no console do navegador
# Faça um pagamento de teste
# Verifique se o postback foi enviado
```

### 2. Teste via Script
```bash
node scripts/test-cpa-tracking.js
```

### 3. Verificar Conversões
```bash
curl https://cornosbrasil.com/api/trafficstars/conversions
```

## Troubleshooting

### Problema: Postback não é enviado
- Verifique se `source=cpa-*` está na URL
- Confirme se o usuário fez o pagamento
- Verifique os logs do console

### Problema: Conversão não é registrada
- Verifique se a API `/api/trafficstars/postback` está funcionando
- Confirme se a chave do TrafficStars está correta
- Verifique os logs do servidor

### Problema: Dados de tracking perdidos
- Verifique se o localStorage/sessionStorage está funcionando
- Confirme se o usuário não limpou o cache

## Segurança

- A chave do TrafficStars é validada em todas as requisições
- Dados sensíveis são criptografados
- Logs não expõem informações pessoais
- Rate limiting implementado nas APIs

## Monitoramento

- Todas as conversões são registradas no banco de dados
- Logs detalhados para debugging
- Métricas de conversão disponíveis via API
- Alertas automáticos para falhas

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Teste as APIs manualmente
3. Confirme a configuração no TrafficStars
4. Entre em contato com o suporte técnico
