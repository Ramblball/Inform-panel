const router = require('express').Router();
const Text = require('../models/text');

const textSender = (req, res, next) => {
    Text.find({ user: req.user }, 'text end', (err, texts) => {
        if (err !== null)
            next(err);
        res.status(200).send(texts);
    });
}

router.get('/', textSender);

router.post('/create', (req, res, next) => {
    const text = new Text(req.body);

    text.save(err => {
        if (err !== null)
            next(err.errors);
        next();
    });
}, textSender);

router.put('/update', (req, res, next) => {
    Text.findById(req.params.id, (err, text) => {
        if (err !== null)
            next(err);
        Object.assign(text, req.body).save(err => {
            if (err !== null)
                next(err.errors);
            next();
        });
    });
}, textSender);

router.delete('/remove', (req, res, next) => {
    Text.deleteOne({ '_id': req.params.id }, err => {
        if (err !== null)
            next(err);
        next();
    });
}, textSender);

module.exports = router;