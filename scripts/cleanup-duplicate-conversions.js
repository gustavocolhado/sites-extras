const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  console.log('Iniciando a busca por conversões de campanha duplicadas...');

  // 1. Encontrar todas as conversões
  const allConversions = await prisma.campaignConversion.findMany({
    orderBy: {
      convertedAt: 'asc', // Ordenar para que a primeira seja a mais antiga
    },
  });

  // 2. Agrupar por userId e campaign
  const groupedConversions = new Map();

  for (const conversion of allConversions) {
    const key = `${conversion.userId}-${conversion.campaign}`;
    if (!groupedConversions.has(key)) {
      groupedConversions.set(key, []);
    }
    groupedConversions.get(key).push(conversion);
  }

  // 3. Identificar IDs e registros para deletar
  const idsToDelete = [];
  const recordsToDeleteDetails = [];
  let duplicatesFound = 0;

  for (const [key, conversions] of groupedConversions.entries()) {
    if (conversions.length > 1) {
      const [original, ...duplicates] = conversions;
      duplicates.forEach((dup) => {
        idsToDelete.push(dup.id);
        recordsToDeleteDetails.push(dup);
      });
      duplicatesFound += duplicates.length;
    }
  }

  if (idsToDelete.length === 0) {
    console.log('Nenhuma conversão duplicada encontrada. O banco de dados está limpo!');
    rl.close();
    return;
  }

  console.log(`\nTotal de ${duplicatesFound} conversões duplicadas encontradas.`);
  console.log('--------------------------------------------------');
  console.log('Os seguintes registros serão EXCLUÍDOS:');
  console.table(recordsToDeleteDetails);
  console.log('--------------------------------------------------');

  // 4. Pedir confirmação ao usuário
  rl.question(
    'Você tem certeza que deseja excluir os registros listados acima? (y/n) ',
    async (answer) => {
      if (answer.toLowerCase() === 'y') {
        console.log('Iniciando a exclusão...');
        try {
          const deleteResult = await prisma.campaignConversion.deleteMany({
            where: {
              id: {
                in: idsToDelete,
              },
            },
          });
          console.log(`\n✅ Sucesso! ${deleteResult.count} registros duplicados foram excluídos.`);
        } catch (error) {
          console.error('❌ Erro ao tentar excluir os registros duplicados:', error);
        } finally {
          rl.close();
        }
      } else {
        console.log('Operação de exclusão cancelada pelo usuário.');
        rl.close();
      }
    }
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // A conexão do prisma será desconectada após a resposta do usuário
  });

rl.on('close', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
