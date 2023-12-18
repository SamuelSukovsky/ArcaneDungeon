// Import the Renderer class from the 'engine' directory
import Renderer from '../engine/renderer.js';

// Import the Images object from the 'engine' directory. This object contains all the game's image resources
import {Images} from '../engine/resources.js';

class Tile
{
  constructor(x = 0, y = 0, colour = 'white', hidden = 'grey', image = null)
  {
    // The x-coordinate of the Tile's position.
    this.x = x;
    // The y-coordinate of the Tile's position.
    this.y = y;
    // An array to hold all the components that are attached to this GameObject.
    this.components = [];
    this.addComponent(new Renderer('#0F0F0F', 64, 64, image));
    this.colour = colour;
    this.hiddenColour = hidden;
    this.visibility = 0;
  }
  
  // The addComponent method is used to attach a new component to this Tile.
  addComponent(component)
  {
    // Add the component to the list of this Tile's components.
    this.components.push(component);
    // Set the gameObject property of the component to this Tile.
    // This way, the component has a reference back to the Tile it is attached to.
    component.gameObject = this;
  }
  
  // The getComponent method is used to get the first component of this Tile that is an instance of the given class.
  // componentClass is the class of the component to get.
  getComponent(componentClass)
  {
    // Find the first component that is an instance of componentClass.
    return this.components.find((component) => component instanceof componentClass);
  }

  draw(ctx)
  {
    if(this.visibility > 0)
    {
      this.components[0].draw(ctx);
    }
  }

  moveTo(x, y)
  {
    this.x = x;
    this.y = y;
  }

  changeVisibility(visibility)
  {
    switch(visibility)
    {
      case 0:
        this.visibility = 0;
        break;
      case 1:
        this.visibility = 1;
        this.getComponent(Renderer).colour = this.hiddenColour;
        break;
      case 2:
        this.visibility = 2;
        this.getComponent(Renderer).colour = this.colour;
        break;
    }
  }
}
  
// The Tile class is exported as the default export of this module.
export default Tile;