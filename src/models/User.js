const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.pre('save', function(next) {
    const user = this;
    if(!user.isModified('password')) return next();

    bcrypt.genSalt(10, (e, salt) => {
        if (e) return next(e);
        bcrypt.hash(user.password, salt, (e, hash) => {
            if (e) return next(e);
            user.password = hash;
            next();
        })
    })
})

userSchema.methods.comparePassword = function(candidatePassword) {
    const user = this;
    return new Promise((resolve, reject) => {
        bcrypt.compare(candidatePassword, user.password, (e, isMatch) => {
            if (e) return reject(e);
            if (!isMatch) return reject(false);

            resolve(true);
        });
    });
}

mongoose.model('User', userSchema);