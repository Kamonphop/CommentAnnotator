var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
mongoose.Promise = global.Promise;

//load related model
var Amzreviews = require('../models/amzreview');
var Users = require('../models/user');
var Schema = mongoose.Schema;

// define the schema for our amazon label model
var amzLabelSchema = new Schema({
    user_id : {type: Schema.Types.ObjectId, ref: 'Users'},
    review_id : {type: Schema.Types.ObjectId, ref: 'Amzreviews'},
    asin_id : String,
    sent_labels : {type: Array, "default": []},
    sent_sub_cats: {type: Array, "default": []}
});

module.exports = mongoose.model('Amzlabel', amzLabelSchema);
