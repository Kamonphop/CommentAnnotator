var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var commentSchema = mongoose.Schema({
    src_file : String,
    comments : [{
        text: String,
        category: { type: String, "default": "regular" }
    }]
});

module.exports = mongoose.model('Comment', commentSchema);
