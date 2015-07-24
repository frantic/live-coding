var fs = require('fs');
var path = require('path');
var server = require('http').createServer(handleRequest);
var io = require('socket.io')(server);

function handleRequest(req, res) {
  fs.readFile(path.join(__dirname, 'index.html'), function(err, page) {
    if (err) {
      throw err;
    }

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(page);
  });
}

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

console.log('Listening http://localhost:3000/');
server.listen(3000);
