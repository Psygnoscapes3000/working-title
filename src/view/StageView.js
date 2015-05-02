
var Box2D = require('box2dweb');

var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

var M_TO_PX = 6.4;

function StageView(stage) {
    this.stage = stage;

    var debugDrawCanvas = document.createElement('canvas');
    debugDrawCanvas.width = 640;
    debugDrawCanvas.height = 480;
    debugDrawCanvas.style.position = 'absolute';
    debugDrawCanvas.style.left = 0;
    debugDrawCanvas.style.top = 0;
    debugDrawCanvas.style.background = '#e0e0e0';
    document.body.appendChild(debugDrawCanvas);

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
        isMouseDown = true;
        this.stage.setTarget(e.pageX / M_TO_PX, (e.pageY - debugDrawCanvas.height / 2) / M_TO_PX);
    }.bind(this);

    document.onmouseup = function (e) {
        if (isMouseDown) {
            isMouseDown = false;
            this.stage.clearTarget();
        }
    }.bind(this);
}

StageView.prototype.render = function () {
    this.debugDrawCanvasContext.clearRect(0, -240, 640, 240);
    this.stage.world.DrawDebugData();
};

module.exports = StageView;
