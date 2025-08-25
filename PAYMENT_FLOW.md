# Fluxo de Pagamento - Documentação

## Visão Geral

O fluxo de pagamento foi reestruturado para usar uma abordagem baseada em sessões de pagamento (`PaymentSession`) antes de criar registros de pagamento (`Payment`). Isso garante maior controle e rastreabilidade do processo de pagamento.

## Fluxo Implementado

### 1. Criação da Sessão de Pagamento

Quando um usuário inicia um processo de pagamento:

1. **API**: `POST /api/premium/create-subscription`
2. **Ação**: Cria uma `PaymentSession` com status `pending`
3. **Dados armazenados**:
   - `plan`: Tipo do plano (monthly, quarterly, semestral, yearly, lifetime)
   - `amount`: Valor do pagamento
   - `userId`: ID do usuário
   - `status`: Status inicial (pending)
   - `createdAt`: Data de criação
   - `preferenceId`: Será preenchido após criação da preferência/sessão

### 2. Processamento do Pagamento

#### Stripe
- Cria sessão de checkout do Stripe
- Atualiza `PaymentSession` com o `preferenceId` (session ID)
- Retorna URL de checkout

#### Mercado Pago
- Cria preferência de pagamento
- Atualiza `PaymentSession` com o `preferenceId`
- Retorna URL de pagamento

### 3. Confirmação do Pagamento (Webhook)

#### Webhook Stripe (`/api/stripe/webhook`)
1. Recebe evento `checkout.session.completed`
2. Busca `PaymentSession` pelo `paymentSessionId` ou `preferenceId`
3. Cria/atualiza registro `Payment` baseado na `PaymentSession`
4. Atualiza `PaymentSession` com status `paid`
5. Atualiza usuário com status `premium` e data de expiração

#### Webhook Mercado Pago (`/api/mercado-pago/webhook`)
1. Recebe evento `payment.updated`
2. Busca `PaymentSession` pelo `preferenceId` ou `external_reference`
3. Cria/atualiza registro `Payment` baseado na `PaymentSession`
4. Atualiza `PaymentSession` com status `paid`
5. Atualiza usuário com status `premium` e data de expiração

## Estrutura do Banco de Dados

### PaymentSession
```prisma
model PaymentSession {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  plan         String   // Tipo do plano
  amount       Float    // Valor do pagamento
  userId       String   @db.ObjectId // ID do usuário
  status       String   @default("pending") // Status da sessão
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  paymentId    Int?     // ID do pagamento quando confirmado
  preferenceId String?  @unique // ID da preferência/sessão
  paymentMethod String? // Método de pagamento
  userEmail    String?  // Email do usuário
  description  String?  // Descrição do plano
  duration     Int?     // Duração em dias
  promotionCode String? // Código de promoção
  affiliateId  String?  @db.ObjectId // ID do afiliado
  campaignId   String?  // ID da campanha
  
  // Relacionamentos
  user         User     @relation(fields: [userId], references: [id])
  affiliate    User?    @relation("AffiliateSessions", fields: [affiliateId], references: [id])
  
  @@map("payment_sessions")
}
```

### Payment
```prisma
model Payment {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  userId       String   @db.ObjectId
  plan         String
  amount       Float
  transactionDate DateTime @default(now())
  userEmail    String
  status       String
  paymentId    Int?     @unique
  duration     Int?
  promotionCode String?
  preferenceId String?  @unique
  affiliateId  String?  @db.ObjectId
  campaignId   String?
  
  user      User     @relation(fields: [userId], references: [id])
  
  @@map("payments")
}
```

## Vantagens do Novo Fluxo

1. **Rastreabilidade**: Cada pagamento tem uma sessão associada
2. **Controle**: Status da sessão permite acompanhar o progresso
3. **Flexibilidade**: Dados da sessão podem ser usados para criar o pagamento
4. **Consistência**: Informações do plano são baseadas na sessão
5. **Auditoria**: Histórico completo do processo de pagamento

## Status das Sessões

- `pending`: Sessão criada, aguardando pagamento
- `paid`: Pagamento confirmado
- `cancelled`: Pagamento cancelado
- `expired`: Sessão expirada

## Exemplo de Uso

```typescript
// 1. Criar sessão de pagamento
const paymentSession = await prisma.paymentSession.create({
  data: {
    plan: 'monthly',
    amount: 29.90,
    userId: 'user123',
    status: 'pending',
  },
});

// 2. Processar pagamento (Stripe/Mercado Pago)
// ... código de processamento ...

// 3. Webhook confirma pagamento
const session = await prisma.paymentSession.findUnique({
  where: { id: paymentSessionId },
});

// 4. Criar Payment baseado na PaymentSession
const payment = await prisma.payment.create({
  data: {
    userId: session.userId,
    plan: session.plan,
    amount: session.amount,
    paymentId: paymentId,
    transactionDate: new Date(),
    userEmail: userEmail,
    status: 'paid',
    preferenceId: session.preferenceId,
  },
});

// 5. Atualizar PaymentSession
await prisma.paymentSession.update({
  where: { id: session.id },
  data: { status: 'paid', paymentId: paymentId },
});
```
