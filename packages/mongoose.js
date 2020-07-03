const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json')));

mongoose.connect(config.mongoose);

module.exports = mongoose;