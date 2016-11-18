var applescript = require('applescript');


function execute(script, cb) {
  applescript.execString('tell app "Spotify" ' + script, function(err, rtn) {
    if (err) {
      console.error(err);
      return;
    }

    cb();
  });
}
function playTrack(trackId) {
  execute('to play track "spotify:track:'+ trackId + '"', function() { console.log('Playing track ', trackId); });
}

function pause() {
  execute('to pause', function() { console.log('pausing'); });
}

function resume() {
  execute('to resume', function() { console.log('resuming'); });
}

function setPos(pos) {
  execute('\nset player position to ' + pos + '\nend tell', function() { console.log('Setting pos', pos); });
}

var express = require('express');
var app = express();

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
});

app.get('/resume', function (req, res) {
  resume();

  res.status(200, 'OK').send();
});

app.get('/pause', function (req, res) {
  pause();

  res.status(200, 'OK').send();
});

app.get('/play/:trackId', function (req, res) {
  playTrack(req.params.trackId);

  res.status(200, 'OK').send();
});

app.get('/play/:trackId/:pos', function (req, res) {
  console.log(req.params.trackId);
  playTrack(req.params.trackId);
  setPos(req.params.pos);

  res.status(200, 'OK').send();
});

console.log('Listening on 8888');
app.listen(8888);
