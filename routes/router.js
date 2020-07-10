const router = require('express').Router();

const auth = require('./auth');
const album = require('./album');
const user = require('./users');

router.use('/', auth);

// router.use('/', (req, res, next) => {
//   if (req.isAuthenticated())
//     next();
//   else
//     res.redirect('/login');
// });

router.use('/', user);
router.use('/album', album);

module.exports = router;