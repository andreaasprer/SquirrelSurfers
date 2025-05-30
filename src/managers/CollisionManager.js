export default class CollisionManager {
    constructor(scene, squirrel, score, lives) {
        this.scene = scene;
        this.squirrel = squirrel;
        this.score = score;
        this.lives = lives;
        this.cookies = [];
        this.benches = [];
        this.scooter = null;
        this.terrain = null;
        this.trashcan = null;
    }

    setScooter(scooter) {
        this.scooter = scooter;
    }

    setCookies(cookies) {
        this.cookies = cookies;
    }

    setBenches(benches) {
        this.benches = benches;
    }

    setTerrain(terrain) {
        this.terrain = terrain;
    }

    setTrashcan(trashcan) {
        this.trashcan = trashcan;
    }

    update(delta, isRewinding) {
        // Update all objects first
        this.cookies.forEach(cookie => cookie.update(delta));
        this.benches.forEach(bench => bench.update(delta));

        if (isRewinding) return;

        this.checkCookieCollisions();
        this.checkBenchCollisions();
        this.checkScooterCollision();
    }

    checkCookieCollisions() {
        for (let i = this.cookies.length - 1; i >= 0; i--) {
            const cookie = this.cookies[i];

            if (this.squirrel.boundingBox && cookie.boundingBox && cookie.model) {
                if (this.squirrel.boundingBox.intersectsBox(cookie.boundingBox)) {
                    this.score.increment();
                    cookie.remove();
                    this.cookies.splice(i, 1);
                    continue;
                }
            }

            // despawn cookie when squirrel misses
            if (cookie.model && cookie.model.position.z > 50) {
                cookie.remove();
                this.cookies.splice(i, 1);
            }
        }
    }

    checkBenchCollisions() {
        for (let i = this.benches.length - 1; i >= 0; i--) {
            const bench = this.benches[i];

            if (this.squirrel.boundingBox && bench.boundingBox && bench.model) {
                if (this.squirrel.boundingBox.intersectsBox(bench.boundingBox)) {
                    // Check if squirrel is above the bench and falling
                    if (this.squirrel.isJumping && this.squirrel.verticalVelocity < 0) {
                        const squirrelBottom = this.squirrel.boundingBox.min.y;
                        const benchTop = bench.boundingBox.max.y;

                        if (squirrelBottom >= benchTop - 0.3) {  // Small threshold for smooth landing
                            this.squirrel.landOn(bench);
                        }
                    } else if (!this.squirrel.isOnPlatform) {
                        // Only lose life if not already on platform and hitting bench from side
                        this.lives.decrement();
                        this.startRewindAll();
                    }
                }

                // Check if squirrel should fall off the bench
                if (this.squirrel.isOnPlatform) {
                    const p = this.squirrel.currentPlatform;
                    if (p && p.boundingBox.min.z > this.squirrel.boundingBox.max.z) {
                        this.squirrel.fallOffPlatform();
                    }
                }
            }

            // despawn bench when squirrel misses
            if (bench.model && bench.model.position.z > 50) {
                bench.remove();
                this.benches.splice(i, 1);
            }
        }
    }

    checkScooterCollision() {
        if (this.squirrel.boundingBox && this.scooter.boundingBox && this.scooter.model) {
            if (this.squirrel.boundingBox.intersectsBox(this.scooter.boundingBox)) {
                this.lives.decrement();
                this.startRewindAll();
            }
        }
    }

    startRewindAll() {
        this.scooter.startRewind();
        this.terrain.startRewind();
        this.cookies.forEach(cookie => cookie.startRewind());
        this.benches.forEach(bench => bench.startRewind());
        this.trashcan.startRewind();
    }
} 