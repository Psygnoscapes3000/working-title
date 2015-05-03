
var Box2D = require('box2dweb');

var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

var TILE_WIDTH = 32;
var TILE_HEIGHT = 32;

var TILE_COLUMNS = 20;
var TILE_ROWS = 16;

var CANVAS_WIDTH = TILE_COLUMNS * TILE_WIDTH;
var CANVAS_HEIGHT = TILE_ROWS * TILE_HEIGHT;

var M_TO_PX = CANVAS_WIDTH / 100;

function StageView(stage) {
    this.stage = stage;

    var debugDrawCanvas = document.createElement('canvas');
    debugDrawCanvas.width = CANVAS_WIDTH;
    debugDrawCanvas.height = CANVAS_HEIGHT;
    debugDrawCanvas.style.position = 'absolute';
    debugDrawCanvas.style.left = 0;
    debugDrawCanvas.style.top = 0;
    debugDrawCanvas.style.background = '#e0e0e0';
    document.body.appendChild(debugDrawCanvas);

    this.canvas = debugDrawCanvas;

    var debugDrawCanvasContext = debugDrawCanvas.getContext("2d");
    debugDrawCanvasContext.translate(0, debugDrawCanvas.height / 2);
    debugDrawCanvasContext.scale(1, -1);

    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(debugDrawCanvasContext);
    debugDraw.SetDrawScale(M_TO_PX);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_centerOfMassBit);
    this.stage.world.SetDebugDraw(debugDraw);

    this.debugDrawCanvasContext = debugDrawCanvasContext;

    var isMouseDown = false;

    debugDrawCanvas.onmousedown = function (e) {
        e.preventDefault();

        isMouseDown = true;
        this.stage.setTarget(e.pageX / M_TO_PX, (debugDrawCanvas.height / 2 - e.pageY) / M_TO_PX);

        return false;
    }.bind(this);

    debugDrawCanvas.onmousemove = function (e) {
        e.preventDefault();

        if (isMouseDown) {
            this.stage.setTarget(e.pageX / M_TO_PX, (debugDrawCanvas.height / 2 - e.pageY) / M_TO_PX);
        }

        return false;
    }.bind(this);

    document.onmouseup = function (e) {
        if (isMouseDown) {
            isMouseDown = false;
            this.stage.clearTarget();
        }
    }.bind(this);
}

StageView.prototype.render = function () {
    this.debugDrawCanvasContext.clearRect(0, -CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT / 2);
    this.stage.world.DrawDebugData();
};

StageView.prototype.dispose = function () {
    this.canvas.parentNode.removeChild(this.canvas);
    document.onmouseup = null;
};

module.exports = StageView;
