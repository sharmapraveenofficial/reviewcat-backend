import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { setupPassport } from './config/passport';

const createApp = (): Application => {
  const app: Application = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  }));

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Cookie parser
  app.use(cookieParser());
  
  // Session (required for OAuth)
  app.use(session({
    secret: process.env.SESSION_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    }
  }));
  
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
  setupPassport();

  // Routes
  app.use('/api', routes);
  
  // Default route
  app.get('/', (req, res) => {
    res.send('Hello, Express with TypeScript!');
  });

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp; 