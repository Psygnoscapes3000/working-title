
var fs = require('fs');
var howler = require('howler');

var soundUrlMap = {
    'fire-cannon': 'data:audio/wav;base64,' + btoa(fs.readFileSync(__dirname + '/assets/PS_Bomb_Launch.wav', 'binary')),
    'impact-metal.1': 'data:audio/wav;base64,' + btoa(fs.readFileSync(__dirname + '/assets/PS_Bullet_Impact_Metal_00.wav', 'binary')),
    'impact-metal.2': 'data:audio/wav;base64,' + btoa(fs.readFileSync(__dirname + '/assets/PS_Bullet_Impact_Metal_01.wav', 'binary'))
};

function Soundscape() {
}

Soundscape.prototype.play = function (soundName) {
    var howl = new howler.Howl({
        urls: [ soundUrlMap[soundName] ]
    });

    howl.play();
};

module.exports = Soundscape;
