export default class LivesCounter {
    constructor(squirrel) {
        this.squirrel = squirrel;
        this.count = this.squirrel.getLivesCnt();

        // insert snack counter HUD into HTML
        let livesDiv = document.createElement("div");
        livesDiv.id = "lives";
        let livesText = document.createTextNode(this.updateMessage());
        livesDiv.appendChild(livesText);
        document.getElementById("hud").appendChild(livesDiv);

        this.livesDisplay = livesDiv;
    }

    decrement() {
        if (this.count == 0) {
            this.livesDisplay.innerHTML = this.gameOver();
            return;
        }

        this.squirrel.loseLife();
        this.livesDisplay.innerHTML = this.updateMessage();
    }
    
    updateMessage() {
        this.count = this.squirrel.getLivesCnt();
        return "Lives: " + this.count;
    }

    gameOver() {
        return "Game Over";
    }
    
}