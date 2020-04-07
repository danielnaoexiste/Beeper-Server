const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        default: 'New Post'
    },
    content: {
        type: String,
        default: 'Post content'
    },
    lastEdited: {
        type: String,
        default: new Date().toDateString()
    },
    starred: {
        type: Boolean,
        default: false
    }
});

postSchema.statics = {
    delete: function (query, cb) {
        this.findOneAndDelete(query, cb);
    },
    update: function (query, updateData, cb) {
        this.findOneAndUpdate(query,
            { $set: updateData }, { new: true }, cb);
    }
}


mongoose.model('Post', postSchema);