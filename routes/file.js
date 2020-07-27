const express = require('express');
const router = express.Router();
const path = require('path');
const _ = require('lodash');
const createError = require('http-errors');
const uuid = require('uuid');

const Album = require('../models/album');

const getType = ext => {
    const fotoTypes = /jpg|png|bmp|jpeg/;
    const videoTypes = /gif|mp4|avi|wmv|mov|mkv/;

    if (fotoTypes.test(ext)) return true;
    if (videoTypes.test(ext)) return false;
    return undefined;
}

const sendFiles = (req, res, next) => {
    Album.findOne({ _id: req.query.aid, user: req.user._id }, (err, album) => {
        if (err !== null)
            next(err);
        if (album === null)
            next(createError(404));
        res.status(200).send(album.file)
    });
}

router.get('/', (req, res, next) => {
    if (req.user._id === undefined)
        next(createError(401));
    else if (req.query.aid === undefined)
        next(createError(400));
    else
        next();
}, sendFiles);

router.post('/upload', (req, res, next) => {
    console.log(req);
    if (req.files === undefined) {
        next({
            status: 400,
            message: 'No file uploaded'
        });
    } else {
        Album.findOne({ _id: req.query.id, user: req.user._id }, (err, album) => {
            if (err !== null)
                next(err);
            else if (album === null)
                next(createError(404));
            else {
                let files = _.isArray(req.files.files)
                    ? req.files.files
                    : req.files;

                console.log(files);
                _.forEach(_.keysIn(files), key => {
                    let file = files[key];
                    let ext = path.extname(file.name).toLowerCase();
                    let type = getType(ext);
                    if (type === undefined)
                        return;
                    let name = uuid.v4() + '.' + ext
                    album.file.push({
                        name: name,
                        type: type,

                        position: album.file.length + 1,
                        created: Date.now()
                    });

                    file.mv(path.join(__dirname, '..', 'upload', name));
                });

                album.save(err => {
                    if (err !== null)
                        next(err.errors);
                    else
                        res.status(200).end();
                });
            }
        });
    }
});

router.put('/update', (req, res, next) => {
    Album.findOne({ _id: req.query.aid, user: req.user._id }, (err, album) => {
        if (err !== null)
            next(err);
        else if (album === undefined)
            next(createError(404));
        else {
            let file = album.file.id(req.query.fid);
            Object.assign(file, req.body).save(err => {
                if (err !== null)
                    next(err.errors);
                else
                    next();
            });

        }
    });
}, sendFiles);

router.delete('/remove', (req, res, next) => {
    Album.findOne({ _id: req.query.aid, user: req.user._id }, (err, album) => {
        if (err !== null)
            next(err);
        else if (album === undefined)
            next(createError(404));
        else {
            album.file.id(req.query.fid).remove();
            album.save(err => {
                if (err !== null)
                    next(err.errors);
                else
                    next();
            })
        }
    });
}, sendFiles)

module.exports = router;