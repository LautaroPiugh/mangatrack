const nodemailer = require('nodemailer');

let transporterInstance;

const getAppName = () => process.env.APP_NAME || 'MangaTrack';

const getAppBaseUrl = () => process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

const getVerificationUrl = (verificationToken) => {
  if (process.env.FRONTEND_URL) {
    return `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
  }

  return `${getAppBaseUrl()}/api/auth/verify/${verificationToken}`;
};

const getEmailMode = () => {
  if (process.env.EMAIL_MODE) {
    return process.env.EMAIL_MODE;
  }

  const hasSmtpConfig = (
    process.env.EMAIL_HOST
    && process.env.EMAIL_PORT
    && process.env.EMAIL_USER
    && process.env.EMAIL_PASS
  );

  return hasSmtpConfig ? 'smtp' : 'json';
};

const getTransporter = () => {
  if (transporterInstance) {
    return transporterInstance;
  }

  const mode = getEmailMode();
  const {
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_SECURE,
  } = process.env;

  if (mode === 'smtp') {
    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
      throw new Error('EMAIL_MODE=smtp requiere EMAIL_HOST, EMAIL_PORT, EMAIL_USER y EMAIL_PASS.');
    }

    transporterInstance = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT),
      secure: EMAIL_SECURE === 'true',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  } else {
    transporterInstance = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return transporterInstance;
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || `${getAppName()} <no-reply@mangatrack.local>`,
    to,
    subject,
    text,
    html,
  });

  if (process.env.NODE_ENV !== 'production' && getEmailMode() === 'json') {
    console.log('[email:json]', typeof info.message === 'string' ? info.message : info.message.toString());
  }

  return info;
};

const sendVerificationEmail = async ({ to, name, verificationToken }) => {
  const verificationUrl = getVerificationUrl(verificationToken);

  const appName = getAppName();
  const subject = `Verifica tu cuenta de ${appName}`;
  const text = [
    `Hola ${name},`,
    '',
    `Gracias por registrarte en ${appName}.`,
    `Verifica tu cuenta ingresando a este enlace: ${verificationUrl}`,
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="margin-bottom: 12px;">${appName}</h2>
      <p>Hola ${name},</p>
      <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente enlace:</p>
      <p>
        <a href="${verificationUrl}" style="color: #2563eb; text-decoration: none;">
          Verificar cuenta
        </a>
      </p>
      <p>Si no solicitaste esta cuenta, puedes ignorar este correo.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject,
    text,
    html,
  });
};

module.exports = {
  getTransporter,
  sendEmail,
  sendVerificationEmail,
};
