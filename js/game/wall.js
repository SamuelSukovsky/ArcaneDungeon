// Import the GameObject class from the 'engine' directory
import Tile from '../engine/tile.js';

// Import the Physics class from the 'engine' directory
import Physics from '../engine/physics.js';

// Import the Images object from the 'engine' directory. This object contains all the game's image resources
import {Images} from '../engine/resources.js';

class Wall extends Tile
{
    constructor(x, y, colour)
    {
        super(x, y, colour); // Call parent's constructor
        this.addComponent(new Physics({x:0, y:0}, {x:0, y:0}));
    }
}