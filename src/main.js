var Stats = require('stats.js');
var requestAnimationFrame = require('raf');

var Stage = require('./Stage.js');
var StageView = require('./view/StageView.js');

var stats = new Stats();
document.body.appendChild(stats.domElement);

var stage = new Stage();
var view = new StageView(stage);

var lastTime = performance.now();

requestAnimationFrame(function () {
    var renderer = arguments.callee;

    stats.begin();

    var time = performance.now(),
        elapsed = Math.min(0.1, time - lastTime); // limit to 100ms jitter

    lastTime = time;

    stage.applyTime(elapsed);
    view.render();

    stats.end();

    requestAnimationFrame(renderer);
});
