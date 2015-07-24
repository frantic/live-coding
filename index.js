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

var fileName = __filename;

function getSnapshot() {
  return {
    content: fs.readFileSync(fileName, 'utf8'),
    modifiedAt: fs.statSync(fileName).mtime.getTime(),
  };
}

var history = [getSnapshot()];

io.on('connection', function (socket) {
  socket.emit('init', history);
});

fs.watch(__filename, function() {
  var last = history[history.length - 1];
  var current = getSnapshot();
  if (current.content !== last.content) {
    io.emit('change', current);
    history.push(current);
  }
})

console.log('Listening http://localhost:3000/');
server.listen(3000);
