
var Box2D = require('box2dweb');

var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2Body = Box2D.Dynamics.b2Body;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;

var MOVE_FORCE = 1500;
var HIT_IMPULSE = 50;

function Critter(world, soundscape, anchor, x, y) {
    this.world = world;
    this.soundscape = soundscape;
    this.health = 1;

    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.2;
    fixDef.restitution = 0.1;
    fixDef.shape = new b2CircleShape(1.5);

    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.linearDamping = 20;
    bodyDef.angularDamping = 1;
    bodyDef.position.x = x;
    bodyDef.position.y = y;

    this.body = this.world.CreateBody(bodyDef);
    this.body.CreateFixture(fixDef);
    this.body.SetUserData(this);

    this.targetX = null;
    this.targetY = null;
}

Critter.prototype.setTarget = function (x, y) {
    if (this.health === 0) {
        throw new Error('not alive');
    }

    this.targetX = x;
    this.targetY = y;
};

Critter.prototype.clearTarget = function () {
    if (this.health === 0) {
        throw new Error('not alive');
    }
};

Critter.prototype.setupPhysicsStep = function () {
    if (this.targetX === null) {
        this.body.SetLinearDamping(20);
        return;
    }

    var tpos = this.body.GetPosition();
    var tvel = this.body.GetLinearVelocity();

    var distY = this.targetY - tpos.y, distX = this.targetX - tpos.x;
    var angle = Math.atan2(distY, distX);

    var dx = Math.cos(angle);
    var dy = Math.sin(angle);

    this.body.ApplyForce(new b2Vec2(dx * MOVE_FORCE, dy * MOVE_FORCE), tpos);
    this.body.SetLinearDamping(15);

    // transition to no target
    if (distX * distX + distY * distY < 0.5) {
        this.targetX = null;
        this.targetY = null;
    }
};

Critter.prototype.takeDamage = function (angle) {
    var dx = Math.cos(angle), dy = Math.sin(angle);

    this.body.ApplyImpulse(new b2Vec2(dx * HIT_IMPULSE, dy * HIT_IMPULSE), this.body.GetPosition());

    this.soundscape.play(Math.random() < 0.5 ? 'impact-metal.1' : 'impact-metal.2');

    if (this.health > 0) {
        this.health = Math.max(0, this.health - 0.3);

        if (this.health === 0) {
            this.targetX = null;
            this.targetY = null;
        }
    }
};

module.exports = Critter;
