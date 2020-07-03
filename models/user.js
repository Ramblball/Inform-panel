const mongoose = require('../packages/mongoose');
const crypto = require('crypto');
const Schema = mongoose.Schema;

const subImage = require('./image');
const subVideo = require('./video');

const userSchema = new Schema({
    status: { type: Boolean, default: false },
    name: {
        first: { type: String },
        last: { type: String },
        patronomic: { type: String }
    },

    hash: { type: String },
    salt: { type: String },

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