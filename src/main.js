var Stats = require('stats.js');

var Stage = require('./Stage.js');
var StageView = require('./view/StageView.js');

var stats = new Stats();
document.body.appendChild(stats.domElement);

// stats.begin();

// stats.end();

var stage = new Stage();
var view = new StageView(stage);

