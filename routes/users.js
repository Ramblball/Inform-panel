const router = require('express').Router();
const createError = require('http-errors');
const User = require('../models/user');

const sendUsers = (req, res, next) => {
  if (!req.user.status)
    next(createError(403, 'Common user'));
  User.find({}, (err, users) => {
    if (err)
      next(createError(500));
    else
      res.status(200).send(users);
  });
}

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
*/
router.get('/info', (req, res, next) => {
  res.json({
    status: req.user.status,
    name: req.user.name
  });
});

/**
 * @api {get} /user Request array of users
 * @apiName GetUsers
 * @apiGroup User
 * 
 * @apiPermission Autorized
 * @apiPermission Admin
 * 
 * @apiSuccess (200) {Object[]} body Users array
 * 
 * @apiError (403) {Number} status Common user
 * @apiError (500) {Number} status Server error
*/
router.get('/', sendUsers);

/**
 * @api {put} /update/:id Upadate user data
 * @apiName UserUpdate
 * @apiGroup User
 * 
 * @apiParam {ObjectId} id User Id
 * @apiParam {Boolean} [status]
 * @apiParam {String} [login]
 * @apiParam {String{..32}} [name[first]]
 * @apiParam {String{..32}} [name[last]]
 * @apiParam {String{..32}} [name[patronomic]]
 * @apiParam {String} [old] Old password
 * @apiParam {String} [new] New password
 * 
 * @apiPermission Autorized
 * @apiPermission Admin
 * 
 * @apiSuccess (200) {Number} status data updated
 * 
 * @apiError (400) {Number} status Invalid request
 * @apiError (403) {Number} status Common user
 * @apiError (404) {Number} status User not found
 * @apiError (500) {Number} status Server error
*/
router.put('/update', (req, res, next) => {
  if (!req.user.status)
    next(createError(403));
  User.findById(req.query.id, (err, user) => {
    if (err) next(createError(500, err));
    if (!user) next(createError(404));
    let updated = Object.assign(user, req.body);
    if (req.body.old && req.body.new) {
      if (user.validPassword(req.body.old)) {
        updated.setPassword(req.body.new);
      }
      else
        next(createError(400, 'invalid password'));
    }
    updated.save(err => {
      if (err)
        next(createError(400, err.errors));
      next();
    });
  });
}, sendUsers);

/**
 * @api {delete} /remove/:id Remove text
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
  if (!req.user.status)
    next(createError(403));
  User.deleteOne({ _id: req.query.id }, (err, info) => {
    if (err)
      createError(500, err);
    else 
      next();
  });
}, sendUsers);

module.exports = router;
