
var Box2D = require('box2dweb');
var fs = require('fs');

var b2World = Box2D.Dynamics.b2World;
var b2Vec2 = Box2D.Common.Math.b2Vec2;

var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;

var STEP_DURATION = 1 / 60.0;
var THRESHOLD = 19 * (100 / 20) - 1.5;

var Critter = require('./Critter.js');
var Turret = require('./Turret.js');

var rows = (function () {
    var img = new Image();

    img.src = 'data:image/png;base64,' + btoa(fs.readFileSync(__dirname + '/assets/stage-1.png', 'binary'));

    var canvas = document.createElement('canvas');

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

    return rows;
})();

function Stage(soundscape, priorActionQueueList, isFinal) {
    this.timeAccumulator = 0;
    this.world = new b2World(new b2Vec2(0, 0), true);
    this.soundscape = soundscape;
    this.isComplete = false;
    this.isFinal = isFinal;
    this.rows = rows;

    var listener = {
        BeginContact: function (contact) {
            var a = contact.GetFixtureA().GetBody().GetUserData();
            var b = contact.GetFixtureB().GetBody().GetUserData();

            if (a && b) {
                if (a.iCanHasTurret) {
                    a.addTarget(b);
                } else if (b.iCanHasTurret) {
                    b.addTarget(a);
                }
            }
        },
        EndContact: function (contact) {
            var a = contact.GetFixtureA().GetBody().GetUserData();
            var b = contact.GetFixtureB().GetBody().GetUserData();

            if (a && b) {
                if (a.iCanHasTurret) {
                    a.removeTarget(b);
                } else if (b.iCanHasTurret) {
                    b.removeTarget(a);
                }
            }
        },
        PreSolve: function () {},
        PostSolve: function () {}
    };

    this.world.SetContactListener(listener);

    var walls = [],
        turrets = [];

    rows.forEach(function (columns, rowIdx) {
        var wallStart,
            wallLen;

        function purgeWall() {
            if (wallLen) {
                walls.push([
                    { x: wallStart, y: rowIdx },
                    { x: wallStart, y: rowIdx + 1 },
                    { x: wallStart + wallLen, y: rowIdx + 1 },
                    { x: wallStart + wallLen, y: rowIdx }
                ].map(function (vertex) {
                    return {
                        x: vertex.x * 100 / columns.length,
                        y: (rows.length / 2 - vertex.y) * 100 / columns.length
                    };
                }));

                wallLen = 0;
            }
        }

        columns.forEach(function (tile, colIdx) {
            switch (tile) {
            case 'turret':
                turrets.push({
                    x: (colIdx + 0.5) * 100 / columns.length,
                    y: (rows.length / 2 - (rowIdx + 0.5)) * 100 / columns.length
                });
            case 'wall':
                if (wallLen) {
                    wallLen++;
                } else {
                    wallStart = colIdx;
                    wallLen = 1;
                }
                break;
            default:
                purgeWall();
            }
        });

        purgeWall();
    });

    walls.forEach(function (vertices) {
        var wallFixDef = new b2FixtureDef();
        wallFixDef.shape = new b2PolygonShape();
        wallFixDef.shape.SetAsArray(vertices.map(function (vertex) {
            return new b2Vec2(vertex.x, vertex.y);
        }));

        var wallBodyDef = new b2BodyDef();
        wallBodyDef.type = b2Body.b2_staticBody;
        wallBodyDef.position.x = 0;
        wallBodyDef.position.y = 0;

        var wallBody = this.world.CreateBody(wallBodyDef);
        wallBody.CreateFixture(wallFixDef);
    }, this);

    var anchorDef = new b2BodyDef();
    anchorDef.type = b2Body.b2_staticBody;
    anchorDef.position.x = 0;
    anchorDef.position.y = 0;

    this.anchor = this.world.CreateBody(anchorDef);

    this.turrets = turrets.map(function (turret) {
        return new Turret(this.world, this.soundscape, turret.x, turret.y, 20);
    }, this);

    this.currentTick = 0;

    this.critterList = [];
    this.actionQueueList = [];
    this.nextActionIndexList = [];

    this.priorActionQueueList = priorActionQueueList;

    this.activeCritter = null;
    this.activeActionQueue = null;

    this.launchTimer = 0;
}

Stage.prototype.setTarget = function (x, y) {
    if (this.isComplete) {
        return;
    }

    if (this.activeActionQueue) {
        this.activeActionQueue.push({ tick: this.currentTick, x: x, y: y });
    }
};

Stage.prototype.clearTarget = function () {
};

Stage.prototype.advanceTime = function (secondsElapsed) {
    // launch critters
    if (!this.activeCritter) {
        this.launchTimer -= secondsElapsed;

        if (this.launchTimer <= 0) {
            this.launchTimer += 0.5;

            var critterCount = this.critterList.length;

            if (critterCount < this.priorActionQueueList.length) {
                this.critterList.push(new Critter(this.world, this.soundscape, this.anchor, 0, 0));
                this.actionQueueList.push(this.priorActionQueueList[critterCount]);
                this.nextActionIndexList.push(0);
            } else {
                this.activeCritter = new Critter(this.world, this.soundscape, this.anchor, 0, 0, this.isFinal);
                this.activeActionQueue = [];

                this.critterList.push(this.activeCritter);
                this.actionQueueList.push(this.activeActionQueue);
                this.nextActionIndexList.push(0);
            }
        }
    }

    // turret AI
    this.turrets.forEach(function (turret) {
        turret.advanceTime(secondsElapsed);
    });

    // update physics
    this.timeAccumulator += secondsElapsed;

    while (this.timeAccumulator > 0) {
        this.timeAccumulator -= STEP_DURATION;

        this.critterList.forEach(function (critter, i) {
            if (this.nextActionIndexList[i] < this.actionQueueList[i].length) {
                var action = this.actionQueueList[i][this.nextActionIndexList[i]];
                if (action.tick <= this.currentTick) {
                    this.critterList[i].setTarget(action.x, action.y);
                    this.nextActionIndexList[i] += 1;
                }
            }

            this.critterList[i].setupPhysicsStep();
        }, this);

        this.world.Step(STEP_DURATION, 10, 10);
        this.world.ClearForces();

        this.currentTick += 1;

        // check end condition
        if (!this.isComplete && this.activeCritter) {
            var tpos = this.activeCritter.body.GetPosition();
            if (tpos.x > THRESHOLD || this.activeCritter.health === 0) {
                this.isComplete = true;
                return;
            }
        }
    }
};

module.exports = Stage;
