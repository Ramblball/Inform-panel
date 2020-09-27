const express = require('express');
const router = express.Router();
const path = require('path');
const createError = require('http-errors');

const Album = require('../models/album');
const Text = require('../models/text');

/**
 * @api {get} /panel Request panel page
 * @apiName GetPanelPage
 * @apiGroup Panel
 * 
 * @apiSuccess (200) {String} text Panel page
 * 
 * @apiError (404) {Number} status File not found
*/
router.get('/', (req, res, next) => {
    try {
        res.sendFile(path.join(__dirname, '..', 'view', 'html', 'panel.html'));
    } catch (error) {
        next(createError(404, 'File not found'));
    }
});

/**
 * @api {get} /panel/album Request albums
 * @apiName GetAlbumsForPanel
 * @apiGroup Panel
 * 
 * @apiSuccess (200) {Object[]} body Albums array
 * 
 * @apiError (500) {Number} status Server error
*/
router.get('/album', (req, res, next) => {
    Album.find({ hide: false }, 'comment file', (err, albums) => {
        if (err)
            next(createError(500, err));
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
 * 
 * @apiError (500) {Number} status Server error
*/
router.get('/text', (req, res, next) => {
    Text.find({ hide: false }, 'text', (err, text) => {
        if (err)
            next(createError(500, err));
        else
            res.status(200).send(text)
    });
});

module.exports = router;