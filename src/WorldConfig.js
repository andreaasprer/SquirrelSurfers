// Set World Constants

export const roadWidth = 20;
export const roadLength = 300;

export const LANES = [-roadWidth / 3, 0, roadWidth / 3];
export const NUM_LANES = LANES.length;

export const velocity = 30;
export const rewindDistance = 50;
export const rewindSpeed = 50;

export const LEVELS = [
    {
        name: 'Daytime',
        environment: 'day',
        distance: 100,
        numCookies: 20,
        numBenches: 10,
        numScooters: 5,
        obstacleRange: {
            min: -950,
            max: -50
        }
    },
    {
        name: 'Nighttime',
        environment: 'night',
        distance: 100,
        numCookies: 30,
        numBenches: 15,
        numScooters: 8,
        obstacleRange: {
            min: -950,
            max: -50
        }
    }
];