const express = require('express');
const router = express.Router();
const path = require('path');
const _ = require('lodash');
const uuid = require('uuid/v4');

const Album = require('../models/album');
const File = require('../models/file');

const getType = ext => {
    const fotoTypes = /jpg|png|bmp|jpeg/;
    const videoTypes = /gif|mp4|avi|wmv|mov|mkv/;

    if (fotoTypes.test(ext)) return true;
    if (videoTypes.test(ext)) return false;
    return undefined;
}

router.get('/', (req, res, next) => {
    Album.findById(req.params._id, (err, album) => {
        if (err === null)
            res.status(200).send(album.files);
        else
            next(err);
    });
});

router.post('/upload', (req, res, next) => {
    if (!req.files) {
        next({
            status: 400,
            message: 'No file uploaded'
        });
    } else {
        Album.findById(req.params._id, (err, album) => {
            if (err !== null)
                next(err);
            else {
                _.forEach(_.keysIn(req.files.files), key => {
                    let file = req.files.files[key];
                    let ext = path.extname(file.name).toLowerCase();
                    let type = getType(ext);
                    if (type === undefined)
                        continue;
                    let name = uuid() + '.' + ext
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
    Album.findById(req.body.aid, (err, album) => {
        if (err !== null)
            next(err);
        else {
            let file = album.file.id(req.body.fid);
            Object.assign(file, req.body).save(err => {
                if (err !== null)
                    next(err.errors);
                else 
                    res.status(200).send(album.file)
            });

        }
    });
});

module.exports = router;