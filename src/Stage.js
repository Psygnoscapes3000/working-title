
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

function Stage() {
    this.timeAccumulator = 0;
    this.world = new b2World(new b2Vec2(0, 0), true);

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
        [{
            x: -1, y: 20
        }, {
            x: 25, y: 18
        }, {
            x: 50, y: 17
        }, {
            x: 75, y: 18
        }, {
            x: 101, y: 20
        }, {
            x: 101, y: 101
        }, {
            x: -1, y: 101
        }],
        [{
            x: -1, y: -20
        }, {
            x: -1, y: -101
        }, {
            x: 101, y: -101
        }, {
            x: 101, y: -20
        }, {
            x: 75, y: -18
        }, {
            x: 50, y: -17
        }, {
            x: 25, y: -18
        }],
        [{
            x: 25, y: 10
        }, {
            x: 25, y: -10
        }, {
            x: 60, y: 10
        }],
        [{
            x: 75, y: 10
        }, {
            x: 40, y: -10
        }, {
            x: 75, y: -10
        }]
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
        new Turret(this.world, 30, -25),
        new Turret(this.world, 55, 25)
    ];

    this.critter = new Critter(this.world, this.anchor, 10, 0);
}

Stage.prototype.setTarget = function (x, y) {
    this.critter.setTarget(x, y);
};

Stage.prototype.clearTarget = function () {
    this.critter.clearTarget();
};

Stage.prototype.advanceTime = function (secondsElapsed) {
    this.timeAccumulator += secondsElapsed;

    while (this.timeAccumulator > 0) {
        this.timeAccumulator -= STEP_DURATION;
        this.world.Step(STEP_DURATION, 10, 10);
    }
};

module.exports = Stage;
