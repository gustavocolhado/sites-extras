require('dotenv').config({ path: './.env' });
const { MongoClient } = require('mongodb');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function migrateVideos() {
  const dbUrls = [];
  for (let i = 0; i <= 15; i++) {
    const dbVar = i === 0 ? 'DATABASE_URL' : `DATABASE_URL_${i}`;
    if (process.env[dbVar]) {
      dbUrls.push(process.env[dbVar]);
    }
  }

  if (dbUrls.length === 0) {
    console.error('Nenhuma URL de banco de dados encontrada no .env');
    return;
  }

  const sourceDbUrl = dbUrls[0];
  const targetDbUrls = dbUrls.slice(1);

  let sourceClient;
  try {
    sourceClient = new MongoClient(sourceDbUrl);
    await sourceClient.connect();
    console.log('Conectado ao banco de dados de origem:', sourceDbUrl);

    const sourceDb = sourceClient.db(); // Assume o nome do banco de dados da URL
    const videosToMigrate = await sourceDb.collection('Video').find({ premium: false }).toArray();
    console.log(`Encontrados ${videosToMigrate.length} vídeos com premium: false no banco de dados de origem.`);

    if (videosToMigrate.length === 0) {
      console.log('Nenhum vídeo para migrar.');
      return;
    }

    const answer = await new Promise(resolve => {
      rl.question(`Deseja prosseguir com a migração de ${videosToMigrate.length} vídeos para os outros ${targetDbUrls.length} bancos de dados? (sim/não): `, resolve);
    });

    if (answer.toLowerCase() !== 'sim') {
      console.log('Migração cancelada pelo usuário.');
      return;
    }

    for (const targetDbUrl of targetDbUrls) {
      let targetClient;
      try {
        targetClient = new MongoClient(targetDbUrl);
        await targetClient.connect();
        console.log('Conectado ao banco de dados de destino:', targetDbUrl);

        const targetDb = targetClient.db(); // Assume o nome do banco de dados da URL
        const videoCollection = targetDb.collection('Video');

        for (const video of videosToMigrate) {
          // Remover o _id para que o MongoDB crie um novo _id na inserção
          delete video._id;
          await videoCollection.insertOne(video);
        }
        console.log(`Migrados ${videosToMigrate.length} vídeos para o banco de dados de destino: ${targetDbUrl}`);
      } catch (error) {
        console.error(`Erro ao migrar para o banco de dados de destino ${targetDbUrl}:`, error);
      } finally {
        if (targetClient) {
          await targetClient.close();
        }
      }
    }

    console.log('Migração concluída com sucesso!');

  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    if (sourceClient) {
      await sourceClient.close();
      console.log('Conexão com o banco de dados de origem fechada.');
    }
    rl.close();
  }
}

migrateVideos();
