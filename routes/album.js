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

/**
 * @api {get} /album Request albums
 * @apiName GetAlbums
 * @apiGroup Album
 * 
 * @apiPermission Autorized
 * 
 * @apiSuccess (200) {Object[]} body Albums array
 * 
 * @apiError (500) {Number} status Server error
*/
router.get('/', sendAlbums);

/**
 * @api {post} /create Create new album
 * @apiName CreateAlbum
 * @apiGroup Album
 * 
 * @apiParam {String{..64}} name
 * @apiParam {String{..256}} [comment=' ']
 * @apiParam {Boolean} [hide=false]
 * @apiParam {Number} end Date in milliseconds
 * 
 * @apiPermission Autorized
 * 
 * @apiSuccess (200) {Object[]} body Albums array
 * 
 * @apiError (400) {Number} status Invalid request
 * @apiError (500) {Number} status Server error
*/
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


/**
 * @api {put} /update/:id Update album
 * @apiName UpdateAlbum
 * @apiGroup Album
 * 
 * @apiParam {ObjectId} id Album Id
 * @apiParam {String{..64}} [name]
 * @apiParam {String{..256}} [comment]
 * @apiParam {Boolean} [hide]
 * @apiParam {Number} [end] Date in milliseconds
 * 
 * @apiPermission Autorized
 * 
 * @apiSuccess (200) {Object[]} body Albums array
 * 
 * @apiError (400) {Number} status Invalid request
 * @apiError (404) {Number} status Album not found
 * @apiError (500) {Number} status Server error
*/
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

/**
 * @api {delete} /remove/:id Remove album
 * @apiName RemoveAlbum
 * @apiGroup Album
 * 
 * @apiParam {ObjectId} id Album Id
 * 
 * @apiPermission Autorized
 * 
 * @apiSuccess (200) {Object[]} body Albums array
 * 
 * @apiError (404) {Number} status Album not found
 * @apiError (500) {Number} status Server error
*/
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