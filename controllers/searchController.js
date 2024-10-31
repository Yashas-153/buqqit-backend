const Levenshtein = require('fast-levenshtein');
const prisma = require('../database/prismaPostgress')

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

const fuzzySearchStudios = async (query) => {
  const studios = await searchInStudios(query);
  return studios
    .map((studio) => ({
      studio,
      distance: Levenshtein.get(query, studio.name),
    }))
    .sort((a, b) => a.distance - b.distance)
    .map((result) => result.studio);
};

const searchStudios = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    const results = await fuzzySearchStudios(query);
    return res.json(results);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred during the search' });
  }
};



module.exports = {
  searchStudios,
};



