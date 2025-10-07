const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function insertTestVideo() {
  try {
    const video = await prisma.video.create({
      data: {
        title: 'Vídeo de Teste',
        description: 'Este é um vídeo de teste para demonstração.',
        url: 'test-video-url', // URL única para o vídeo
        thumbnailUrl: 'https://example.com/test-thumbnail.jpg',
        videoUrl: 'https://example.com/test-video.mp4',
        category: [], // Adicionado o campo category como array vazio
        duration: 300.0, // Duração em segundos (Float)
        viewCount: 0, // Adicionado o campo viewCount
        likesCount: 0, // Adicionado o campo likesCount
        premium: false, // Adicionado o campo premium
        creator: null, // Campo creator é opcional
        created_at: new Date(),
        updated_at: new Date(),
        // Adicione outros campos obrigatórios conforme seu schema.prisma
        // Por exemplo, se você tiver um campo `userId` opcional:
        // userId: 'id-do-usuario-existente'
      },
    });
    console.log('Vídeo de teste inserido com sucesso:', video);
  } catch (error) {
    console.error('Erro ao inserir vídeo de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

insertTestVideo();
