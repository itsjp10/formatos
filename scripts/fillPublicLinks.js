const { PrismaClient } = require('@prisma/client');
const { customAlphabet } = require('nanoid'); // Alternativa a cuid

const prisma = new PrismaClient();
const nanoid = customAlphabet('1234567890abcdef', 12); // genera IDs de 12 caracteres

async function main() {
  const formatosSinLink = await prisma.formato.findMany({
    where: { publicLink: null },
  });

  for (const formato of formatosSinLink) {
    await prisma.formato.update({
      where: { formatoID: formato.formatoID },
      data: {
        publicLink: nanoid(),
      },
    });
    console.log(`Formato ${formato.formatoID} actualizado`);
  }

  console.log('Todos los formatos existentes tienen ahora un publicLink');
}

main()
  .catch((e) => {
    console.error('Error actualizando formatos:', e);
  })
  .finally(() => {
    prisma.$disconnect();
  });
