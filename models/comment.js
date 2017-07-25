var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
mongoose.Promise = global.Promise;
// define the schema for our comment model
var commentSchema = mongoose.Schema({
    text : String,
    category: String,
});

module.exports = mongoose.model('Comment', commentSchema);
