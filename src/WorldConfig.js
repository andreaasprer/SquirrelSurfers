// Set World Constants

export const roadWidth = 20;
export const roadLength = 300;

export const LANES = [-roadWidth / 3, 0, roadWidth / 3];
export const NUM_LANES = LANES.length;
export const OBSTACLE_Z_RANGE = { min: -2000, max: -50 };

export const velocity = 30;
export const rewindDistance = 50;
export const rewindSpeed = 50;

export const LEVELS = [
    {
        name: 'Daytime',
        environment: 'day',
        distance: 200,
        numCookies: 20,
        numBenches: 10
    },
    {
        name: 'Nighttime',
        environment: 'night',
        distance: 300,
        numCookies: 30,
        numBenches: 15
    }
];