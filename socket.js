/* jshint esversion: 6, node: true */
var { spawn } = require('child_process');

const ws = require('ws');

var videoStream = require('./stream.js');

module.exports = function(server) {
  var wss = new ws.Server({ server, perMessageDeflate: false });

  wss.on('connection', function (socket, req) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    console.log('WS', req.url, ip);

    var stream = videoStream.get();

    function onChunk(chunk) {
      try {
        socket.send(chunk);
      } catch (e) {
        // TODO figure out if other errors are possible too
        // `Error: not opened`
        console.log('socket was closed when trying to write, NBD');
      }
    }

    function addEvents() {
      stream.on('data', onChunk);
    }

    function removeEvents() {
      stream.removeListener('data', onChunk);
    }

    socket.on('error', err => {
      console.log('socket error:', err);
      removeEvents();
    });

    socket.on('close', (code, msg) => {
      console.log('socket closed with:', code, msg);
      removeEvents();
    });

    addEvents();
  });
};
