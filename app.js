const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const createError = require('http-errors');
const session = require('express-session');
const config = require('config');
const mongoose = require('mongoose');
const session = require('express-session');

const passport = require('./packages/passport');

const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

if (config.util.getEnv('NODE_ENV') !== 'test')
  app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: config.get('cookieSecret'),
  saveUninitialized: false,
  resave: false,
}));

mongoose.connect(config.get('dbHost'), config.get('dbOptions'));
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
	res.setHeader('Access-Control-Allow-Credentials', true)
	next()
});

app.use('/', authRouter);
app.use('/user', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).send(err.message);
  // res.render('error');
});

module.exports = app;
