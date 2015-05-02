
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

function Stage() {
    this.timeAccumulator = 0;
    this.world = new b2World(new b2Vec2(0, 0), true);

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

    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.2;
    fixDef.restitution = 0.1;
    fixDef.shape = new b2CircleShape(1.5);

    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.x = 10;
    bodyDef.position.y = 0;

    this.testBody = this.world.CreateBody(bodyDef);
    this.testBody.CreateFixture(fixDef);

    var anchorDef = new b2BodyDef();
    anchorDef.type = b2Body.b2_staticBody;
    anchorDef.position.x = 0;
    anchorDef.position.y = 0;

    this.anchor = this.world.CreateBody(anchorDef);

    var jDef = new b2MouseJointDef();

    jDef.bodyA = this.anchor;
    jDef.bodyB = this.testBody;
    jDef.target = new b2Vec2(bodyDef.position.x, bodyDef.position.y);

    jDef.maxForce = 0;
    jDef.dampingRatio = 0.8;

    this.joint = this.world.CreateJoint(jDef);
}

Stage.prototype.setTarget = function (x, y) {
    this.joint.SetMaxForce(200);
    this.joint.SetTarget(new b2Vec2(x, y));
};

Stage.prototype.clearTarget = function () {
    this.joint.SetMaxForce(0);
};

Stage.prototype.advanceTime = function (secondsElapsed) {
    this.timeAccumulator += secondsElapsed;

    while (this.timeAccumulator > 0) {
        this.timeAccumulator -= STEP_DURATION;
        this.world.Step(STEP_DURATION, 10, 10);
    }
};

module.exports = Stage;
