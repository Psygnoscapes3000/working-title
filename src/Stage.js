
var Box2D = require('box2dweb');

var b2World = Box2D.Dynamics.b2World;
var b2Vec2 = Box2D.Common.Math.b2Vec2;

var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;

var STEP_DURATION = 1 / 60.0;

var Critter = require('./Critter.js');
var Turret = require('./Turret.js');

function Stage(soundscape, priorActionQueueList, onEnd) {
    this.timeAccumulator = 0;
    this.world = new b2World(new b2Vec2(0, 0), true);
    this.soundscape = soundscape;
    this.onEnd = onEnd;

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

    var walls = [
        [
            { x: -1, y: 20 },
            { x: 25, y: 18 },
            { x: 50, y: 17 },
            { x: 75, y: 18 },
            { x: 101, y: 20 },
            { x: 101, y: 101 },
            { x: -1, y: 101 }
        ], [
            { x: -1, y: -20 },
            { x: -1, y: -101 },
            { x: 101, y: -101 },
            { x: 101, y: -20 },
            { x: 75, y: -18 },
            { x: 50, y: -17 },
            { x: 25, y: -18 }
        ], [
            { x: 25, y: 10 },
            { x: 25, y: -10 },
            { x: 60, y: 10 }
        ], [
            { x: 75, y: 10 },
            { x: 40, y: -10 },
            { x: 75, y: -10 }
        ]
    ];

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

    this.turrets = [
        new Turret(this.world, this.soundscape, 30, -25),
        new Turret(this.world, this.soundscape, 55, 25)
    ];

    this.currentTick = 0;

    this.critterList = [];
    this.actionQueueList = [];
    this.nextActionIndexList = [];

    this.critterList.push(new Critter(this.world, this.soundscape, this.anchor, 10 * priorActionQueueList.length, 0));
    this.actionQueueList.push([]);
    this.nextActionIndexList.push(0);

    priorActionQueueList.forEach(function (list, i) {
        this.critterList.push(new Critter(this.world, this.soundscape, this.anchor, 10 * i, 0));
        this.actionQueueList.push(list);
        this.nextActionIndexList.push(0);
    }, this);
}

Stage.prototype.setTarget = function (x, y) {
    this.actionQueueList[0].push({ tick: this.currentTick, x: x, y: y });
};

Stage.prototype.clearTarget = function () {
};

Stage.prototype.advanceTime = function (secondsElapsed) {
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
        var tpos = this.critterList[0].body.GetPosition();
        if (tpos.x > 80) {
            this.onEnd(this.actionQueueList[0]);
            return;
        }
    }
};

module.exports = Stage;
