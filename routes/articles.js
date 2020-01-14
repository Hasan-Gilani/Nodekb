const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();


let Article = require('../models/articles').Article;
let User = require('../models/user').User;


router.get('/add', ensureAuthenticated,(req, res) => {
    res.render('add_article', {
        title: 'Add Article'
    });
});


router.get('/:id', (req, res) => {
    Article.findById({_id:req.params.id})
        .then( (data) => {
            if(data)
            {
                User.findById(data.author, (err, user) =>{
                    res.render('article', {
                        article: data,
                        author: user.name
                    });
                })
            }
        })
        .catch( (err) => {console.log(err)})

});


//add submit post route
router.post('/add', (req,res) => {
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('body','Body is required').notEmpty();

    let errors = req.validationErrors();
    if(errors){
        res.render('add_article',{
            title: 'Add Article',
            errors: errors
        });
    }
    else{
        const new_article = new Article({
            title: req.body.title,
            author: req.user._id,
            body: req.body.body
        });
        new_article.save()
            .then( () => {
                req.flash('success', 'Article Added');
                res.redirect('/');
            })
            .catch( (err) => {
                console.log(err);
            });
    }
});

//Load Edit Form
//Add Route
router.get('/edit/:id', ensureAuthenticated,(req, res) => {
    Article.findById({_id:req.params.id})
        .then( (data) => {
            if(data.author != req.user._id){
                req.flash('danger', 'Not Authorized');
                res.redirect('/');
            }
            else{
                res.render('edit_article', {
                    title:'Edit Article',
                    article: data
                })
            }
        })
        .catch( (err) => {console.log(err)});
});

router.post('/edit/:id', (req, res) => {
    let  article = req.body;
    article._id = req.params.id;
    const body_keys = Object.keys(req.body);
    for (const key of body_keys)
        req.checkBody(`${key}`, `${key} is required`).notEmpty();

    let errors = req.validationErrors();
    if(errors){
        res.render('edit_article', {
            title: 'Edit Article',
            article: article,
            errors: errors
        });
    }
    else {
        let query = {_id: req.params.id};

        Article.updateOne(query, article, (err) => {
            if(err){
                console.log(err);
                res.redirect('/');
            }
            else{
                req.flash('success',`Article Updated`);
                res.redirect('/');
            }
        });
    }
});

router.delete('/:id', (req, res) => {
    if(!req.user){
        res.status(500).send();
    }
    else{
        Article.findById( req.params.id, (err, article) => {
            if(article.author != req.user._id){
                res.status(500).send();
            }else{
                Article.deleteOne(
                    {_id: req.params.id}, (err) =>{
                        if(err){
                            console.log(err)
                        }
                        else{
                            res.send('Success');
                        }
                    }
                );
            }
        })
    }
});

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;