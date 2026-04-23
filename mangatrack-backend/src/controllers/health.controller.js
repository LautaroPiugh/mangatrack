const getHealthStatus = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MangaTrack API operativa.',
    data: {
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      uptimeInSeconds: Math.floor(process.uptime()),
    },
  });
};

module.exports = {
  getHealthStatus,
};
