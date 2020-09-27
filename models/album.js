const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subFile = require('./file');

const albumSchema = new Schema({
    name: { type: String, maxlength: 64, required: true },
    user: { type: Schema.Types.ObjectId, required: true },

    comment: { type: String, maxlength: 256, default: ' ', required: true },
    hide: { type: Boolean, default: false, required: true },

    created: { type: Number, required: true },
    end: { type: Number, required: true },

    file: [subFile]
}, { versionKey: false });


module.exports = mongoose.model('album', albumSchema, 'album');