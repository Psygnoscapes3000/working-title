
var Box2D = require('box2dweb');

var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2Body = Box2D.Dynamics.b2Body;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

var HIT_IMPULSE = 50;

function Turret(world, x, y) {
    this.world = world;
    this.x = x;
    this.y = y;
    this.iCanHasTurret = true;

    this.cooldown = 0;
    this.targetStack = [];

    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_staticBody;
    bodyDef.position.x = x;
    bodyDef.position.y = y;

    var fixDef = new b2FixtureDef();
    fixDef.shape = new b2CircleShape(20);

    this.markerBody = this.world.CreateBody(bodyDef);
    this.markerBody.CreateFixture(fixDef).SetSensor(true);
    this.markerBody.SetUserData(this);
}

Turret.prototype.addTarget = function (target) {
    console.log('yo', target);

    this.targetStack.push(target);
};

Turret.prototype.removeTarget = function (target) {
    console.log('oops', target);

    var i = this.targetStack.indexOf(target);
    if (i !== -1) {
        this.targetStack.splice(i, 1);
    }
};

Turret.prototype.fireOnTarget = function (target) {
    console.log('firing on', target);

    this.cooldown = 2;

    var tpos = target.body.GetPosition();
    var angle = Math.atan2(tpos.y - this.y, tpos.x - this.x);
    var dx = Math.cos(angle), dy = Math.sin(angle);

    // visual indication of hit direction
    this.markerBody.SetAngle(angle);

    target.body.ApplyImpulse(new b2Vec2(dx * HIT_IMPULSE, dy * HIT_IMPULSE), tpos);
};

Turret.prototype.advanceTime = function (elapsedSeconds) {
    this.cooldown = Math.max(0, this.cooldown - elapsedSeconds);

    // fire if ready
    if (this.cooldown === 0 && this.targetStack.length > 0) {
        this.fireOnTarget(this.targetStack[0]);
    }
};


module.exports = Turret;
