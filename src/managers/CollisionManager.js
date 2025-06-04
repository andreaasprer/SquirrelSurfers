export default class CollisionManager {
    constructor(scene, squirrel, score, lives) {
        this.scene = scene;
        this.squirrel = squirrel;
        this.score = score;
        this.lives = lives;
        this.snacks = [];
        this.benches = [];
        this.scooters = [];
        this.terrain = null;
        this.trashcan = null;
    }

    setScooters(scooters) {
        this.scooters = scooters;
    }

    setCookies(snacks) {
        this.snacks = snacks;
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
        this.snacks.forEach(snack => snack.update(delta));
        this.benches.forEach(bench => bench.update(delta));
        this.scooters.forEach(scooter => scooter.update(delta));

        if (isRewinding) return;

        this.checkSnackCollisions();
        this.checkBenchCollisions();
        this.checkScooterCollisions();
    }

    checkSnackCollisions() {
        for (let i = this.snacks.length - 1; i >= 0; i--) {
            const snack = this.snacks[i];

            if (this.squirrel.boundingBox && snack.boundingBox && snack.model) {
                if (this.squirrel.boundingBox.intersectsBox(snack.boundingBox)) {
                    this.score.increment();
                    snack.remove();
                    this.snacks.splice(i, 1);
                    continue;
                }
            }

            // despawn cookie when squirrel misses
            if (snack.model && snack.model.position.z > 50) {
                snack.remove();
                this.snacks.splice(i, 1);
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

    checkScooterCollisions() {
        for (let i = this.scooters.length - 1; i >= 0; i--) {
            const scooter = this.scooters[i];
            if (this.squirrel.boundingBox && scooter.boundingBox && scooter.model) {
                if (this.squirrel.boundingBox.intersectsBox(scooter.boundingBox)) {
                    console.log('scooter collision');
                    this.lives.decrement();
                    this.startRewindAll();
                }
            }

            // despawn scooter when it's off screen
            if (scooter.model && scooter.model.position.z > 50) {
                scooter.remove();
                this.scooters.splice(i, 1);
            }
        }
    }

    startRewindAll() {
        this.terrain.startRewind();
        this.snacks.forEach(snack => snack.startRewind());
        this.benches.forEach(bench => bench.startRewind());
        this.scooters.forEach(scooter => scooter.startRewind());
        this.trashcan.startRewind();
    }
} 