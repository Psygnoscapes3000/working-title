
var Box2D = require('box2dweb');
var fs = require('fs');

var CANVAS_WIDTH = 640;
var CANVAS_HEIGHT = 480;

function SplashView(splash) {
    this.splash = splash;

    var canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.style.position = 'absolute';
    canvas.style.left = 0;
    canvas.style.top = 0;
    document.body.appendChild(canvas);

    this.canvas = canvas;

    var ctx = canvas.getContext('2d');
    ctx.translate(0, canvas.height / 2);
    ctx.scale(1, -1);

    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;

    this.ctx = ctx;

    canvas.onmousedown = function (e) {
        e.preventDefault();

        this.splash.startGame();

        return false;
    }.bind(this);
}

SplashView.prototype.render = function () {
};

SplashView.prototype.dispose = function () {
    this.canvas.parentNode.removeChild(this.canvas);
};

module.exports = SplashView;
