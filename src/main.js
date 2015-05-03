var Stats = require('stats.js');
var requestAnimationFrame = require('raf');

var Stage = require('./Stage.js');
var StageView = require('./view/StageView.js');

var Soundscape = require('./Soundscape.js');

var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.zIndex = 2;
document.body.appendChild(stats.domElement);

var soundscape = new Soundscape();

function PreMode(recordedActionQueueList) {
    var stageCountdown = 1;

    var stage = new Stage(soundscape, recordedActionQueueList);
    var view = new StageView(stage);

    this.advanceTime = function (elapsedSeconds) {
        stageCountdown -= elapsedSeconds;

        if (stageCountdown <= 0) {
            mode = new RunningMode(stage, view);
        }
    };

    this.view = view;
}

function RunningMode(stage, view) {
    this.advanceTime = function (elapsedSeconds) {
        stage.advanceTime(elapsedSeconds);

        if (stage.isComplete) {
            mode = new PostMode(stage, view);
        }
    };

    this.view = view;
}

function PostMode(stage, view, recordedActionQueueList) {
    var stageCountdown = 1;

    this.advanceTime = function (elapsedSeconds) {
        stageCountdown -= elapsedSeconds;

        if (stageCountdown <= 0) {
            view.dispose();
            mode = new PreMode(stage.actionQueueList);
        }
    };

    this.view = view;
}

var mode = new PreMode([]);

var lastTime = performance.now();

requestAnimationFrame(function () {
    var renderer = arguments.callee;

    stats.begin();

    var time = performance.now(),
        elapsedSeconds = Math.min(100, time - lastTime) / 1000; // limit to 100ms jitter

    lastTime = time;

    mode.advanceTime(elapsedSeconds);
    mode.view.render();

    stats.end();

    requestAnimationFrame(renderer);
});
