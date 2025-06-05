export default class SnackCounter {
    constructor() {
        this.count = 0;

        // insert snack counter HUD into HTML
        let scoreDiv = document.createElement("div");
        scoreDiv.id = "score";
        let scoreText = document.createTextNode(this.updateMessage());
        scoreDiv.appendChild(scoreText);
        document.getElementById("hud").appendChild(scoreDiv);

        this.scoreDisplay = scoreDiv;
    }

    increment(points = 1) {
        this.count += points;
        this.scoreDisplay.innerHTML = this.updateMessage();
    }

    updateMessage() {
        return "Score: " + this.count;
    }
}