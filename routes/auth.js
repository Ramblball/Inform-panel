const router = require('express').Router();
const createError = require('http-errors');
const passport = require('../packages/passport');
const path = require('path');
const User = require('../models/user');

/**
 * @api {post} /auth Registrate new user
 * @apiName RegistrateUser
 * @apiGroup Auth
 * 
 * @apiParam {Boolean} [status=false]
 * @apiParam {String} login
 * @apiParam {Object} name
 * @apiParam {String{..32}} name[first]
 * @apiParam {String{..32}} name[last]
 * @apiParam {String{..32}} [name[patronomic]]
 * @apiParam {String} password
 * 
 * @apiPermission Autorized
 * @apiPermission Admin
 * 
 * @apiSuccess (200) status User created
 * 
 * @apiError (400) {Number} status Invalid request
*/
router.post('/auth', (req, res, next) => {
	const data = req.body;
	const pass = data.password;
	if (pass === undefined) {
		next(createError(400, {
			errors: {
				password: {
					properties: {
						message: 'Path `password` is required.',
						type: 'required',
						path: 'password'
					},
					kind: 'required',
					path: 'password'
				}
			}
		}));
	}
	data.password = undefined;

	let user = new User(data);
	user.setPassword(pass);

	user.save(err => {
		if (err)
			next(createError(400, err));
		else
			res.sendStatus(200);
	})
});

/**
 * @api {get} /login Request login page
 * @apiName GetLoginPage
 * @apiGroup Auth
 * 
 * @apiSuccess (200) {String} text Login page
 * 
 * @apiError (404) {Number} status File not found
*/
router.get('/login', (req, res, next) => {
	try {
		res.status(200).sendFile(path.join(__dirname, '..', 'view', 'html', 'login.html'));
	} catch (error) {
		next(createError(404, 'File not found'));
	}
});

/**
* @api {post} /login Authenticate User
* @apiName AuthenticateUser
* @apiGroup Auth
* 
* @apiParam {String} login
* @apiParam {String} password
* 
* @apiSuccess (302) redirect Redirect to /

* @apiError (401) {Number} status Unautorized
*/
router.post('/login', passport.authenticate('local', {
	successRedirect: '/'
}));

/**
* @api {get} /logout Registrate new user
* @apiName LogoutUser
* @apiGroup Auth
* 
* @apiParam {String} login
* @apiParam {String} password
* 
* @apiSuccess (302) redirect Redirect to /login
*/
router.get('/logout', (req, res) => {
	req.logOut();
	res.redirect('/login');
});

module.exports = router;