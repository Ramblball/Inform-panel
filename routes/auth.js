const router = require('express').Router();
const passport = require('../packages/passport');
const User = require('../models/user');

router.post('/auth', (req, res, next) => {
	const data = req.body;
	const pass = data.password;
	data.password = undefined;

	let user = new User(data);
	user.setPassword(pass);

	user.save(err => {
		if (err)
			res.status(400).json(err.errors);
		else
			res.sendStatus(200);
	})
});

router.post('/login', passport.authorize('local', {
	successRedirect: '/user'
}));

router.get('/logout', (req, res) => {
	req.logOut();
	res.redirect('/');
})

module.exports = router;