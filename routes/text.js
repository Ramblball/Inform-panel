const router = require('express').Router();
const createError = require('http-errors');
const Text = require('../models/text');

const textSender = (req, res, next) => {
    Text.find({ user: req.user._id }, 'text hide end', (err, texts) => {
        if (err)
            next(createError(500, err));
        else
            res.send(texts);
    });
}

/**
 * @api {get} /text Request texts
 * @apiName GetTexts
 * @apiGroup Text
 * 
 * @apiPermission Autorized
 * 
 * @apiSuccess (200) {Object[]} body Texts array
 * 
 * @apiError (500) {Number} status Server error
*/
router.get('/', textSender);

/**
 * @api {post} /text/create Create new text
 * @apiName CreateText
 * @apiGroup Text
 * 
 * @apiParam {String{..512}} text
 * @apiParam {Boolean} [hide=false]
 * @apiParam {Number} end Date in milliseconds
 * 
 * @apiPermission Autorized
 * 
 * @apiSuccess (201) {Object[]} body Texts array
 * 
 * @apiError (400) {Number} status Invalid request
 * @apiError (500) {Number} status Server error
*/
router.post('/create', (req, res, next) => {
    const data = req.body;
    data.user = req.user._id;
    data.created = Date.now();
    const text = new Text(data);

    text.save(err => {
        if (err)
            next(err.errors);
        else {
            res.status(201);
            next();
        }
    });
}, textSender);

/**
 * @api {put} /text/update/:id Update text
 * @apiName UpdateText
 * @apiGroup Text
 * 
 * @apiParam {ObjectId} id text Id
 * @apiParam {String{..512}} [text]
 * @apiParam {Boolean} [hide]
 * @apiParam {Number} [end] Date in milliseconds
 * 
 * @apiPermission Autorized
 * 
 * @apiSuccess (200) {Object[]} body Texts array
 * 
 * @apiError (400) {Number} status Invalid request
 * @apiError (404) {Number} status Text not found
 * @apiError (500) {Number} status Server error
*/
router.put('/update', (req, res, next) => {
    Text.findOne({ _id: req.query.id, user: req.user._id }, (err, text) => {
        if (err)
            next(err);
        else if (!text)
            next(createError(404));
        Object.assign(text, req.body).save(err => {
            if (err)
                next(createError(400, err.errors));
            else
                next();
        });
    });
}, textSender);

/**
 * @api {delete} /text/remove/:id Remove text
 * @apiName RemoveText
 * @apiGroup Text
 * 
 * @apiParam {ObjectId} id Text Id
 * 
 * @apiPermission Autorized
 * 
 * @apiSuccess (200) {Object[]} body Text array
 * 
 * @apiError (500) {Number} status Server error
*/
router.delete('/remove', (req, res, next) => {
    Text.deleteOne({ _id: req.query.id, user: req.user._id }, (err, info) => {
        if (err)
            next(createError(500, err));
        else
            next();
    });
}, textSender);

module.exports = router;