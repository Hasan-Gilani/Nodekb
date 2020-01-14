const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const body_parser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

const articles = require('./routes/articles');
const users = require('./routes/users');
const config = require('./config/database');
const passport = require('passport');


const app = express();
app.use(body_parser.json());
app.use(body_parser.urlencoded({
    extended: true
}));

app.use(express.static(path.join(__dirname, 'public')));


//Express Middleware session
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

//Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;
        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg : msg,
            value : value
        };
    }
}));

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

//Load View Engine
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'pug');

let conn_string = config.mongoatlas.mongoURI;

mongoose.connect(conn_string, {useNewUrlParser: true, useUnifiedTopology: true})
    .then( ()=> console.log("MongoDB connected."))
    .catch( (err) => console.log(err));

const Article = require("./models/articles").Article;

app.get('*', (req,res, next) => {
    res.locals.user = req.user || null;
    next();
});

//Home Route
app.get('/', (req, res) => {
    Article.find({}, (err, articles) =>{
       if(err){
           console.log(err);
       }
       else{
           res.render('index', {
               title: 'Articles',
               articles: articles
           });
       }
    });
});


const port = process.env.port || 3000;

app.use('/articles', articles);
app.use('/users', users);

app.listen(port, (err) => {
    if(err)
        console.log(err);
    else {
        console.log(`Server started on port ${port}`);
    }

});
