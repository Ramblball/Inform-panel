const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
    name: { type: String, maxlength: 64, required: true },
    type: { type: Boolean, required: true },

    hide: { type: Boolean, required: true, default: false },
    comment: { type: String, maxlength: 256, default: ' ', requried: false },
    position: { type: Number, required: true },

    created: { type: Number, required: true }
});

module.exports = fileSchema;