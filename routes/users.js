const router = require('express').Router();
const createError = require('http-errors');
const User = require('../models/user');
const path = require('path');

router.get('/', (req, res, next) => {
  res.status(200).sendFile(path.join(__dirname, '..', 'view', 'html', 'main.html'));
});

router.get('/info', (req, res, next) => {
  res.json({
    status: req.user.status,
    name: req.user.name
  });
});

router.put('/update', (req, res, next) => {
  User.findById(req.user._id, (err, user) => {
    if (err !== null) next(createError(500, err));
    if (user.validPassword(req.body.old)) {
      user.setPssword(req.body.new);
      user.save(err => {
        if(err !== null)
          next(createError(400, err));
        res.sendStatus(200);
      });
    }
    else
      next(createError(400, 'invalid password'));
  });
});

module.exports = router;
