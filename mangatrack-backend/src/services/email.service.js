const nodemailer = require('nodemailer');
const { createVerificationEmailTemplate } = require('../emails/templates/verificationEmail');
const { createPasswordResetEmailTemplate } = require('../emails/templates/passwordResetEmail');

const EMAIL_MODE_JSON = 'json';
const EMAIL_MODE_SMTP = 'smtp';

let transporterCache = {
  mode: null,
  transporter: null,
};

const createEmailError = (message, options = {}) => {
  const error = new Error(message);

  error.name = options.name || 'EmailServiceError';
  error.publicMessage = options.publicMessage || message;

  if (options.code) {
    error.code = options.code;
  }

  if (options.cause) {
    error.cause = options.cause;
  }

  if (options.meta) {
    error.meta = options.meta;
  }

  return error;
};

const getAppName = () => process.env.APP_NAME?.trim() || 'MangaTrack';

const getEmailMode = () => {
  const mode = (process.env.EMAIL_MODE || EMAIL_MODE_JSON).trim().toLowerCase();

  if (mode !== EMAIL_MODE_JSON && mode !== EMAIL_MODE_SMTP) {
    throw createEmailError(
      'EMAIL_MODE debe ser "json" o "smtp".',
      {
        name: 'EmailConfigurationError',
        publicMessage: 'La configuracion de email es invalida.',
      },
    );
  }

  return mode;
};

const getFrontendUrl = () => (
  process.env.FRONTEND_URL?.trim() || 'http://localhost:5173'
).replace(/\/+$/, '');

const getDefaultFrom = () => `${getAppName()} <no-reply@mangatrack.local>`;

const getSmtpConfig = () => {
  const requiredEnvVars = [
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASS',
    'EMAIL_FROM',
  ];

  const missingEnvVars = requiredEnvVars.filter((envVarName) => {
    const value = process.env[envVarName];

    if (envVarName === 'EMAIL_PASS') {
      return typeof value !== 'string' || value.length === 0;
    }

    return typeof value !== 'string' || value.trim().length === 0;
  });

  if (missingEnvVars.length > 0) {
    throw createEmailError(
      `EMAIL_MODE=smtp requiere ${missingEnvVars.join(', ')}.`,
      {
        name: 'EmailConfigurationError',
        publicMessage: 'No se pudo enviar el email porque la configuracion SMTP esta incompleta.',
        meta: {
          missingEnvVars,
        },
      },
    );
  }

  const port = Number.parseInt(process.env.EMAIL_PORT, 10);

  if (!Number.isInteger(port) || port <= 0) {
    throw createEmailError(
      'EMAIL_PORT debe ser un numero valido cuando EMAIL_MODE=smtp.',
      {
        name: 'EmailConfigurationError',
        publicMessage: 'No se pudo enviar el email porque EMAIL_PORT no es valido.',
      },
    );
  }

  return {
    host: process.env.EMAIL_HOST.trim(),
    port,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER.trim(),
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM.trim(),
  };
};

const getEmailFrom = (mode) => {
  if (mode === EMAIL_MODE_SMTP) {
    return getSmtpConfig().from;
  }

  return process.env.EMAIL_FROM?.trim() || getDefaultFrom();
};

const createTransporter = () => {
  const mode = getEmailMode();

  if (transporterCache.transporter && transporterCache.mode === mode) {
    return transporterCache.transporter;
  }

  const transporter = mode === EMAIL_MODE_JSON
    ? nodemailer.createTransport({
      jsonTransport: true,
    })
    : (() => {
      const smtpConfig = getSmtpConfig();

      return nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });
    })();

  transporterCache = {
    mode,
    transporter,
  };

  return transporter;
};

const logSmtpError = (error) => {
  const smtpContext = {
    host: process.env.EMAIL_HOST?.trim() || null,
    port: process.env.EMAIL_PORT?.trim() || null,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER?.trim() || null,
    from: process.env.EMAIL_FROM?.trim() || null,
  };

  console.error('[EMAIL][SMTP][ERROR]', {
    message: error.message,
    code: error.code || null,
    command: error.command || null,
    response: error.response || null,
    responseCode: error.responseCode || null,
    ...smtpContext,
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const mode = getEmailMode();

  if (mode === EMAIL_MODE_JSON) {
    const transporter = createTransporter();
    const mailOptions = {
      from: getEmailFrom(mode),
      to,
      subject,
      text,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    const message = typeof info.message === 'string'
      ? info.message
      : info.message?.toString?.() || JSON.stringify(info);

    console.log('[EMAIL][JSON]', message);

    return info;
  }

  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: getEmailFrom(mode),
      to,
      subject,
      text,
      html,
    };
    const info = await transporter.sendMail(mailOptions);

    console.log('[EMAIL][SMTP][SENT]', {
      to,
      subject,
      messageId: info.messageId || null,
      response: info.response || null,
    });

    return info;
  } catch (error) {
    if (error.name === 'EmailConfigurationError') {
      console.error('[EMAIL][SMTP][CONFIG]', {
        message: error.message,
        missingEnvVars: error.meta?.missingEnvVars || [],
      });
      throw error;
    }

    logSmtpError(error);

    throw createEmailError(
      'No se pudo enviar el email. Revisa la configuracion SMTP e intenta nuevamente.',
      {
        name: 'EmailDeliveryError',
        publicMessage: error.code === 'EAUTH'
          ? 'No se pudo autenticar con el servidor SMTP. Revisa EMAIL_USER y EMAIL_PASS.'
          : 'No se pudo enviar el email. Revisa la configuracion SMTP e intenta nuevamente.',
        code: error.code,
        cause: error,
      },
    );
  }
};

const sendVerificationEmail = async ({ to, name, token }) => {
  const verificationUrl = `${getFrontendUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  const template = createVerificationEmailTemplate({
    appName: getAppName(),
    name,
    verificationUrl,
  });

  return sendEmail({
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
};

const sendPasswordResetEmail = async ({ to, name, token }) => {
  const resetUrl = `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  const template = createPasswordResetEmailTemplate({
    appName: getAppName(),
    name,
    resetUrl,
  });

  return sendEmail({
    to,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
};

module.exports = {
  createTransporter,
  getEmailMode,
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
