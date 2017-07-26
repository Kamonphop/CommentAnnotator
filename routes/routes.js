var Comment = require('../models/comment');
var Amzreviews = require('../models/amzreview');
var Amzlabels = require('../models/amzlabel');

/*for data tokenizer*/
var Tokenizer = require('sentence-tokenizer');
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

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


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
            errorMessage: req.flash('error')
        })
    });

    //TODO: assign user to certain review, now is random
    //TODO: might need to also check if users has already done this review, randomly select another review
    app.get('/amzreviews', [isLoggedIn], function(req,res){
        //randomly select x review(s)
        Amzreviews.aggregate([{$sample: {size: 1}}],function(err,reviews){
            Amzlabels.find({user_id: req.user._id}).distinct('review_id', function(err,data){
                if(err)
                    return next(err);
                done_num = data.length;
                review = reviews[0];
                tokenizer.setEntry(review.reviewText);
                sentences = tokenizer.getSentences();
                res.render('amzreviews.pug',{
                    user: req.user,
                    reviews: review,
                    sentences: sentences,
                    done_many: done_num,
                    errorMessage: req.flash('error'),
                    successMessage: req.flash('success')
                });
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
    app.get('/admin', [isLoggedIn,redirectifnotAdmin],function(req, res) {
        req.flash('success','Test flash message.');
        res.render('admin.pug', {
            user : req.user,
            successMessage: req.flash('success')
        });
    });

    //submit label
    //TODO: adding a flash message upon successfully added
    app.post('/amzreview-submit',function(req,res,next){
        var data = req.body;
        var all_label = [];
        for(var attributename in data){
            if (attributename == "user_id" || attributename == "review_id")
                continue;
            var label = {};
            label[attributename] = data[attributename]
            all_label.push(label);
        }
        //save to the db
        var newlabel = new Amzlabels({});
        newlabel.user_id = data.user_id;
        newlabel.review_id = data.review_id;
        newlabel.sent_labels = all_label;
        newlabel.save(function(err){
            if(err)
                res.send(err);
            else{
                console.log("save");
                req.flash('success','Saved to the database successfully')
                res.redirect('back');
            }
        });
    });
};


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    else{
        console.log("not logged in");
        res.redirect('/');// if they aren't redirect them to the home page
    }
}

function redirectifnotAdmin(req, res, next) {
    if(req.user.local.isAdmin){
        console.log("admin is here! granted access");
        return next();
    }
    else{
        console.log("not an admin, go back!");
        req.flash('error','You are not authorized!');
        res.redirect('/home');
    }
}

