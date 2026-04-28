const activityService = require('../services/activity.service');

const getFeed = async (req, res) => {
  const result = await activityService.getFeed(req.user.id, req.query);

  res.status(200).json({
    success: true,
    message: 'Actividad de usuarios seguidos obtenida correctamente.',
    data: result.items,
    meta: result.pagination,
  });
};

const getMyActivity = async (req, res) => {
  const result = await activityService.getMyActivity(req.user.id, req.query);

  res.status(200).json({
    success: true,
    message: 'Tu actividad fue obtenida correctamente.',
    data: result.items,
    meta: result.pagination,
  });
};

const getUserActivity = async (req, res) => {
  const result = await activityService.getUserActivity(req.params.username, req.user || null, req.query);

  res.status(200).json({
    success: true,
    message: 'La actividad del usuario fue obtenida correctamente.',
    data: result.items,
    meta: {
      ...result.pagination,
      user: result.user,
    },
  });
};

module.exports = {
  getFeed,
  getMyActivity,
  getUserActivity,
};
