const express = require('express');
const router = express.Router();
const path = require('path');
const createError = require('http-errors');

const Album = require('../models/album');
const Text = require('../models/text');

router.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, '..', 'view', 'html', 'panel.html'));
});

router.get('/album', (req, res, next) => {
    Album.find({ hide: false }, 'comment file', (err, albums) => {
        if (err !== null)
            next(err);
        else if (albums === null)
            next(createError(404));
        else
            res.status(200).send(albums);
    });
});

router.get('/text', (req, res, next) => {
    Text.find({ hide: false }, 'text', (err, text) => {
        if (err !== null)
            next(err);
        else if (text === null)
            next(createError(404));
        else
            res.status(200).send(text)
    });
});

module.exports = router;