const router = require('express').Router();
const path = require('path');

const auth = require('./auth');
const album = require('./album');
const text = require('./text');
const file = require('./file');
const user = require('./users');
const panel = require('./panel');

router.use('/panel', panel);
router.use('/', auth);

router.use('/', (req, res, next) => {
    if (req.isAuthenticated())
        next();
    else
        res.redirect('/login');
});

/**
 * @api {get} / Request main page
 * @apiName GetMainPage
 * @apiGroup User
 * 
 * @apiPermission Autorized
 * 
 * @apiSuccess (200) {String} text Main page
 * 
 * @apiError (404) {Number} status File not found
*/
router.get('/', (req, res, next) => {
    try {
      res.status(200).sendFile(path.join(__dirname, '..', 'view', 'html', 'main.html'));
    } catch (error) {
      next(createError(404));
    }
  });

router.use('/user', user);
router.use('/album', album);
router.use('/text', text);
router.use('/file', file);

module.exports = router;