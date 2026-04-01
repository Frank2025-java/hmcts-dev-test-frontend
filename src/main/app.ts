import * as path from 'path';

import axios from 'axios';
import * as bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';

import { HTTPError } from './HttpError';
import { setupApp } from './app.setup';
import { Nunjucks } from './modules/nunjucks';

const favicon = require('serve-favicon');

const env = process.env.NODE_ENV || 'development';
const developmentMode = env === 'development';

export const app = express();
app.locals.ENV = env;

new Nunjucks(developmentMode).enableFor(app);

app.use(favicon(path.join(__dirname, '/public/assets/images/favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, max-age=0, must-revalidate, no-store');
  next();
});

// isolated to make the route converage testable
setupApp(app, axios);

// error handler, with next argument so that Express recognises it
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HTTPError, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.log(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = env === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});
