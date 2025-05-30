
export default class DistanceCounter {
    constructor(terrain) {
        this.terrain = terrain;
        this.distance = this.terrain.distanceCovered();

        // insert distance counter HUD into HTML
        let distanceDiv = document.createElement("div");
        distanceDiv.id = "distance";
        let distanceText = document.createTextNode(this.updateMessage());
        distanceDiv.appendChild(distanceText);
        document.getElementById("hud").appendChild(distanceDiv);

        this.distanceDisplay = distanceDiv;
    }

    updateDistance() {
        this.distance = this.terrain.distanceCovered();
        this.distanceDisplay.innerHTML = this.updateMessage();
    }

    updateMessage() {
        return "Distance: " + this.distance;
    }

    getDistance() {
        return this.distance;
    }
}