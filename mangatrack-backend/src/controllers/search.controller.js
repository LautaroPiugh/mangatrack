const searchService = require('../services/search.service');

const search = async (req, res) => {
  const results = await searchService.search(req.query.q);

  res.status(200).json({
    success: true,
    message: 'Resultados obtenidos correctamente.',
    data: results,
  });
};

module.exports = {
  search,
};
