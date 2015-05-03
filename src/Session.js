var StageRound = require('./StageRound.js');

function Session(soundscape) {
    this.soundscape = soundscape;
    this.currentRound = new StageRound(this.soundscape, [], false);
}

Session.prototype.advanceTime = function (elapsedSeconds) {
    // run sim and advance to new round if appropriate
    this.currentRound.advanceTime(elapsedSeconds);

    if (this.currentRound.isComplete) {
        if (this.currentRound.isFinal) {
            // console.log('final round!');
        } else {
            var recordedList = this.currentRound.actionQueueList;

            this.currentRound = new StageRound(this.soundscape, recordedList, recordedList.length > 2);
        }
    }
};

module.exports = Session;
