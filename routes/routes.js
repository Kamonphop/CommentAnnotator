var Comment = require('../models/comment');
var Amzreviews = require('../models/amzreview');

/*for data tokenizer*/
var Tokenizer    = require('sentence-tokenizer');
var tokenizer = new Tokenizer('Chuck');

module.exports = function(app, passport) {
    // HOME PAGE
    app.get('/', function(req, res) {
        res.render('index.pug', { title: 'Comment Annotator' });
    });


    // LOGIN ===============================
    // show the login form
    app.get('/login', function(req, res) {
        res.render('login.pug', { message: req.flash('loginMessage') });
    });


    // process the login form
    app.post('/login', passport.authenticate('local-login', {
          // successRedirect : '/profile', // redirect to the secure profile section
          successRedirect : '/home',
          failureRedirect : '/login', // redirect back to the signup page if there is an error
          failureFlash : true
    }));

    // SIGNUP ==============================
    // show the signup form
    app.get('/signup', function(req, res) {
        res.render('signup.pug', { message: req.flash('signupMessage') });
    });


    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        // successRedirect : '/profile',
        successRedirect: '/home',
        failureRedirect : '/signup',
        failureFlash : true
    }));


    // PROFILE SECTION =====================
    // protected section, must be logged in, using route middleware to verify
    app.get('/profile', [isLoggedIn] , function(req, res) {
        Comment.find({}, 'text', (err, docs) => {
            if(err)
                return next(err);
            res.render('profile.pug', {
                user : req.user, // get the user out of session and pass to template
                commentsList : docs
            });
        });
    });

    app.get('/home', [isLoggedIn], function(req,res){
        res.render('home.pug',{
            user: req.user,
        })
    });

    app.get('/amzreviews', [isLoggedIn], function(req,res){
        //randomly select x review(s)
        Amzreviews.aggregate([{$sample: {size: 1}}],function(err,reviews){
            review = reviews[0];
            tokenizer.setEntry(review.reviewText);
            sentences = tokenizer.getSentences();
            res.render('amzreviews.pug',{
                user: req.user,
                reviews: review,
                sentences: sentences
            });
        });
    });

    app.get('/codecomments', [isLoggedIn], function(req,res){
        Comment.find({}, 'text', (err, docs) => {
            if(err)
                return next(err);
            res.render('codecomments.pug',{
                user: req.user,
                commentsList: docs
            });
        });
    });

    // ADMIN SECTION =====================
    // TODO: need to do some error message upon redirect
    app.get('/admin', [isLoggedIn],function(req, res) {
        if(req.user.local.isAdmin){
            res.render('admin.pug', {
                user : req.user
            });
        }
        else{
            res.redirect('/home')
        }
            // res.render('home.pug',{
            //     user: req.user,
            //     error: "denied"
            // });
    });


    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    //submit label
    app.post('/amzreview-submit',function(req,res,next){
        var data = req.body;
        var user_submission = {};
        var user_id = data.user_id;
        var review_id = data.review_id;
        user_submission["user_id"] = user_id;
        user_submission["review_id"] = review_id
        label = {};
        for(var attributename in data){
            if (attributename == "user_id" || attributename == "review_id")
                continue;
            label[attributename] = data[attributename]
        }
        user_submission["sent_labels"] = label
        res.redirect('back')
        console.log(user_submission)
    });
};


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');     // if they aren't redirect them to the home page
}

// route middleware to check if user is admin
function redirectAdmin(req, res, next) {
    if(!req.user.local.isAdmin)
        return next();
    res.redirect('/admin');
}
