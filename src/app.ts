import express from 'express';
import compression from 'compression'; // compresses requests
import session from 'express-session';
import bodyParser from 'body-parser';
import lusca from 'lusca';
import mongo from 'connect-mongo';
import flash from 'express-flash';
import path from 'path';
import mongoose from 'mongoose';
import passport from 'passport';
import bluebird from 'bluebird';
import cors from 'cors';
import serveStatic from 'serve-static';
import { MONGODB_URI, SESSION_SECRET } from './config/secrets';

import router from './routes';

const MongoStore = mongo(session);

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
(<any>mongoose).Promise = bluebird;

mongoose
  .connect(mongoUrl, { useNewUrlParser: true })
  .then(() => {
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
  })
  .catch((err) => {
    console.log(
      'MongoDB connection error. Please make sure MongoDB is running. ' + err
    );
    // process.exit();
  });

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
      url: mongoUrl,
      autoReconnect: true,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// CROS Settings
const whitelist = [
  'http://localhost:4000',
  'http://localhost:3000',
  'http://localhost:4001',
  'http://127.0.0.1:61199',
];
const corsOptions = {
  origin: function(origin: any, callback: any) {
    callback(undefined, true);
    // Disable CORS check for now 
    // if (whitelist.indexOf(origin) !== -1 || !origin) {
    //   callback(undefined, true);
    // } else {
    //   callback(new Error(`Not allowed by CORS ${origin}`));
    // }
  },
};

// Apply CORS Optioins to All Requests
app.options('*', cors(corsOptions));
app.get('*', cors(corsOptions));
app.post('*', cors(corsOptions));
app.patch('*', cors(corsOptions));
app.delete('*', cors(corsOptions));

// Apply routes
app.use(router);

// Serve the static file
app.use(serveStatic('frontend', { index: 'index.html' }));

export default app;
