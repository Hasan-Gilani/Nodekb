const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user').User;
const passport = require('passport');

router.get('/register', (req, res) =>{
    res.render('register');
});

router.post('/register', (req, res) => {
    const reg_input = {
        name: req.body.name,
        email:req.body.email,
        username:req.body.username,
        password: req.body.password,
        password2: req.body.password2
    };

    const body_keys = Object.keys(req.body);
    for (const key of body_keys) {
        req.checkBody(`${key}`, `${key} is required`).notEmpty();
    }
    req.checkBody(`email`, 'Email is not valid').isEmail();
    req.checkBody(`password2`, `Passwords do not match`).equals(req.body.password);

    let errors = req.validationErrors();
    if(errors){
        res.render('register',{
            errors: errors
        })
    }
    else{
        let newUser = new User({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
                if(err)
                    console.log(err);
                newUser.password = hash;
                newUser.save( (err) => {
                    if(err) {
                        console.log(err);
                    }
                    else{
                        req.flash(`success`, 'You are now registered.');
                        res.redirect('/users/login');
                    }
                })
            })
        });
    }
});


router.get('/login', (req, res) =>{
    res.render('login');
});

router.post('/login', (req,res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect:'/users/login',
        failureFlash:true
    })(req, res, next);
});


router.get('/logout', (req, res) =>{
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});
module.exports = router;