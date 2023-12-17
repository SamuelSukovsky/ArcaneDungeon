// Import the Enemy class from the current directory
import Enemy from './enemy.js';

// Import the Images object from the 'engine' directory. This object contains all the game's image resources
import {Images} from '../engine/resources.js';

// Define a new class, Enemy, which extends (i.e., inherits from) GameObject
class Goblin extends Enemy
{

  // Define the constructor for this class, which takes two arguments for the x and y coordinates
  constructor(x = 0, y = 0, stats = [2, 4, 3], hp = 10, colour = 'green', image = null)
  {
    // Call the constructor of the superclass (GameObject) with the x and y coordinates
    super(x, y, colour, 64, 64, image);

    // Initialize variables related to enemy's stats
    this.stats = stats;
    this.hp = hp;
  }

  // Define an update method that will run every frame of the game. It takes deltaTime as an argument
  // which represents the time passed since the last frame
  update(deltaTime)
  {
    // Call the update method of the superclass (GameObject), passing along deltaTime
    super.update(deltaTime);
  }

  endTurn()
  {
    if(this.alert)
    {
      this.moveTowardsPlayer();
    }
    else
    {
      this.directionVector = { x: 0, y: 0 };
    }
    super.endTurn();
  }
}

// Export the Goblin class as the default export of this module
export default Goblin;
