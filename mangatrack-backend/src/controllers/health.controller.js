const dns = require('node:dns').promises;
const net = require('node:net');

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

const resolveAddresses = async (host, family) => {
  try {
    const addresses = await dns.lookup(host, { all: true, family });

    return {
      ok: true,
      family,
      addresses: addresses.map((entry) => entry.address),
    };
  } catch (error) {
    return {
      ok: false,
      family,
      addresses: [],
      error: {
        message: error.message,
        code: error.code || null,
      },
    };
  }
};

const testTcpConnection = ({ host, port, family, timeoutMs }) => new Promise((resolve) => {
  const startedAt = Date.now();
  const socket = net.connect({
    host,
    port,
    family,
  });

  let settled = false;

  const finish = (payload) => {
    if (settled) {
      return;
    }

    settled = true;
    socket.removeAllListeners();
    socket.destroy();
    resolve({
      family,
      host,
      port,
      durationMs: Date.now() - startedAt,
      ...payload,
    });
  };

  socket.setTimeout(timeoutMs);

  socket.once('connect', () => {
    finish({
      ok: true,
      localAddress: socket.localAddress || null,
      localPort: socket.localPort || null,
      remoteAddress: socket.remoteAddress || null,
      remotePort: socket.remotePort || null,
    });
  });

  socket.once('timeout', () => {
    finish({
      ok: false,
      error: {
        message: 'Connection timeout',
        code: 'ETIMEDOUT',
      },
    });
  });

  socket.once('error', (error) => {
    finish({
      ok: false,
      error: {
        message: error.message,
        code: error.code || null,
      },
    });
  });
});

const getSmtpDiagnostics = async (req, res) => {
  const isBrevoMode = process.env.EMAIL_MODE?.trim().toLowerCase() === 'brevo';
  const host = isBrevoMode
    ? process.env.BREVO_SMTP_HOST?.trim() || 'smtp-relay.brevo.com'
    : process.env.EMAIL_HOST?.trim() || 'smtp-relay.brevo.com';
  const port = Number.parseInt(
    isBrevoMode
      ? process.env.BREVO_SMTP_PORT || '2525'
      : process.env.EMAIL_PORT || '2525',
    10,
  );
  const timeoutMs = 8000;

  const [ipv4Lookup, ipv6Lookup] = await Promise.all([
    resolveAddresses(host, 4),
    resolveAddresses(host, 6),
  ]);

  const ipv4Target = ipv4Lookup.addresses[0] || null;
  const ipv6Target = ipv6Lookup.addresses[0] || null;

  const tests = [];

  if (ipv4Target) {
    tests.push(testTcpConnection({
      host: ipv4Target,
      port,
      family: 4,
      timeoutMs,
    }));
  }

  if (ipv6Target) {
    tests.push(testTcpConnection({
      host: ipv6Target,
      port,
      family: 6,
      timeoutMs,
    }));
  }

  const connections = await Promise.all(tests);

  res.status(200).json({
    success: true,
    message: 'Diagnóstico SMTP generado.',
    data: {
      host,
      port,
      timeoutMs,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      lookups: {
        ipv4: ipv4Lookup,
        ipv6: ipv6Lookup,
      },
      connections,
    },
  });
};

module.exports = {
  getHealthStatus,
  getSmtpDiagnostics,
};
