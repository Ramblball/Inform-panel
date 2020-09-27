const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const createError = require('http-errors');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const favicon = require('serve-favicon');
const config = require('config');
const mongoose = require('mongoose');
const User = require('./models/user');

const logger = require('./packages/logger').ErrorLog;
const passport = require('./packages/passport');

const router = require('./routes/router');

const app = express();

app.use('/static', express.static('view'));
app.use('/static', express.static('public'));
app.use('/static', express.static('upload'));
app.use('/api', express.static('doc'));

if (config.util.getEnv('NODE_ENV') === 'dev')
    app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session(config.get('session')));
app.use(fileUpload(config.get('upload')));
app.use(favicon(path.join(__dirname, 'public', 'favicon.svg')));

mongoose.connect(config.get('dbHost'), config.get('dbOptions'));
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

if (config.util.getEnv('NODE_ENV') === 'dev') {
    User.find({}, (err, doc) => {
        if (doc.length === 0) {
            const user = new User({
                status: true,
                login: 'root',
                name: {
                    first: 'root',
                    last: 'root',
                }
            });
            user.setPassword('root');
            user.save();
        }
    });
}

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Credentials', true)
    next()
});

app.use('/', router);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    switch (err.status) {
        case 404:
            res.send(404);
            break;
        case 500:
            logger.error(err.toString());
            res.end();
            break;
        default:
            logger.error(err.toString());
            res.status(err.status || 500).send(err);
            break;
    }
});

module.exports = app;
