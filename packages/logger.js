const bunyan = require('bunyan');
const path = require('path');

const Log = bunyan.createLogger({
  name: "TVserver",
  streams: [
    {
      level: "error",
      path: path.join(__dirname, '..', 'log', 'error.log')
    }
  ]
});

const Cleaner = bunyan.createLogger({
  name: "Cleaner",
  streams: [
    {
      level: "error",
      path: path.join(__dirname, '..', 'log', 'cleaner.log')
    },
    {
      level: "info",
      path: path.join(__dirname, '..', 'log', 'cleaner.log')
    }
  ],
});

module.exports = {
  ErrorLog: Log,
  Cleaner: Cleaner
}