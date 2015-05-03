var Stats = require('stats.js');
var requestAnimationFrame = require('raf');

var Stage = require('./Stage.js');
var StageView = require('./view/StageView.js');

var Soundscape = require('./Soundscape.js');

var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.zIndex = 2;
document.body.appendChild(stats.domElement);

var stage, view;
var recordedActionQueueList = [];

var soundscape = new Soundscape();

var fs = require('fs');

var canvas = document.createElement('canvas');
var img = new Image();

img.src = 'data:;base64,' + btoa(fs.readFileSync(__dirname + '/assets/stage-1.png', 'binary'));

canvas.width = img.width;
canvas.height = img.height;

var ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0);

var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

var rows = [],
    columns = [],
    rgb = 0;

var hexToTile = {
    '000000': 'earth',
    '882200': 'wall',
    '00ff00': 'safezone',
    'ff0000': 'turret'
};

Array.prototype.forEach.call(imgData.data, function (component, idx) {
    if ((idx & 3) === 3) {
        var hex = ('00000' + rgb.toString(16)).substr(-6);
        columns.push(hexToTile[hex]);
        rgb = 0;

        if (columns.length === canvas.width) {
            rows.push(columns);
            columns = [];
        }
    } else {
        rgb = (rgb << 8) | component;
    }
});

function restartStage() {
    if (view) {
        view.dispose();
    }

    stage = new Stage(soundscape, recordedActionQueueList, function (recordedActionList) {
        recordedActionQueueList.push(recordedActionList);
        restartStage();
    }, rows);

    view = new StageView(stage);
}

restartStage();

var lastTime = performance.now();

requestAnimationFrame(function () {
    var renderer = arguments.callee;

    stats.begin();

    var time = performance.now(),
        elapsedSeconds = Math.min(100, time - lastTime) / 1000; // limit to 100ms jitter

    lastTime = time;

    stage.advanceTime(elapsedSeconds);
    view.render();

    stats.end();

    requestAnimationFrame(renderer);
});
