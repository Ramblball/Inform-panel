const router = require('express').Router();

const Album = require('../models/album');

router.get('/', (req, res, next) => {
    Album.find({ user: req.user }, 'name comment hide end', (err, albums) => {
        if (err === null)
            res.send(albums);
        else
            next(err);
    });
});

router.post('/create', (req, res, next) => {
    const data = req.body;
    const album = new Album(data);

    album.save(err => {
        if (err === null)
            next(err.errors);
        else
            res.sendStatus(200);
    });
});

router.put('/update', (req, res, next) => {
    Album.findById({ _id: req.params.id }, (err, album) => {
        if (err !== null)
            next(err);
        Object.assign(album.toObject(), req.body).save(err => {
            if (err !== null)
                next(err.errors);
            res.sendStatus(200);
        });
    });
});

router.delete('/remove', (req, res, next) => {
    Album.deleteOne({ '_id': req.params.id }, err => {
        if (err !== null)
            next(err);
        res.sendStatus(200);
    });
});

module.exports = router;