const router = require('express').Router();
const createError = require('http-errors');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const Album = require('../models/album');

const sendAlbums = (req, res, next) => {
    Album.find({ user: req.user._id }, 'name comment hide end', (err, albums) => {
        if (err === null)
            res.send(albums);
        else
            next(createError(500, err));
    });
}

router.get('/', sendAlbums);

router.post('/create', (req, res, next) => {
    const data = req.body;
    data.user = req.user._id;
    data.created = Date.now();
    const album = new Album(data);

    album.save(err => {
        if (err !== null)
            next(createError(400, err.errors));
        else
            next();
    });
}, sendAlbums);

router.put('/update', (req, res, next) => {
    console.log(req.body)
    Album.findOne({ _id: req.query.id, user: req.user._id }, (err, album) => {
        if (err !== null)
            next(err);
        if (album === undefined)
            next(createError(404));
        Object.assign(album, req.body).save(err => {
            if (err !== null)
                next(createError(400, err.errors));
            next();
        });
    });
}, sendAlbums);

router.delete('/remove', (req, res, next) => {
    Album.deleteOne({ _id: req.query.id, user: req.user._id }, (err, album) => {
        if (err !== null)
            next(err);
        else if (album === undefined)
            next(createError(404));
        else {
            _.forEach(album.file, file => {
                fs.unlink(path.join(__dirname, '..', 'upload', file.name));
            });
            next();
        }
    });
}, sendAlbums);

module.exports = router;