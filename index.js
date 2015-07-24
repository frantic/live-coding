var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var fileName = process.argv[2];
if (!fileName) {
  console.error('Usage ' + __filename + ' <file-to-watch>');
  process.exit(1);
}

function getSnapshot() {
  return {
    content: fs.readFileSync(fileName, 'utf8'),
    modifiedAt: fs.statSync(fileName).mtime.getTime(),
  };
}

var snapshots = [getSnapshot()];

io.on('connection', function (socket) {
  socket.emit('init', snapshots);
});

fs.watch(fileName, function() {
  var last = snapshots[snapshots.length - 1];
  var current = getSnapshot();
  if (current.content !== last.content) {
    io.emit('change', current);
    snapshots.push(current);
  }
})

console.log('Serving ' + fileName + ' on http://localhost:3000/');

// var ngrok = require('ngrok');
// ngrok.connect(3000, function (err, url) {
//   console.log('Public URL:', url);
// });

app.use(express.static(path.join(__dirname, 'public')));
server.listen(3000);
