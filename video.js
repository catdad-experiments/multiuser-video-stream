/* jshint esversion: 6, node: true */
var binaryBits = `ffmpeg -f dshow`;
var input = `-i video="Logitech HD Pro Webcam C920":audio="Microphone (HD Pro Webcam C920)"`;
var codecs = `-vcodec libx264 -acodec libmp3lame`;

var opts1 = `-preset ultrafast -tune zerolatency -b 900k -f mpegts`;
var opts2 = `-preset ultrafast -tune zerolatency -r 10 -async 1 -ab 24k -ar 22050 -bsf:v h264_mp4toannexb -maxrate 750k -bufsize 3000k -f mpegts`;

// note: add to the end of opts to flip a video
var flip = `-vf hflip`;

var command = `${binaryBits} ${input} ${codecs} ${opts2} -`;

var fs = require('fs');
var { spawn } = require('child_process');

var taskOptions = {
  stdio: 'pipe',
  windowsVerbatimArguments: true
};

var executable = command.split(' ')[0];
var tokens = command.match(/\S+|"[^"]+"/g).slice(1);

console.log(executable, tokens);

var task = spawn(executable, tokens, taskOptions);

//task.stdout.pipe(fs.createWriteStream(`file-${Date.now()}.mp4`));
task.stderr.pipe(process.stdout);
task.stdout.on('data', () => {});

task.on('exit', (...args) => {
  console.log('EXITED WITH:', ...args);
});

task.on('error', (err) => {
  console.error(err);
});

setTimeout(() => {
  console.log('CLOSING THE STREAM... I THINK');

  // we tell ffmpeg to stop by writing 'q'
  task.stdin.write('q');
}, 5000);
