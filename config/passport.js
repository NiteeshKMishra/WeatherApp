var { Users } = require('../models/users');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function (username, password, done) {
    Users.findOne({ username: username, password: password }, function (err, user) {
      if (err) { return done(err, { message: 'Cannot connect to server please try after some time' }); }
      if (!user) {
        return done(null, false, { message: 'Please Enter a valid Email or password' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.username);
})

passport.deserializeUser((username, done) => {
  Users.findOne({ username: username }, function (err, user) {
    if (err) { return done(err); }
    if (!user) {
      done(null, false, { message: 'Credentials' });
    }
    done(null, user);
  });
});

module.exports = { passport };