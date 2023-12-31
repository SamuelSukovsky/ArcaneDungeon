// Import the required modules and classes.
import Component from './component.js';

// The Renderer class extends Component and handles the visual representation of a game object.
class Renderer extends Component
{
  // The constructor initializes the renderer component with optional color, width, height, and image.
  constructor(colour = 'white', width = 64, height = 64, image = null)
  {
    super(); // Call the parent constructor.
    this.colour = colour; // Initialize the color.
    this.width = width; // Initialize the width.
    this.height = height; // Initialize the height.
    this.image = image; // Initialize the image.
  }

  // The draw method handles rendering the game object on the canvas.
  draw(ctx)
  {
    // Get the position and dimensions of the game object.
    const x = this.gameObject.x * 64;
    const y = this.gameObject.y * 64;
    const w = this.width;
    const h = this.height;
    // If an image is provided and it has finished loading, draw the image.
    if (this.image && this.image.complete)
    {
      // Check if the image should be flipped horizontally based on the direction of the game object.
      const flipX = this.gameObject.direction === -1;
      if (!flipX)
      {
        // If the image should not be flipped, draw it as is.
        ctx.drawImage(this.image, x, y, w, h);
      } 
      else
      {
        // If the image should be flipped, save the current drawing state,
        // translate and scale the drawing context to flip the image,
        // draw the image, and then restore the drawing state.
        ctx.save();
        ctx.translate(x + w, y);
        ctx.scale(-1, 1);
        ctx.drawImage(this.image, 0, 0, w, h);
        ctx.restore();
      }
    }
    else
    {
      // If no image is provided or it has not finished loading, draw a rectangle with the specified color.
      ctx.fillStyle = this.colour;
      ctx.fillRect(x, y, w, h);
    }
  }
}

// The Renderer class is then exported as the default export of this module.
export default Renderer;
