
var Box2D = require('box2dweb');

var b2Body = Box2D.Dynamics.b2Body;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;

function Turret(world, x, y) {
    this.world = world;
    this.iCanHasTurret = true;

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
};

Turret.prototype.removeTarget = function (target) {
    console.log('oops', target);
};

module.exports = Turret;
