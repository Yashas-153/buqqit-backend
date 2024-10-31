const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const searchInStudios = async (query) => {
  return await prisma.studio.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive', // Case-insensitive search
      },
    },
  });
};

module.exports = {
  searchInStudios,
};
