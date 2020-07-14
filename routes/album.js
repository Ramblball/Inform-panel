const router = require('express').Router();

const Album = require('../models/album');

const sendAlbums = (req, res, next) => {
    Album.find({ user: req.user._id }, 'name comment hide end', (err, albums) => {
        if (err === null)
            res.send(albums);
        else
            next(err);
    });
}

router.get('/', sendAlbums);

router.post('/create', (req, res, next) => {
    const data = req.body;
    data.user = req.user._id;
    const album = new Album(data);

    album.save(err => {
        if (err !== null)
            next(err.errors);
        next();
    });
}, sendAlbums);

router.put('/update', (req, res, next) => {
    Album.findById({ _id: req.params.id }, (err, album) => {
        if (err !== null)
            next(err);
        Object.assign(album.toObject(), req.body).save(err => {
            if (err !== null)
                next(err.errors);
            next();
        });
    });
}, sendAlbums);

router.delete('/remove', (req, res, next) => {
    Album.deleteOne({ '_id': req.params.id }, err => {
        if (err !== null)
            next(err);
        next();
    });
}, sendAlbums);

module.exports = router;