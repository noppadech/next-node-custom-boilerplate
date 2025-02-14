import type { IBaseResponse } from './types/IBaseResponse';
import http from 'node:http';
import path from 'node:path';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger.json';
import addErrorHandler from './middleware/error-handler';
import registerRoutes from './routes';
import 'dotenv/config';

export default class App {
  public express!: express.Application;

  public httpServer!: http.Server;

  public async init(): Promise<void> {
    const { NODE_ENV } = process.env;
    this.express = express();
    this.httpServer = http.createServer(this.express);

    // add all global middleware like cors
    this.middleware();

    // // register the all routes
    this.routes();

    // add the middleware to handle error, make sure to add if after registering routes method
    this.express.use(addErrorHandler);

    // In a development/test environment, Swagger will be enabled.
    if (NODE_ENV && NODE_ENV !== 'production') {
      this.setupSwaggerDocs();

      this.express.use(express.static(path.join(__dirname, '../public')));
      this.express.use('/_next', express.static(path.join(__dirname, '../.next')));
    }
  }

  /**
   * here register your all routes
   */
  private routes(): void {
    this.express.get('/base', this.basePathRoute);
    this.express.get('/web', this.parseRequestHeader, this.basePathRoute);
    this.express.use('/', registerRoutes());
  }

  /**
   * here you can apply your middlewares
   */
  private middleware(): void {
    // support application/json type post data
    // support application/x-www-form-urlencoded post data
    // Helmet can help protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately.
    this.express.use(helmet({ contentSecurityPolicy: false }));
    this.express.use(express.json({ limit: '100mb' }));
    this.express.use(
      express.urlencoded({ limit: '100mb', extended: true }),
    );
    // add multiple cors options as per your use
    const corsOptions = {
      origin: [
        'http://localhost:3000',
        'http://localhost:8082/',
        'http://example.com/',
        'http://127.0.0.1:8082',
        'http://127.0.0.1:3000',
      ],
      // exposedHeaders: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      optionsSuccessStatus: 200,
      credentials: true, // for authorization
    };
    this.express.use(cors(corsOptions));
    this.express.use(express.static(path.join(__dirname, '../../public')));
    this.express.use('/_next', express.static(path.join(__dirname, '../../.next')));
  }

  private parseRequestHeader(
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction,
  ): void {
    // parse request header
    const xInternalAuthorization = req.headers['x-internal-authorization'];
    const authorization = req.headers.authorization;

    if (!xInternalAuthorization) {
      const error = {
        status: StatusCodes.UNAUTHORIZED,
        name: 'Internal Token Missing',
      };
      next(error);
    } else if (!authorization) {
      const error = {
        status: StatusCodes.UNAUTHORIZED,
        name: 'External Token Missing',
      };
      next(error);
    } else {
      next();
    }
  }

  private basePathRoute(
    request: express.Request,
    response: express.Response,
  ): void {
    const xInternalAuthorization = request.headers['x-internal-authorization'];
    let result: IBaseResponse = { message: 'base path' };
    if (xInternalAuthorization) {
      result = {
        ...result,
        internal_access_token: xInternalAuthorization,
      };
    }
    response.json(result);
  }

  private setupSwaggerDocs(): void {
    this.express.use(
      '/docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument),
    );
  }
}
