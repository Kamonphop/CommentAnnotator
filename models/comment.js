var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our comment model
var commentSchema = mongoose.Schema({
    text : String,
    category: String,
});

module.exports = mongoose.model('Comment', commentSchema);
