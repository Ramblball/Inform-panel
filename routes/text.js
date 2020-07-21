const router = require('express').Router();
const createError = require('http-errors');
const Text = require('../models/text');

const textSender = (req, res, next) => {
    Text.find({ user: req.user._id }, 'text hide end', (err, texts) => {
        if (err !== null)
            next(createError(500, err));
        else
            res.status(200).send(texts);
    });
}

router.get('/', textSender);

router.post('/create', (req, res, next) => {
    const data = req.body;
    data.user = req.user._id;
    data.created = Date.now();
    const text = new Text(data);

    text.save(err => {
        if (err !== null)
            next(err.errors);
        else
            next();
    });
}, textSender);

router.put('/update', (req, res, next) => {
    Text.findOne({ _id: req.query.id, user: req.user._id }, (err, text) => {
        if (err !== null)
            next(err);
        else if (text === undefined)
            next(createError(404));
        Object.assign(text, req.body).save(err => {
            if (err !== null)
                next(createError(400, err.errors));
            else
                next();
        });
    });
}, textSender);

router.delete('/remove', (req, res, next) => {
    Text.deleteOne({ _id: req.query.id, user: req.user._id }, (err, text) => {
        if (err !== null)
            next(err);
        else if (text === undefined)
            next(createError(404));
        else
            next();
    });
}, textSender);

module.exports = router;