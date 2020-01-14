const LocalStratergy = require('passport-local').Strategy;
const User = require('../models/user').User;
const config = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = function(passport){
    passport.use(new LocalStratergy(
        function (username, password, done) {
            User.findOne({username: username}, (err, user) => {
                if(err) {return done(err)}
                if(!user){
                    return done(null, false, {message: "Incorrect username"});
                }
                bcrypt.compare(password, user.password)
                    .then((isMatch) => {
                        if(isMatch){
                            return done(null, user);
                        }
                        else{
                            return done(null, false, {message: "Wrong Password"});
                        }
                    })
                    .catch(err => console.log(err));
            })
        }
    ));
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
};