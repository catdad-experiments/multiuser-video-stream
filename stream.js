/* jshint esversion: 6, node: true */
var { spawn } = require('child_process');
var through = require('through2');

var binaryBits = `ffmpeg -f dshow`;
var input = `-i video="Logitech HD Pro Webcam C920":audio="Microphone (HD Pro Webcam C920)"`;
var codecs = `-vcodec libx264 -acodec libmp3lame`;

var opts1 = `-preset ultrafast -tune zerolatency -b 900k -f mpegts`;
var opts2 = `-preset ultrafast -tune zerolatency -r 10 -async 1 -ab 24k -ar 22050 -bsf:v h264_mp4toannexb -maxrate 750k -bufsize 3000k -f mpegts`;

// note: add to the end of opts to flip a video
var flip = `-vf hflip`;

var command = `${binaryBits} ${input} ${codecs} ${opts2} -`;

var executable = command.split(' ')[0];
var tokens = command.match(/\S+|"[^"]+"/g).slice(1);

var taskOptions = {
  stdio: 'pipe',
  windowsVerbatimArguments: true
};

var task;
var stream = through();
var counter = 0;

function closeVideo() {
  // we tell ffmpeg to stop by writing 'q'
  task.stdin.write('q');
}

function get() {

  var task = spawn(executable, tokens, taskOptions);

  // always flush the data, this is a live video stream,
  // so you only get the live data... there is no buffer
  task.stdout.pipe(stream);
  // TODO this should happen only once, not once on each get
  stream.on('data', () => {
    console.log('read chunk');
  });

  task.on('exit', (...args) => {
    console.log('EXITED WITH:', ...args);
  });

  task.on('error', (err) => {
    console.error('FFPMEG err:', err);
  });

  return stream;
}

module.exports = { get };
