const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const ObjectId = require('mongodb').ObjectID;

// for data tokenizer
const Tokenizer = require('sentence-tokenizer');
var tokenizer = new Tokenizer('Chuck');

// loading data models
const User = require('../models/user');
const Amzreviews = require('../models/amzreview');
const Amzlabels = require('../models/amzlabel');
const Comment = require('../models/comment');
const Annotation = require('../models/annotation');


module.exports = function(app, passport) {
    // HOME PAGE
    app.get('/', function(req, res) {
        res.render('index.pug', { title: 'Comment Annotator' });
    });

    // add source code, extract comments and store in Comment collection
    app.get('/admin/add_comments', [isLoggedIn, redirectifnotAdmin],
        function (req, res) {
            res.render('addcomments.pug', {
                title: 'Code-Comments Population',
                user : req.user
            });
    });


    app.post('/admin/add_comments', function (req, res) {
        var form = new formidable.IncomingForm();
        const uploadDir = path.join(__dirname, '/..', '/dummy_data_comments/');
        form.multiples = true;
        form.keepExtensions = true;
        form.uploadDir = uploadDir;
        form.parse(req, function (err, fields, files) {
            if (err) return res.status(500).json({ error: err })
        });

        form.on('fileBegin', function (name, file) {
            const [fileName, fileExt] = file.name.split('.');
            file.path = path.join(uploadDir, `${fileName}_${new Date().getTime()}.${fileExt}`)
        });

        form.on('file', function (name, file) {
            fs.readFile(file.path, 'utf-8', function (err, srcText) {
                if(err) res.send(err);

                // to find all comments in current source
                var re = /(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/gm;
                var arrComments = srcText.match(re);
                // TODO: to find the line numbers of the comments
                // TODO: highlight lines

                var newSource = new Comment();
                newSource.src_file = file.path;
                for (var i=0; i<arrComments.length; ++i) {
                    newSource.comments.push({ text: arrComments[i] });
                }
                newSource.save( function () {
                    if(err)
                        res.send(err);
                    else {
                        console.log("Data saved");
                        req.flash('success','Saved new source file to the database!')
                        res.redirect('back')
                    }
                })
            })
        })
    });


    // code comments annotation index page
    app.get('/codecomments', isLoggedIn, function (req, res) {
        Comment.find({}, function (err, docs) {
            if(err) return next(err);
            res.render('codecomments.pug', {
                user        : req.user,
                sourceData  : docs
            })
        })
    })


    // how to submit the annotation once marked by user
    app.post('/addAnnotation', function (req, res) {
        var userActivity = JSON.parse(req.body.activityData);
        var user_id = userActivity.user_id;
        var user_comments = userActivity.comments;
        var updatedAct = [];
        for (var item in user_comments) {
                for (var doc in user_comments[item]) {
                    if (doc=='_src' || doc=='_comment')
                        user_comments[item][doc] = ObjectId(user_comments[item][doc]);
                }
        }

        // inserts record with the user-id or updates existing document
        Annotation.findByIdAndUpdate(user_id, { $set: { annotated: user_comments } }, {
            new: true,
            upsert: true
        }, function (err, anno) {
            if (err) return res.send(err);
            res.send(anno);
        });
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
    app.get('/profile', isLoggedIn , function(req, res) {
        res.render('profile.pug', {
            user : req.user
        });
    });

    app.get('/home', isLoggedIn, function(req,res){
        res.render('home.pug',{
            user: req.user,
            errorMessage: req.flash('error')
        })
    });

    //TODO: assign user to certain review, now is random
    //TODO: might need to also check if users has already done this review, randomly select another review
    app.get('/amzreviews', isLoggedIn, function(req,res){
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


    // ADMIN SECTION =====================
    app.get('/admin', [isLoggedIn,redirectifnotAdmin], function(req, res) {
        req.flash('success','Test flash message.');
        res.render('admin.pug', {
            user : req.user,
            successMessage: req.flash('success')
        });
    });

    //submit label
    //TODO: add sub category when saved and also emotion
    app.post('/amzreview-submit',function(req,res,next){
        var data = req.body;
        // Below is for debugging
        // var data = { user_id: '597078f55d06cd4c7488b48d',
        //           review_id: '5975aa1b3f3ccf5a0bb15904',
        //           sent_1: '1',
        //           sent_1_cat_1: '1',
        //           sent_2: '1',
        //           sent_2_cat_1: '1',
        //           sent_3: '0',
        //           sent_3_cat_0: '1',
        //           sent_4: '1',
        //           sent_4_cat_1: '1',
        //           sent_5: '1',
        //           sent_5_cat_1: '1',
        //           sent_6: '1',
        //           sent_6_cat_1: [ '1', '2' ],
        //           sent_7: [ '1', '2' ],
        //           sent_7_cat_1: '1',
        //           sent_7_cat_2: '1',
        //           sent_8: '2',
        //           sent_8_cat_2: [ '1', '2' ],
        //           sent_9: '2',
        //           sent_9_cat_2: '1' }
        var sent_cat = [];
        var sent_sub_cat = [];
        for(var attributename in data){
            if (attributename == "user_id" || attributename == "review_id")
                continue;
            if (~attributename.indexOf('cat')){
                var label_cat = {};
                label_cat[attributename] = data[attributename]
                sent_sub_cat.push(label_cat);
            }
            else
            {
                var label = {};
                label[attributename] = data[attributename]
                sent_cat.push(label);
            }
        }
        //save to the db
        var newlabel = new Amzlabels({});
        newlabel.user_id = data.user_id;
        newlabel.review_id = data.review_id;
        newlabel.sent_labels = sent_cat;
        newlabel.sent_sub_cats = sent_sub_cat;
        newlabel.save(function(err){
            if(err)
                res.send(err);
            else{
                console.log("Data saved");
                req.flash('success','Saved to the database successfully')
                res.redirect('back');
            }
        });
    });

    app.get('/admin/allreviews', [isLoggedIn,redirectifnotAdmin], function(req,res){
        Amzreviews.find({}, function(error,reviews){
            var total_num = reviews.length;
            Amzlabels.find({}, 'user_id review_id', function(err,labeledreviews){
                var distinct_labeled_review_id = getDistinctLabel(labeledreviews);
                res.render('allreviews.pug',{
                    user : req.user,
                    total_num : total_num,
                    labeled_reviews: distinct_labeled_review_id
                });
            });
        });
    });

    //TODO: make sure that user can only submit 1 time per review.
    //now: Assume that no user submit the same review twice for now.
    app.get('/admin/allreviews/:review_id', [isLoggedIn,redirectifnotAdmin], function(req,res){
        var object_review_id = ObjectId(req.params.review_id);
        Amzreviews.find({_id: object_review_id}, function(error,review){
            // Amzlabels.find({review_id: object_review_id}).distinct('user_id', function(err,ids){
                // Amzlabels.find({review_id: object_review_id, user_id:{$in : ids}},function(err,result) {
            Amzlabels.find({review_id: object_review_id},function(err,result) {
                console.log(result);
                rev = review[0];
                tokenizer.setEntry(rev.reviewText);
                sentences = tokenizer.getSentences();
                getStatisticsOfReview(sentences,result);
                res.render('review.pug',{
                    user : req.user,
                    review: rev,
                    sentences: sentences,
                    labeled_review_data: result
                });
                // });
            });
        });
    });

    app.get('/admin/allusers', [isLoggedIn,redirectifnotAdmin], function(req,res){
        User.find({}, function(error,users){
            res.render('allusers.pug', {
                user : req.user,
                users : users
            });
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

function getDistinctLabel(arrayitem){
    var unique = {};
    var labeled_r_id = {};
    var distinct = [];
    for(var item in arrayitem){
        review_id = JSON.stringify(arrayitem[item].review_id);
        user_id = JSON.stringify(arrayitem[item].user_id);
        if( typeof(unique[review_id]) == "undefined"){
            // distinct.push(arrayitem[item].review_id);
            list_user = [];
            list_user.push(user_id);
            labeled_r_id[review_id] = list_user;
            unique[review_id] = 0;
        }else{
            if(!labeled_r_id[review_id].includes(user_id)){
                labeled_r_id[review_id].push(user_id);
            }
        }
    }
    for(var item in labeled_r_id){
        var each_review = {};
        each_review["review_id"] = item;
        each_review["num_users"] = labeled_r_id[item].length;
        distinct.push(each_review);
    }
    return distinct;
}

//Caution: this is such a hack, but might just work fine
function getStatisticsOfReview(sentences,labeled_review){
    rearray = [];
    for(var i = 0; i<sentences.length;i++){
        sentence = {};
        sentence["sentenceText"] = sentences[i];
        sentence["label"] = {"0":NaN, "1":NaN, "2":NaN};
        sentence["cat0"] = {"0":NaN, "1":NaN, "2":NaN};
        sentence["cat1"] = {"0":NaN, "1":NaN, "2":NaN};
        sentence["cat2"] = {"0":NaN, "1":NaN, "2":NaN};
        rearray.push(sentence);
    }
    console.log(rearray);
    for(var i = 0; i<labeled_review.length;i++){
        sent_labels = labeled_review[i].sent_labels;
        for(var j = 0; j<sent_labels; j++){

        }
        console.log(sent_labels);
    }
}
