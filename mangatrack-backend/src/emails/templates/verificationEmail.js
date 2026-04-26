const { getBaseEmailLayout } = require('./baseEmailLayout');

const createVerificationEmailTemplate = ({ appName, name, verificationUrl }) => {
  const greeting = name?.trim() ? `Hola ${name},` : 'Hola,';
  const subject = `Verifica tu cuenta en ${appName}`;
  const text = [
    greeting,
    '',
    `Gracias por registrarte en ${appName}. Para activar tu cuenta, utiliza el siguiente enlace:`,
    verificationUrl,
    '',
    'Si no solicitaste esta verificación, podés ignorar este mensaje.',
  ].join('\n');

  const html = getBaseEmailLayout({
    appName,
    title: 'Confirma tu dirección de correo',
    intro: `${greeting} Gracias por registrarte en ${appName}. Haz clic en el botón para verificar tu cuenta y comenzar a usar la aplicación.`, 
    buttonText: 'Verificar cuenta',
    buttonUrl: verificationUrl,
    buttonFallbackText: 'Verificar cuenta',
    fallbackUrl: verificationUrl,
    secondaryText: 'Si no solicitaste esta cuenta, podés ignorar este correo con seguridad.',
    expirationText: 'Este enlace vence en 24 horas.',
    footerText: `Si tenés dudas, respondé a este correo o visitá ${appName}.`, 
  });

  return {
    subject,
    text,
    html,
  };
};

module.exports = { createVerificationEmailTemplate };