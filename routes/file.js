const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const createError = require('http-errors');
const uuid = require('uuid');

const Album = require('../models/album');

/**
 * Separates files into photo and video by extension
 * @param {String} ext File extension
 * @returns {Boolean} true - foto
 * @returns {Boolean} false - video
 * @returns {undefined} undefined - unknown format
 */
const getType = ext => {
    const fotoTypes = /jpg|png|bmp|jpeg/;
    const videoTypes = /gif|mp4|avi|wmv|mov|mkv/;

    if (fotoTypes.test(ext)) return true;
    if (videoTypes.test(ext)) return false;
    return undefined;
}

const sendFiles = (req, res, next) => {
    Album.findOne({ _id: req.query.aid, user: req.user._id }, (err, album) => {
        if (err)
            next(err);
        if (!album)
            next(createError(404));
        res.status(200).send(album.file)
    });
}

/**
 * @api {get} /file/:id Request files
 * @apiName GetFiles
 * @apiGroup File
 * 
 * @apiParam {ObjectId} id Album id
 * 
 * @apiPermission Autorized
 * 
 * @apiSuccess (200) {Object[]} body Files array
 * 
 * @apiError (500) {Number} status Server error
*/
router.get('/', sendFiles);

/**
 * @api {post} /upload Uplaoad files
 * @apiName UploadFiles
 * @apiGroup File
 * 
 * @apiParam {ObjectId} id Album id
 * 
 * @apiPermission Autorized
 * 
 * @apiSuccess (200) {Object[]} body Files array
 * 
 * @apiError (400) {Number} status Invalid request
 * @apiError (404) {Number} status Album not found
 * @apiError (500) {Number} status Server error
*/
router.post('/upload', (req, res, next) => {
    if (!req.files) {
        next({
            status: 400,
            message: 'No file uploaded'
        });
    } else {
        Album.findOne({ _id: req.query.id, user: req.user._id }, (err, album) => {
            if (err)
                next(createError(500, err));
            else if (!album)
                next(createError(404));
            else {
                let files = _.isArray(req.files.files)
                    ? req.files.files
                    : req.files;

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
                    if (err)
                        next(createError(400, err.errors));
                    else
                        res.status(200).end();
                });
            }
        });
    }
});

/**
 * @api {put} /update/:aid:fid Update file
 * @apiName UpdateFile
 * @apiGroup File
 * 
 * @apiParam {ObjectId} aid Album Id
 * @apiParam {ObjectId} fid File Id
 * @apiParam {String{..256}} [comment]
 * @apiParam {Boolean} [hide]
 * @apiParam {Number} [position]
 * 
 * @apiPermission Autorized
 * 
 * @apiSuccess (200) {Object[]} body Files array
 * 
 * @apiError (400) {Number} status Invalid request
 * @apiError (404) {Number} status Album or file not found
 * @apiError (500) {Number} status Server error
*/
router.put('/update', (req, res, next) => {
    Album.findOne({ _id: req.query.aid, user: req.user._id }, (err, album) => {
        if (err)
            next(createError(500, err));
        else if (!album)
            next(createError(404));
        else {
            let file = album.file.id(req.query.fid);
            if (!file)
                next(createError(404));
            Object.assign(file, req.body).save(err => {
                if (err)
                    next(createError(400, err.errors));
                else
                    next();
            });

        }
    });
}, sendFiles);

/**
 * @api {delete} /remove/:aid:fid Remove file
 * @apiName RemoveFile
 * @apiGroup File
 * 
 * @apiParam {ObjectId} aid Album Id
 * @apiParam {ObjectId} fid File Id
 * 
 * @apiPermission Autorized
 * 
 * @apiSuccess (200) {Object[]} body Files array
 * 
 * @apiError (404) {Number} status Album or file not found
 * @apiError (500) {Number} status Server error
*/
router.delete('/remove', (req, res, next) => {
    Album.findOne({ _id: req.query.aid, user: req.user._id }, (err, album) => {
        if (err)
            next(err);
        else if (!album)
            next(createError(404));
        else {
            let file = album.file.id(req.query.fid);
            fs.unlinkSync(path.join(__dirname, '..', 'upload', file.name), (err) => {});
            file.remove();
            album.save(err => {
                if (err)
                    next(createError(500, err.errors));
                else
                    next();
            });
        }
    });
}, sendFiles)

module.exports = router;