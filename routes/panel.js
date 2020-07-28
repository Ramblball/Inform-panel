const express = require('express');
const router = express.Router();
const path = require('path');
const createError = require('http-errors');

const Album = require('../models/album');
const Text = require('../models/text');

/**
 * @api {get} /panel/ Request panel page
 * @apiName GetPanelPage
 * @apiGroup Panel
 * 
 * @apiSuccess (200) {File} body Panel page
 * @apiError (404) {Object} status File not found
*/
router.get('/', (req, res, next) => {
    try {
        res.sendFile(path.join(__dirname, '..', 'view', 'html', 'panel.html'));
    } catch (error) {
        next(createError(404, error));
    }
});

/**
 * @api {get} /panel/album Request albums
 * @apiName GetAlbumsForPanel
 * @apiGroup Panel
 * 
 * @apiSuccess (200) {Object[]} body Albums array
 * @apiError (404) {Object} status Albums not found
 * @apiError (500) {Object} status Server error
*/
router.get('/album', (req, res, next) => {
    Album.find({ hide: false }, 'comment file', (err, albums) => {
        if (err !== null)
            next(createError(500, err));
        else if (albums === null)
            next(createError(404));
        else
            res.status(200).send(albums);
    });
});

/**
 * @api {get} /panel/text Request text
 * @apiName GetTextForPanel
 * @apiGroup Panel
 * 
 * @apiSuccess (200) {Object[]} body Texts array
 * @apiError (404) {Object} status Texts not found
 * @apiError (500) {Object} status Server error
*/
router.get('/text', (req, res, next) => {
    Text.find({ hide: false }, 'text', (err, text) => {
        if (err !== null)
            next(createError(500, err));
        else if (text === null)
            next(createError(404));
        else
            res.status(200).send(text)
    });
});

module.exports = router;