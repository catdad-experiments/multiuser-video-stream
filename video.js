/* jshint esversion: 6, node: true */
const http = require('http');
const socketServer = require('./socket.js');

const port = 8889;

var server = http.createServer(function(req, res) {
    console.log(req.method, req.url);

    if (/homepage/.test(req.url)) {
        res.writeHead(200, { 'content-type': 'text/html' });
        return res.end(`
<!DOCTYPE html>
<html>
<body>
  <div class="jsmpeg full-width" data-url="ws://localhost:${port}/stream" data-autoplay="true"></div>
  <script src="http://jsmpeg.com/jsmpeg.min.js"></script>
</body>
</html>
        `);
    }

    res.writeHead(404);
    res.end();
});

socketServer(server);

server.listen(port);
