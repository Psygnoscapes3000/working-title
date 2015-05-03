var StageRound = require('./StageRound.js');

function Session(soundscape) {
    this.soundscape = soundscape;
    this.currentRound = new StageRound(this.soundscape, []);
}

Session.prototype.advanceTime = function (elapsedSeconds) {
    // run sim and advance to new round if appropriate
    this.currentRound.advanceTime(elapsedSeconds);

    if (this.currentRound.isComplete) {
        this.currentRound = new StageRound(this.soundscape, this.currentRound.actionQueueList);
    }
};

module.exports = Session;
