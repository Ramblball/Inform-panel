const cron = require('cron').CronJob;
const config = require('config');
const _ = require('lodash');

const Album = require('./models/album');
const Text = require('./models/text');

const cleanerTask = new cron(config.get('interval'), () => {
    let time = Date.now() + 18000001;

    Album.find({ end: { $lte: time } }, (err, albums) => {
        _.forEach(albums, album => {
            album.hide = true;
            album.save();
        });
    });

    Text.find({ end: { $lte: time } }, (err, texts) => {
        _.forEach(texts, text => {
            text.hide = true;
            text.save();
        });
    });
});

module.exports = cleanerTask;