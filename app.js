// -----requuire npm packages-----
// const createError = require('http-errors');
const express = require('express');
const path = require('path');
// const bodyparser = require('body-parser')
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

const app = express();

// create app connect to db
mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/brand-title', {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const dbName = 'brand-title';
mongoose.connect(`mongodb://localhost/${dbName}`);

// -----Middleware-----
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));

// -----Use Session-----
app.use(session({
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  }),
  secret: 'some-string',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// app.use(flash());

app.use((req, res, next) => {
  app.locals.currentUser = req.session.currentUser;
  next();
});

// -----Routes-----
app.use('/', indexRouter);
app.use('/auth', authRouter);

// -- 404 and error handler

// NOTE: requires a views/not-found.ejs template
app.use((req, res, next) => {
  res.status(404);
  res.render('not-found');
});

// NOTE: requires a views/error.ejs template
app.use((err, req, res, next) => {
  // always log the error
  console.error('ERROR', req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500);
    res.render('error');
  }
});

module.exports = app;
