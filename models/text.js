const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const textSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true },

    text: { type: String, maxlength: 512, required: false },

    created: { type: Number, required: true },
    end: { type: Number, required: true }
});

textSchema.pre('save', next => {
    this.created = Date.now();
    next();
});

module.exports = mongoose.model('text', textSchema, 'text');