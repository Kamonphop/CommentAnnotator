var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
mongoose.Promise = global.Promise;
// define the schema for our Amazon review model
var amzReviewSchema = mongoose.Schema({
    asin : String,
    ratings : String,
    helpfulness : String,        
    date : String,
    summary : String,
    reviewText : String,
});

module.exports = mongoose.model('Amzreview', amzReviewSchema);
