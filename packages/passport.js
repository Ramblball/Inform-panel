const passport = require('passport');
const Strategy = require('passport-local');
const User = require('../models/user');

passport.use(new Strategy({
	usernameField: 'login',
	passwordField: 'password'
},
	(login, password, done) => {
		User.findOne({ login: login }, (err, user) => {
			if (err) { return done(err); }
			if (!user) {
				return done(null, false, { message: 'Неверно указан логин' });
			}
			if (!user.validPassword(password)) {
				return done(null, false, { message: 'Неверно указан пароль' });
			}
			return done(null, user);
		})
	}
));

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});