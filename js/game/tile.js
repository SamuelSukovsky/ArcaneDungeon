// Import the Renderer class from the 'engine' directory
import Renderer from '../engine/renderer.js';

// Import the Images object from the 'engine' directory. This object contains all the game's image resources
import {Images} from '../engine/resources.js';

class Tile
{
  constructor(x = 0, y = 0, colour = 'white', image = null)
  {
    // The x-coordinate of the Tile's position.
    this.x = x;
    // The y-coordinate of the Tile's position.
    this.y = y;
    // An array to hold all the components that are attached to this GameObject.
    this.renderer = new Renderer(colour, 64, 64, image);
    this.renderer.gameObject = this;
  }

  draw(ctx)
  {
    this.renderer.draw(ctx);
  }

  update(deltaTime){}

  moveTo(x, y)
  {
    this.x = x;
    this.y = y;
  }
}
  
// The Tile class is exported as the default export of this module.
export default Tile;