require('dotenv').config();

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;
let server;

const shutdown = async (signal, exitCode = 0) => {
  console.log(`${signal} recibido. Cerrando servidor...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            return reject(error);
          }

          return resolve();
        });
      });
    }

    await disconnectDB();
  } catch (error) {
    console.error('Error durante el cierre del servidor:', error.message);
    process.exit(1);
  }

  process.exit(exitCode);
};

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
};

process.on('unhandledRejection', async (error) => {
  console.error('Unhandled rejection:', error);
  await shutdown('UNHANDLED_REJECTION', 1);
});

process.on('uncaughtException', async (error) => {
  console.error('Uncaught exception:', error);
  await shutdown('UNCAUGHT_EXCEPTION', 1);
});

process.on('SIGINT', async () => {
  await shutdown('SIGINT', 0);
});

process.on('SIGTERM', async () => {
  await shutdown('SIGTERM', 0);
});

startServer();
