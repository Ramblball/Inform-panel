const router = require('express').Router();
const createError = require('http-errors');
const User = require('../models/user');
const path = require('path');

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

/**
 * @api {get} /info Request info about user
 * @apiName GetInfo
 * @apiGroup User
 * 
 * @apiPermission Autorized
 * 
 * @apiSuccessExample (200) {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": false,
 *       "name": {
 *         "first": "FirstName",
 *         "last": "LastName",
 *         ["patronomic": "Patronomic"]
 *       }
 *     }
 * 
 * @apiError (404) {Number} status File not found
*/
router.get('/info', (req, res, next) => {
  res.json({
    status: req.user.status,
    name: req.user.name
  });
});

/**
 * @api {put} /update Change user password
 * @apiName UpdatePassword
 * @apiGroup User
 * 
 * @apiParam {String} old Old password
 * @apiParam {String} new New password
 * 
 * @apiPermission Autorized
 * 
 * @apiSuccess (200) {Number} status Password changed
 * 
 * @apiError (400) {Number} status Invalid request
 * @apiError (404) {Number} status User not found
 * @apiError (500) {Number} status Server error
*/
router.put('/update', (req, res, next) => {
  User.findById(req.user._id, (err, user) => {
    if (err !== null) next(createError(500, err));
    if (user === null) next(createError(404));
    if (user.validPassword(req.body.old)) {
      user.setPssword(req.body.new);
      user.save(err => {
        if (err !== null)
          next(createError(400, err));
        res.sendStatus(200);
      });
    }
    else
      next(createError(400, 'invalid password'));
  });
});

module.exports = router;
