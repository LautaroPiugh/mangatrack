const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    const data = {
      user: result.user,
    };

    if (result.token) {
      data.token = result.token;
    }

    return res.status(201).json({
      success: true,
      message: result.message,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    const result = await authService.verifyAccount(token);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesion exitoso.',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Usuario autenticado obtenido correctamente.',
      data: {
        user,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  getCurrentUser,
};
