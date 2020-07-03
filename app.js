const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const createError = require('http-errors');
const path = require('path');
const fs = require('fs');

const passport = require('./packages/passport');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: config.cookieSecret,
  saveUninitialized: false,
  resave: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
	res.setHeader('Access-Control-Allow-Credentials', true)
	next()
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
  res.sendStatus(err.status || 500);
  // res.render('error');
});

module.exports = app;
