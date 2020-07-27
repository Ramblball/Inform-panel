const express = require('express');
const router = express.Router();
const path = require('path');
const _ = require('lodash');
const createError = require('http-errors');
const uuid = require('uuid');

const Album = require('../models/album');
const File = require('../models/file');

const getType = ext => {
    const fotoTypes = /jpg|png|bmp|jpeg/;
    const videoTypes = /gif|mp4|avi|wmv|mov|mkv/;

    if (fotoTypes.test(ext)) return true;
    if (videoTypes.test(ext)) return false;
    return undefined;
}

const sendFiles = (req, res, next) => {
    Album.findOne({ _id: req.params._id, user: req.user._id }, (err, album) => {
        if (err !== null)
            next(err);
        if (album === undefined)
            next(createError(404));
        res.status(200).send(album)
    });
}

router.get('/', (req, res, next) => {
    if (req.user._id === undefined)
        next(createError(401));
    else if (req.body.aid === undefined)
        next(createError(400));
    else 
        next();
}, sendFiles);

router.post('/upload', (req, res, next) => {
    if (req.files === undefined) {
        next({
            status: 400,
            message: 'No file uploaded'
        });
    } else {
        Album.findOne({ _id: req.params.id, user: req.user._id }, (err, album) => {
            if (err !== null)
                next(err);
            else if (album === undefined)
                next(createError(404));
            else {
                _.forEach(_.keysIn(req.files.files), key => {
                    let file = req.files.files[key];
                    let ext = path.extname(file.name).toLowerCase();
                    let type = getType(ext);
                    if (type === undefined)
                        return;
                    let name = uuid.v4() + '.' + ext
                    album.file.push(new File({
                        name: name,
                        type: type,

                        position: album.file.length + 1,
                        created: Date.now()
                    }));

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
    Album.findOne({ _id: req.body.aid, user: req.user._id }, (err, album) => {
        if (err !== null)
            next(err);
        else if (album === undefined)
            next(createError(404));
        else {
            let file = album.file.id(req.body.fid);
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
    Album.findOne({ _id: req.body.aid, user: req.user._id }, (err, album) => {
        if (err !== null)
            next(err);
        else if (album === undefined)
            next(createError(404));
        else {
            album.file.id(req.body.fid).remove();
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