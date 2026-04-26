const { getBaseEmailLayout } = require('./baseEmailLayout');

const createPasswordResetEmailTemplate = ({ appName, name, resetUrl }) => {
  const greeting = name?.trim() ? `Hola ${name},` : 'Hola,';
  const subject = `Restablecé tu contraseña en ${appName}`;
  const text = [
    greeting,
    '',
    `Alguien solicitó restablecer la contraseña de tu cuenta en ${appName}. Si fue vos, usá este enlace:`,
    resetUrl,
    '',
    'Si no solicitaste este restablecimiento, podés ignorar este correo.',
    '',
    'Este enlace vence en 60 minutos.',
  ].join('\n');

  const html = getBaseEmailLayout({
    appName,
    title: 'Restablecé tu contraseña',
    intro: `${greeting} Recibimos una solicitud para cambiar la contraseña de tu cuenta. Presioná el botón para continuar con el proceso.`, 
    buttonText: 'Cambiar contraseña',
    buttonUrl: resetUrl,
    buttonFallbackText: 'Cambiar contraseña',
    fallbackUrl: resetUrl,
    secondaryText: 'Si no solicitaste este cambio, podés ignorar este correo. Tu contraseña seguirá segura.',
    expirationText: 'Este enlace vence en 60 minutos.',
    footerText: `Si tenés dudas, respondé a este correo o visitá ${appName}.`, 
  });

  return {
    subject,
    text,
    html,
  };
};

module.exports = { createPasswordResetEmailTemplate };