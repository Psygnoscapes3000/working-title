var Stats = require('stats.js');
var requestAnimationFrame = require('raf');

var Soundscape = require('./Soundscape.js');
var Session = require('./Session.js');

var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.zIndex = 2;
document.body.appendChild(stats.domElement);

var soundscape = new Soundscape();

var session = new Session(soundscape);

var lastTime = performance.now();

requestAnimationFrame(function () {
    var renderer = arguments.callee;

    stats.begin();

    var time = performance.now(),
        elapsedSeconds = Math.min(100, time - lastTime) / 1000; // limit to 100ms jitter

    lastTime = time;

    session.advanceTime(elapsedSeconds);
    session.currentRound.view.render();

    stats.end();

    requestAnimationFrame(renderer);
});
