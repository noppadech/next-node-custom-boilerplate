import type * as http from 'node:http';
import type { AddressInfo } from 'node:net';
import next from 'next';
import App from './App';
import logger from './lib/logger';

const app: App = new App();
let server: http.Server;

const port: number = Number.parseInt(process.env.PORT || '8080', 10);
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

function serverError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') {
    throw error;
  }
  // handle specific error codes here.
  throw error;
}

function serverListening(): void {
  const addressInfo: AddressInfo = <AddressInfo>server.address();
  logger.info(
    `Listening on ${addressInfo.address}:${port || 8080}`,
  );
}

nextApp.prepare().then(() => {
  app.init()
    .then(() => {
      app.express.set('port', port || 8080);

      server = app.httpServer;

      app.express.all('*', (req, res) => nextHandler(req, res));
      server.on('error', serverError);
      server.on('listening', serverListening);
      server.listen(port || 8080);
    })
    .catch((err: Error) => {
      logger.info('app.init error');
      logger.error(err.name);
      logger.error(err.message);
      logger.error(err.stack);
    });
});

process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Promise Rejection: reason:', reason.message);
  logger.error(reason.stack);
  // application specific logging, throwing an error, or other logic here
});
