const mongoose = require('mongoose');
const crypto = require('crypto')

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

postSchema.pre('save', function (next) {
    const post = this;
    if (!post.isModified('content')) return next();

    try {
        // Cipher
        const key = process.env.CRYPTO_KEY;
        let cipher = crypto.createCipheriv('des-ede3', key, "");
        let encrypted = cipher.update(post.content, 'utf-8', 'base64');
        encrypted += cipher.final('base64');
        post.content = encrypted;
        console.log(post.content)
        next()
    } catch (e) {
        console.log('Cipher error: ', e)
    }

})

postSchema.methods.decrypt = function () {
    const post = this;
    const encrypted = post.content;
    const key = process.env.CRYPTO_KEY;
    let decipher = crypto.createDecipheriv('des-ede3', key, "")
    // decipher.setAutoPadding(false);
    let decrypted = decipher.update(encrypted, 'base64', 'utf-8')
    decrypted += decipher.final('utf-8')
    post.content = decrypted;
}

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