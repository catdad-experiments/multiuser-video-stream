/* jshint esversion: 6, node: true */
var { spawn } = require('child_process');
var through = require('through2');

var binaryBits = `ffmpeg -f dshow`;
var input = `-i video="Logitech HD Pro Webcam C920":audio="Microphone (HD Pro Webcam C920)"`;
var codecs = `-vcodec libx264 -acodec libmp3lame`;
//var codecs = `-vcodec libvpx -acodec libvorbis`;

var opts1 = `-preset ultrafast -tune zerolatency -b 900k -f mpegts`;
var mpegts = `-preset ultrafast -tune zerolatency -r 10 -async 1 -ab 24k -ar 22050 -bsf:v h264_mp4toannexb -maxrate 750k -bufsize 3000k -f mpegts`;
var hls = `-preset ultrafast -tune zerolatency -r 10 -crf 10 -b:v 1M -bufsize 3000k -f hls`;

// note: add to the end of opts to flip a video
var flip = `-vf hflip`;

var command = `${binaryBits} ${input} ${codecs} ${hls} -`;

var executable = command.split(' ')[0];
var tokens = command.match(/\S+|"[^"]+"/g).slice(1);

var taskOptions = {
  stdio: 'pipe',
  windowsVerbatimArguments: true
};

var stream;
var counter = 0;

function flush(stream) {
  // If nothing is reading this stream, add a listener
  // so that it is always flowing. This is a live video
  // stream, so you only get the data once you start
  // listening. Other data is safe to discard.
  if (stream._readableState.flowing === null) {
    stream.on('data', () => {});
  }
}

// TODO add ability to actually close the video
function closeVideo() {
  // we tell ffmpeg to stop by writing 'q'
//  task.stdin.write('q');
}

function newTask(stream) {
  var task = spawn(executable, tokens, taskOptions);

  task.stdout.pipe(stream);
  flush(stream);

  task.on('exit', (...args) => {
    console.log('EXITED WITH:', ...args);
    task = null;

    // we exited... restart this task
    newTask(stream);
  });

  task.on('error', (err) => {
    console.error('FFPMEG err:', err);
    task = null;

    // we errored, restart this task
    newTask(stream);
  });
}

function get() {
  // if we already created a stream,
  // just return that stream
  if (stream) {
    return stream;
  }

  stream = through();

  newTask(stream);

  return stream;
}

module.exports = { get };
