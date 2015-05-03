
var Box2D = require('box2dweb');
var fs = require('fs');

var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

var TILE_WIDTH = 32;
var TILE_HEIGHT = 32;

var TILE_COLUMNS = 20;
var TILE_ROWS = 16;

var CANVAS_WIDTH = TILE_COLUMNS * TILE_WIDTH;
var CANVAS_HEIGHT = TILE_ROWS * TILE_HEIGHT;

var M_TO_PX = CANVAS_WIDTH / 100;

var tilesImg = new Image();

tilesImg.src = 'data:image/png;base64,' + btoa(fs.readFileSync(__dirname + '/../assets/tiles.png', 'binary'));

var tilesCanvas = document.createElement('canvas');
tilesCanvas.width = tilesImg.width;
tilesCanvas.height = tilesImg.height;
var tilesCtx = tilesCanvas.getContext('2d');
tilesCtx.scale(1, -1);
tilesCtx.drawImage(tilesImg, 0, 0, tilesImg.width, tilesImg.height, 0, -tilesImg.height, tilesImg.width, tilesImg.height);

function StageView(stage) {
    this.stage = stage;

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

    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(ctx);
    debugDraw.SetDrawScale(M_TO_PX);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_centerOfMassBit);
    this.stage.world.SetDebugDraw(debugDraw);

    this.ctx = ctx;

    var isMouseDown = false;

    canvas.onmousedown = function (e) {
        e.preventDefault();

        isMouseDown = true;
        this.stage.setTarget(e.pageX / M_TO_PX, (canvas.height / 2 - e.pageY) / M_TO_PX);

        return false;
    }.bind(this);

    canvas.onmousemove = function (e) {
        e.preventDefault();

        if (isMouseDown) {
            this.stage.setTarget(e.pageX / M_TO_PX, (canvas.height / 2 - e.pageY) / M_TO_PX);
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
    //this.ctx.clearRect(0, -CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT / 2);

    var tileToHex = {
        'earth': '#000000',
        'wall': '#882200',
        'safezone': '#00ff00',
        'turret': '#ff0000'
    };

    this.stage.rows.forEach(function (columns, rowIdx) {
        columns.forEach(function (tile, colIdx) {
            this.ctx.fillStyle = tileToHex[tile];

            if (tile === 'earth') {
                this.ctx.drawImage(tilesCanvas, (5 + ((rowIdx ^ colIdx) % 12)) * 16, (12 - 1 - 7) * 16, 16, 16, colIdx * TILE_WIDTH, (this.stage.rows.length / 2 - rowIdx - 1) * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
            } else {
                this.ctx.fillRect(colIdx * TILE_WIDTH, (this.stage.rows.length / 2 - rowIdx - 1) * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
            }
        }, this);
    }, this);

    this.stage.turrets.forEach(function (turret) {
        var turretX = turret.x * M_TO_PX,
            turretY = turret.y * M_TO_PX;

        this.ctx.beginPath();
        this.ctx.arc(turretX, turretY, 10, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = '#888888';
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(turretX, turretY);
        this.ctx.lineTo(turretX + Math.cos(turret.angle) * 20, turretY + Math.sin(turret.angle) * 20);
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = '#aaaaaa';
        this.ctx.stroke();
    }, this);

    var rangeSegments = 60;
    var rangeRotation = (Date.now() % 1000) / 1000 * (Math.PI * 2 / rangeSegments);

    this.stage.turrets.forEach(function (turret) {
        for (var i = 0; i < rangeSegments; i++) {
            this.ctx.beginPath();
            this.ctx.arc(turret.x * M_TO_PX, turret.y * M_TO_PX, turret.range * M_TO_PX, i * 2 * Math.PI / rangeSegments + rangeRotation, (i + 0.5) * 2 * Math.PI / rangeSegments + rangeRotation, false);
            this.ctx.strokeStyle = '#888888';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }, this);

    this.stage.critterList.forEach(function (critter) {
        var pos = critter.body.GetPosition();

        this.ctx.beginPath();
        this.ctx.arc(pos.x * M_TO_PX, pos.y * M_TO_PX, 10, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = critter.health ? '#ffffff' : '#666';
        this.ctx.fill();
    }, this);

    // this.stage.world.DrawDebugData();
};

StageView.prototype.dispose = function () {
    this.canvas.parentNode.removeChild(this.canvas);
    document.onmouseup = null;
};

module.exports = StageView;
