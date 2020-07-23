const router = require('express').Router();
const createError = require('http-errors');
const passport = require('../packages/passport');
const path = require('path');
const User = require('../models/user');

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

router.get('/login', (req, res, next) => {
	res.status(200).sendFile(path.join(__dirname, '..', 'view', 'html', 'login.html'));
  });

router.post('/login', passport.authenticate('local', {
	successRedirect: '/'
}));

router.get('/logout', (req, res) => {
	req.logOut();
	res.redirect('/');
});

module.exports = router;