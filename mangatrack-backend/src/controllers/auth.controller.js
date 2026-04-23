const authService = require('../services/auth.service');

const register = async (req, res) => {
  const result = await authService.register(req.body);

  res.status(201).json({
    success: true,
    message: result.message,
    data: {
      user: result.user,
    },
  });
};

const verifyAccount = async (req, res) => {
  const result = await authService.verifyAccount(req.params.token);

  res.status(200).json({
    success: true,
    message: result.message,
    data: {
      user: result.user,
    },
  });
};

const login = async (req, res) => {
  const result = await authService.login(req.body);

  res.status(200).json({
    success: true,
    message: 'Inicio de sesion exitoso.',
    data: result,
  });
};

const getCurrentUser = async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Usuario autenticado obtenido correctamente.',
    data: {
      user,
    },
  });
};

module.exports = {
  register,
  verifyAccount,
  login,
  getCurrentUser,
};
