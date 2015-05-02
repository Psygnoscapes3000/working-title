
var Box2D = require('box2dweb');

var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2Body = Box2D.Dynamics.b2Body;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;

function Critter(world, anchor, x, y) {
    this.world = world;

    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.2;
    fixDef.restitution = 0.1;
    fixDef.shape = new b2CircleShape(1.5);

    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.x = x;
    bodyDef.position.y = y;

    this.body = this.world.CreateBody(bodyDef);
    this.body.CreateFixture(fixDef);
    this.body.SetUserData(this);

    var jDef = new b2MouseJointDef();

    jDef.bodyA = anchor;
    jDef.bodyB = this.body;
    jDef.target = new b2Vec2(bodyDef.position.x, bodyDef.position.y);

    jDef.maxForce = 0;
    jDef.dampingRatio = 0.8;

    this.joint = this.world.CreateJoint(jDef);
}

Critter.prototype.setTarget = function (x, y) {
    this.joint.SetMaxForce(200);
    this.joint.SetTarget(new b2Vec2(x, y));
};

Critter.prototype.clearTarget = function () {
    this.joint.SetMaxForce(0);
};

module.exports = Critter;
