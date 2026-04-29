const dns = require('node:dns');
const net = require('node:net');
const tls = require('node:tls');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const { createVerificationEmailTemplate } = require('../emails/templates/verificationEmail');
const { createPasswordResetEmailTemplate } = require('../emails/templates/passwordResetEmail');

const EMAIL_MODE_JSON = 'json';
const EMAIL_MODE_SMTP = 'smtp';
const EMAIL_MODE_BREVO = 'brevo';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

let transporterCache = {
  mode: null,
  transporter: null,
};

const lookupIPv4 = (hostname, callback) => dns.lookup(
  hostname,
  { family: 4, all: false },
  callback,
);

const createIPv4Socket = (smtpConfig, timeouts, callback) => {
  lookupIPv4(smtpConfig.host, (lookupError, address) => {
    if (lookupError) {
      callback(lookupError);
      return;
    }

    const connectOptions = smtpConfig.secure
      ? {
        host: address,
        port: smtpConfig.port,
        servername: smtpConfig.host,
      }
      : {
        host: address,
        port: smtpConfig.port,
      };

    const socket = smtpConfig.secure
      ? tls.connect(connectOptions)
      : net.connect(connectOptions);

    let settled = false;
    const connectionTimeout = timeouts.connectionTimeout || 20000;

    const cleanup = () => {
      socket.removeListener('error', handleError);
      socket.removeListener('connect', handleConnect);
      socket.removeListener('secureConnect', handleConnect);
      socket.removeListener('timeout', handleTimeout);
      socket.setTimeout(0);
    };

    const finish = (error, socketOptions) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      callback(error, socketOptions);
    };

    const handleError = (error) => {
      finish(error);
    };

    const handleTimeout = () => {
      const timeoutError = new Error('Connection timeout');
      timeoutError.code = 'ETIMEDOUT';
      socket.destroy(timeoutError);
      finish(timeoutError);
    };

    const handleConnect = () => {
      finish(null, {
        connection: socket,
        secured: smtpConfig.secure,
      });
    };

    socket.setTimeout(connectionTimeout);
    socket.once('error', handleError);
    socket.once('timeout', handleTimeout);
    socket.once(smtpConfig.secure ? 'secureConnect' : 'connect', handleConnect);
  });
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

  if (
    mode !== EMAIL_MODE_JSON
    && mode !== EMAIL_MODE_SMTP
    && mode !== EMAIL_MODE_BREVO
  ) {
    throw createEmailError(
      'EMAIL_MODE debe ser "json", "smtp" o "brevo".',
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

const parseEmailAddress = (value) => {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    throw createEmailError(
      'EMAIL_FROM debe incluir un email valido.',
      {
        name: 'EmailConfigurationError',
        publicMessage: 'No se pudo enviar el email porque EMAIL_FROM es invalido.',
      },
    );
  }

  const mailboxMatch = trimmedValue.match(/^(?:(.+?)\s*)?<([^<>]+)>$/);
  const email = mailboxMatch ? mailboxMatch[2].trim() : trimmedValue;
  const name = mailboxMatch ? mailboxMatch[1].trim().replace(/^"|"$/g, '') : null;

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw createEmailError(
      'EMAIL_FROM debe incluir un email valido.',
      {
        name: 'EmailConfigurationError',
        publicMessage: 'No se pudo enviar el email porque EMAIL_FROM es invalido.',
      },
    );
  }

  return {
    email,
    name: name || null,
  };
};

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

const getBrevoConfig = () => {
  const requiredEnvVars = ['BREVO_API_KEY', 'EMAIL_FROM'];
  const missingEnvVars = requiredEnvVars.filter((envVarName) => {
    const value = process.env[envVarName];
    return typeof value !== 'string' || value.trim().length === 0;
  });

  if (missingEnvVars.length > 0) {
    throw createEmailError(
      `EMAIL_MODE=brevo requiere ${missingEnvVars.join(', ')}.`,
      {
        name: 'EmailConfigurationError',
        publicMessage: 'No se pudo enviar el email porque la configuracion de Brevo esta incompleta.',
        meta: {
          missingEnvVars,
        },
      },
    );
  }

  return {
    apiKey: process.env.BREVO_API_KEY.trim(),
    sender: parseEmailAddress(process.env.EMAIL_FROM),
  };
};

const getEmailFrom = (mode) => {
  if (mode === EMAIL_MODE_SMTP) {
    return getSmtpConfig().from;
  }

  if (mode === EMAIL_MODE_BREVO) {
    return `${getBrevoConfig().sender.name || getAppName()} <${getBrevoConfig().sender.email}>`;
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
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 30000,
        getSocket: (options, callback) => createIPv4Socket(
          smtpConfig,
          {
            connectionTimeout: options.connectionTimeout,
          },
          callback,
        ),
      });
    })();

  transporterCache = {
    mode,
    transporter,
  };

  return transporter;
};

const logBrevoError = (error, extra = {}) => {
  console.error('[EMAIL][BREVO][ERROR]', {
    message: error.message,
    code: error.code || null,
    status: error.status || null,
    response: error.response || null,
    ...extra,
  });
};

const sendBrevoEmail = async ({ to, subject, html, text }) => {
  const brevoConfig = getBrevoConfig();
  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': brevoConfig.apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: brevoConfig.sender,
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  const rawBody = await response.text();
  let parsedBody = null;

  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    parsedBody = rawBody || null;
  }

  if (!response.ok) {
    const error = createEmailError(
      'No se pudo enviar el email con Brevo.',
      {
        name: 'EmailDeliveryError',
        publicMessage: 'No se pudo enviar el email. Revisa la configuracion de Brevo e intenta nuevamente.',
        code: 'EBREVO',
      },
    );

    error.status = response.status;
    error.response = parsedBody;
    throw error;
  }

  console.log('[EMAIL][BREVO][SENT]', {
    to,
    subject,
    messageId: parsedBody?.messageId || null,
  });

  return parsedBody;
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

  if (mode === EMAIL_MODE_BREVO) {
    try {
      return await sendBrevoEmail({ to, subject, html, text });
    } catch (error) {
      if (error.name === 'EmailConfigurationError') {
        console.error('[EMAIL][BREVO][CONFIG]', {
          message: error.message,
          missingEnvVars: error.meta?.missingEnvVars || [],
        });
        throw error;
      }

      logBrevoError(error, {
        from: process.env.EMAIL_FROM?.trim() || null,
      });
      throw error;
    }
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
