# Guia de Configuração da Brevo

## Configuração das Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Brevo Configuration
BREVO_API_KEY=your_brevo_api_key_here
BREVO_FROM_EMAIL=noreply@cornosbrasil.com
BREVO_FROM_NAME=Cornos Brasil
BREVO_LIST_ID=1

# Brevo SMTP Configuration (já configurado)
BREVO_SMTP_USER=9742b9001@smtp-brevo.com
BREVO_SMTP_PASS=0jZORnJHwrk9sCaG
```

## Configurações SMTP da Brevo

As configurações SMTP já estão implementadas:

- **Servidor SMTP**: `smtp-relay.brevo.com`
- **Porta**: `587`
- **Usuário**: `9742b9001@smtp-brevo.com`
- **Senha**: `0jZORnJHwrk9sCaG`
- **Segurança**: TLS

## Como Obter a API Key da Brevo

1. Acesse [brevo.com](https://www.brevo.com)
2. Faça login na sua conta
3. Vá para **Settings** > **API Keys**
4. Clique em **Create a new API key**
5. Dê um nome para a chave (ex: "Cornos Brasil Marketing")
6. Selecione as permissões necessárias:
   - **Send emails**
   - **Manage contacts**
   - **Access to account information**
7. Copie a API key gerada

## Configuração de Domínio

Para usar domínios personalizados:

1. Na Brevo, vá para **Settings** > **Senders & IP**
2. Adicione seu domínio (ex: cornosbrasil.com)
3. Configure os registros DNS conforme instruções
4. Atualize as variáveis:
   ```env
   BREVO_FROM_EMAIL=noreply@cornosbrasil.com
   BREVO_FROM_NAME=Cornos Brasil
   ```

## Criação de Listas

1. Na Brevo, vá para **Contacts** > **Lists**
2. Crie uma nova lista (ex: "Usuários Premium")
3. Anote o ID da lista
4. Atualize a variável:
   ```env
   BREVO_LIST_ID=your_list_id_here
   ```

## Vantagens da Brevo

✅ **Preço competitivo** - Mais barata que Mailchimp  
✅ **API robusta** - Fácil integração  
✅ **GDPR compliant** - Conformidade com LGPD  
✅ **Deliverability alta** - Boa taxa de entrega  
✅ **Suporte em português**  
✅ **Templates responsivos**  
✅ **Analytics detalhados**  
✅ **Automação avançada**  

## Funcionalidades Implementadas

- ✅ Envio de emails em lote
- ✅ Personalização de templates
- ✅ Rastreamento de links
- ✅ Gestão de contatos
- ✅ Sincronização automática
- ✅ Rate limiting inteligente
- ✅ Fallback para SES (se necessário)

## Testando a Integração

1. **Teste SMTP**: Acesse `/admin/email-marketing` e envie um email de teste
2. **Verificar logs**: Monitore os logs do servidor para confirmar envios
3. **Painel Brevo**: Acesse o painel da Brevo para ver estatísticas

## Monitoramento

Acesse o painel da Brevo para:
- Ver estatísticas de entrega
- Monitorar bounces e spam
- Acompanhar cliques e aberturas
- Gerenciar listas de contatos

## Vantagens da Implementação

✅ **SMTP como método principal** - Mais confiável  
✅ **API como fallback** - Redundância automática  
✅ **Rate limiting inteligente** - Evita bloqueios  
✅ **Logs detalhados** - Fácil debugging  
✅ **Configuração automática** - SMTP já configurado  
