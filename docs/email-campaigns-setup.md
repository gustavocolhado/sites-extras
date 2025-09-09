# 📧 Configuração de Campanhas de Email - Amazon SES

## 🚀 Configuração Inicial

### 1. Configurar Amazon SES

1. **Criar conta AWS** (se não tiver)
2. **Acessar Amazon SES** no console AWS
3. **Verificar domínio de envio**:
   ```bash
   # Verificar status do domínio
   aws ses get-identity-verification-attributes --identities yourdomain.com
   ```

4. **Configurar variáveis de ambiente**:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_access_key_here
   AWS_SECRET_ACCESS_KEY=your_secret_key_here
   SES_FROM_EMAIL=noreply@yourdomain.com
   SES_FROM_NAME=Your Site Name
   ```

### 2. Configurar Permissões IAM

Crie uma política IAM com as seguintes permissões:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail",
        "ses:SendBulkTemplatedEmail",
        "ses:GetSendQuota",
        "ses:GetSendStatistics"
      ],
      "Resource": "*"
    }
  ]
}
```

## 💰 Otimização de Custos

### Estratégias Implementadas

1. **Envio em Batches**:
   - Máximo 50 emails por batch (limite do SES)
   - Delay de 1 segundo entre batches
   - Processamento paralelo limitado

2. **Rate Limiting**:
   - Máximo 14 emails por segundo (sandbox)
   - Controle de quota diária
   - Monitoramento de bounces

3. **Segmentação Inteligente**:
   - Apenas usuários que aceitam emails promocionais
   - Filtros por status premium
   - Limite configurável por campanha

### Cálculo de Custos

```
Custo por email: $0.0001 (região us-east-1)
Custo por 1000 emails: $0.10
Custo por 10.000 emails: $1.00
```

## 📊 Monitoramento

### Métricas Importantes

1. **Taxa de Entrega**: > 95%
2. **Taxa de Bounce**: < 5%
3. **Taxa de Reclamação**: < 0.1%
4. **Taxa de Abertura**: 15-25%
5. **Taxa de Clique**: 2-5%

### Scripts de Monitoramento

```bash
# Verificar status do SES
node scripts/email-campaign-optimizer.js

# Monitorar quota
aws ses get-send-quota

# Verificar estatísticas
aws ses get-send-statistics
```

## 🎯 Templates de Email

### Templates Disponíveis

1. **Premium Upgrade**: Oferta de desconto para upgrade
2. **Reactivation**: Reativação de usuários inativos
3. **New Content**: Notificação de conteúdo novo

### Personalização

Use as seguintes variáveis nos templates:
- `{{name}}`: Nome do usuário
- `{{email}}`: Email do usuário
- `{{userId}}`: ID do usuário
- `{{unsubscribeUrl}}`: URL para cancelar inscrição

## 🔧 Uso da API

### Enviar Campanha

```javascript
const response = await fetch('/api/admin/campaigns/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    subject: 'Assunto do email',
    htmlBody: '<h1>Conteúdo HTML</h1>',
    textBody: 'Conteúdo texto',
    targetAudience: 'non-premium', // 'non-premium', 'premium', 'all'
    limit: 1000
  })
})
```

### Cancelar Inscrição

```javascript
// GET
const response = await fetch('/api/unsubscribe?email=user@example.com')

// POST
const response = await fetch('/api/unsubscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email: 'user@example.com' })
})
```

## 🛡️ Boas Práticas

### Compliance

1. **CAN-SPAM Act**:
   - Incluir endereço físico
   - Fornecer opção de cancelamento
   - Identificar como publicidade

2. **LGPD**:
   - Consentimento explícito
   - Opção de cancelamento fácil
   - Transparência no uso dos dados

### Otimização

1. **Horários de Envio**:
   - Terça a quinta: 10h-14h
   - Evitar segundas e sextas
   - Testar horários específicos

2. **Frequência**:
   - Máximo 2-3 emails por semana
   - Respeitar preferências do usuário
   - Segmentar por engajamento

## 🚨 Troubleshooting

### Problemas Comuns

1. **Quota Excedida**:
   ```bash
   # Verificar quota
   aws ses get-send-quota
   
   # Solicitar aumento
   aws sesv2 put-account-sending-enabled --enabled true
   ```

2. **Emails em Sandbox**:
   ```bash
   # Sair do sandbox
   aws sesv2 put-account-sending-enabled --enabled true
   ```

3. **Bounces Altos**:
   - Verificar lista de emails
   - Implementar validação
   - Limpar emails inválidos

### Logs e Debugging

```bash
# Verificar logs do SES
aws logs describe-log-groups --log-group-name-prefix /aws/ses

# Monitorar em tempo real
aws ses get-send-statistics --start-date 2024-01-01 --end-date 2024-01-02
```

## 📈 Próximos Passos

1. **Implementar A/B Testing**
2. **Personalização Dinâmica**
3. **Automação de Campanhas**
4. **Integração com Analytics**
5. **Sistema de Feedback**

## 🔗 Links Úteis

- [Amazon SES Documentation](https://docs.aws.amazon.com/ses/)
- [SES Pricing](https://aws.amazon.com/ses/pricing/)
- [SES Best Practices](https://docs.aws.amazon.com/ses/latest/dg/best-practices.html)
- [CAN-SPAM Act](https://www.ftc.gov/tips-advice/business-center/guidance/can-spam-act-compliance-guide-business)
- [LGPD Guidelines](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
