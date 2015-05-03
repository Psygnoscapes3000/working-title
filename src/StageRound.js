var Stage = require('./Stage.js');
var StageView = require('./view/StageView.js');

function StageRound(soundscape, recordedActionQueueList) {
    this.stage = new Stage(soundscape, recordedActionQueueList);
    this.view = new StageView(this.stage);

    this.preCountdown = 1;
    this.postCountdown = 1;

    this.isComplete = false;
}

StageRound.prototype.advanceTime = function (elapsedSeconds) {
    if (this.preCountdown > 0) {
        // countdown to round
        this.preCountdown -= elapsedSeconds;
    } else if (!this.stage.isComplete) {
        // normal simulation
        this.stage.advanceTime(elapsedSeconds);
    } else if (this.postCountdown > 0) {
        // cooldown after round
        this.postCountdown -= elapsedSeconds;
    } else if (!this.isComplete) {
        // mark as complete and save data after cooldown
        this.isComplete = true;
        this.actionQueueList = this.stage.actionQueueList;
    }
};

StageRound.prototype.dispose = function () {
    this.view.dispose();
}

module.exports = StageRound;
