export default class LivesCounter {
    constructor(squirrel) {
        this.squirrel = squirrel;
        this.lives = this.squirrel.getLivesCnt();
        this.heartsContainer = document.getElementById("hearts");
        this._renderHearts();
    }

    decrement() {
        if (this.lives > 0) {
            this.squirrel.loseLife();
            this.lives--;
            this._renderHearts();
        }
    }

    // render hearts based on lives
    _renderHearts() {
        // empty hearts container
        this.heartsContainer.innerHTML = "";

        // for each life create a heart
        for (let i = 0; i < this.lives; i++) {
            let heart = document.createElement("img");
            heart.src = "../../images/hearts.png";
            heart.classList.add("heart");
            this.heartsContainer.appendChild(heart);
        }
    }
}