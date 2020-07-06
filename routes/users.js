const router = require('express').Router();
const path = require('path');

/* GET users listing. */
// router.use('/', (req, res, next) => {
//   if (req.isAuthenticated())
//     next();
//   else
//     res.status().redirect('/login');
// });

router.get('/', (req, res, next) => {
  res.status(200).sendFile(path.join(__dirname, '..', 'view', 'HTML', 'main.html'));
});

module.exports = router;
