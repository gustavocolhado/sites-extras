# 🚀 Guia de Configuração Amazon SES - Cornos Brasil

## ✅ Status da Configuração SES

Sua configuração no AWS está **PERFEITA**! Agora vamos ativar o sistema.

### 📋 Configuração Atual (CORRETA):
- ✅ **Email verificado**: `no-reply@cornosbrasil.com`
- ✅ **Domínio verificado**: `cornosbrasil.com`
- ✅ **Região**: `us-east-1`
- ✅ **Modo**: Sandbox (correto para começar)

## 🔧 Passo 1: Configurar Variáveis de Ambiente

### 1.1 SMTP Exclusivo para Email Marketing (RECOMENDADO)
```bash
# SMTP EXCLUSIVO para Email Marketing
EMAIL_MARKETING_SMTP_HOST=email-smtp.us-east-2.amazonaws.com
EMAIL_MARKETING_SMTP_PORT=587
EMAIL_MARKETING_SMTP_SECURE=false
EMAIL_MARKETING_SMTP_USER=your-marketing-smtp-username-here
EMAIL_MARKETING_SMTP_PASS=your-marketing-smtp-password-here

# Email Marketing Configuration
EMAIL_MARKETING_FROM_EMAIL=marketing@cornosbrasil.com
EMAIL_MARKETING_FROM_NAME=Cornos Brasil Marketing

# SMTP GERAL (para recuperação de senha, contato, etc.)
SMTP_HOST=email-smtp.us-east-2.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-general-smtp-username-here
SMTP_PASS=your-general-smtp-password-here

# Email Configuration
SES_FROM_EMAIL=no-reply@cornosbrasil.com
SES_FROM_NAME=Cornos Brasil

# Test Email (opcional)
TEST_EMAIL=seu-email@exemplo.com

# Other configurations
NEXTAUTH_URL=http://localhost:3000
HOST_URL=http://localhost:3000
```

### 1.2 Opção B: SDK AWS (Alternativa)
```bash
# AWS SES Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-here
AWS_SECRET_ACCESS_KEY=your-aws-secret-key-here
SES_FROM_EMAIL=no-reply@cornosbrasil.com
SES_FROM_NAME=Cornos Brasil

# Teste SES (opcional)
TEST_EMAIL=seu-email@exemplo.com

# Outras configurações
NEXTAUTH_URL=http://localhost:3000
HOST_URL=http://localhost:3000
```

### 1.3 Obter Credenciais SMTP Separadas (RECOMENDADO):
1. **Acesse**: [AWS Console](https://console.aws.amazon.com) > SES
2. **Vá para**: SMTP Settings
3. **Crie DUAS credenciais separadas**:
   - **Marketing**: Para `EMAIL_MARKETING_SMTP_USER/PASS`
   - **Geral**: Para `SMTP_USER/PASS` (recuperação de senha, contato)
4. **Copie**: Username e Password de cada uma
5. **Cole** no arquivo `.env.local`

### 1.4 Obter Credenciais AWS (Alternativa):
1. **Acesse**: [AWS Console](https://console.aws.amazon.com)
2. **Vá para**: IAM > Usuários
3. **Crie usuário** com política `SESFullAccess`
4. **Gere**: Access Key e Secret Key
5. **Cole** no arquivo `.env.local`

## 🧪 Passo 2: Testar Configuração

### 2.1 Testar SMTP de Marketing (RECOMENDADO):
```bash
node scripts/test-marketing-smtp.js
```

### 2.2 Testar SMTP Geral:
```bash
node scripts/test-smtp.js
```

### 2.3 Testar SES SDK (Alternativa):
```bash
node scripts/test-ses.js
```

### 2.4 Testar Campanha Completa:
```bash
node scripts/test-email-campaign.js
```

## 📧 Passo 3: Verificar Emails no SES

### 3.1 Emails Verificados:
- ✅ `no-reply@cornosbrasil.com` (já verificado)
- ✅ `marketing@cornosbrasil.com` (para campanhas)
- ➕ Adicione emails de teste se necessário

### 3.2 Domínio Verificado:
- ✅ `cornosbrasil.com` (já verificado)

## 🔒 Passo 4: Separação de Sistemas

### 4.1 Sistema de Email Marketing:
- **Credenciais**: `EMAIL_MARKETING_SMTP_USER/PASS`
- **Email**: `marketing@cornosbrasil.com`
- **Uso**: Campanhas promocionais
- **Headers**: `X-SES-MESSAGE-TAGS: marketing,campaign`
- **Rate Limit**: 14 emails/segundo
- **Pool**: 5 conexões simultâneas

### 4.2 Sistema Geral:
- **Credenciais**: `SMTP_USER/PASS`
- **Email**: `no-reply@cornosbrasil.com`
- **Uso**: Recuperação de senha, contato, etc.
- **Headers**: Padrão
- **Rate Limit**: Padrão
- **Pool**: Padrão

### 4.3 Vantagens da Separação:
- ✅ **Segurança**: Credenciais independentes
- ✅ **Configuração**: Específica para cada uso
- ✅ **Headers**: Personalizados por sistema
- ✅ **Rate Limiting**: Otimizado por tipo
- ✅ **Logs**: Separados por sistema
- ✅ **Monitoramento**: Independente por função

## 🎯 Passo 4: Testar Sistema de Campanhas

### 4.1 Acessar Admin:
```
http://localhost:3000/admin/email-marketing
```

### 4.2 Criar Campanha de Teste:
1. **Clique**: "Enviar Campanha Rápida"
2. **Selecione**: "Premium Upgrade"
3. **Adicione**: Email de teste
4. **Envie**: Campanha

### 4.3 Verificar Resultado:
- ✅ Email recebido
- ✅ Link de tracking funcionando
- ✅ Página de campanha carregando

## 🚀 Passo 5: Produção

### 5.1 Sair do Sandbox:
1. **Acesse**: SES Console
2. **Vá para**: Account dashboard
3. **Clique**: "Request production access"
4. **Preencha**: Formulário de solicitação

### 5.2 Configurações de Produção:
- **Rate limit**: 14 emails/segundo
- **Quota diária**: 200 emails (inicial)
- **Domínio**: cornosbrasil.com
- **Email**: no-reply@cornosbrasil.com

## 📊 Monitoramento

### 6.1 Métricas SES:
- **Emails enviados**
- **Taxa de entrega**
- **Bounces**
- **Reclamações**

### 6.2 Logs de Campanha:
- **Clicks**
- **Conversões**
- **Unsubscribes**

## 🛠️ Solução de Problemas

### Problema: "MessageRejected"
**Solução**: Verificar se email está na lista de verificados

### Problema: "AccessDenied"
**Solução**: Verificar permissões IAM do usuário

### Problema: "InvalidParameterValue"
**Solução**: Verificar região e credenciais

## 📈 Otimização de Custos

### Configurações Atuais:
- **Batch size**: 50 emails
- **Delay**: 1 segundo entre batches
- **Rate limit**: 14 emails/segundo
- **Custo**: ~$0.10 por 1000 emails

### Monitoramento:
- **Quota diária**: 200 emails (sandbox)
- **Taxa de envio**: 14 emails/segundo
- **Bounce rate**: < 5%
- **Complaint rate**: < 0.1%

## 🎉 Próximos Passos

1. ✅ **Configurar credenciais AWS**
2. ✅ **Testar envio de email**
3. ✅ **Testar campanha completa**
4. ✅ **Verificar tracking**
5. ✅ **Solicitar acesso produção**

---

**Sua configuração SES está perfeita! Agora é só configurar as credenciais e testar!** 🚀
