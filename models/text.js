const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const textSchema = new Schema({
    user: { type: Schema.Types.ObjectId, required: true },

    text: { type: String, maxlength: 512, required: false },

    time: {
        start: { type: Number, required: true },
        end: { type: Number, required: true }
    }
});

module.exports = mongoose.model('text', textSchema, 'text');