const mongoose = require('mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const subImage = require('./image');
const subVideo = require('./video');

const userSchema = new Schema({
    status: { type: Boolean, default: false, required: true },
    login: { type: String, required: true },
    name: {
        first: { type: String, required: true },
        last: { type: String, required: true },
        patronomic: { type: String, required: true }
    },

    hash: { type: String, required: true },
    salt: { type: String, required: true },

    image: [subImage],
    video: [subVideo]
});

userSchema.virtual('fullName').get(function () {
    return `${this.name.first} ${this.name.last} ${this.name.patronomic}`;
});

userSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha256`).toString(`hex`);
}

userSchema.methods.validPassword = function (password) {
    return this.hash === crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha256`).toString(`hex`);
}

module.exports = mongoose.model('User', userSchema, 'User');