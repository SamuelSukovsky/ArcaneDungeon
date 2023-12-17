// Import the GameObject class from the 'engine' directory
import Tile from './tile.js';

// Import the Physics class from the 'engine' directory
import Physics from '../engine/physics.js';

// Import the Images object from the 'engine' directory. This object contains all the game's image resources
import {Images} from '../engine/resources.js';

class Wall extends Tile
{
    constructor(x, y, colour, image = null)
    {
        // Call parent's constructor
        super(x, y, colour, 64, 64, image);
        this.addComponent(new Physics({x:0, y:0}, {x:0, y:0}));
    }
}
  
// The Wall class is exported as the default export of this module.
export default Wall;