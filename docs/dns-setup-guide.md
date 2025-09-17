# Configuração DNS para Evitar Spam

## 🚨 Configurações Obrigatórias

### 1. **SPF Record**
Adicione este registro TXT no DNS do seu domínio:
```
TXT: v=spf1 include:spf.brevo.com ~all
```

### 2. **DKIM Record**
Configure na Brevo:
1. Acesse **Settings** > **Senders & IP**
2. Adicione seu domínio (ex: cornosbrasil.com)
3. Siga as instruções para configurar o DKIM
4. Adicione o registro DNS fornecido

### 3. **DMARC Record**
```
TXT: v=DMARC1; p=quarantine; rua=mailto:dmarc@cornosbrasil.com
```

## 🔧 Configurações Adicionais

### **CNAME Records**
```
mail.cornosbrasil.com → smtp-relay.brevo.com
```

### **MX Records** (se necessário)
```
10 mail.cornosbrasil.com
```

## ✅ Verificação

Use estas ferramentas para testar:
- [Mail Tester](https://www.mail-tester.com/)
- [MXToolbox](https://mxtoolbox.com/)
- [Google Postmaster Tools](https://postmaster.google.com/)

## 📊 Monitoramento

1. **Google Postmaster Tools**
   - Adicione seu domínio
   - Monitore reputação
   - Verifique feedback loops

2. **Microsoft SNDS**
   - Registre seu IP
   - Monitore reclamações
   - Verifique reputação

3. **Painel da Brevo**
   - Taxa de entrega
   - Bounces e spam
   - Estatísticas de abertura
