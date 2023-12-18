// Import the Enemy class from the current directory
import Enemy from './enemy.js';
import Weapon from './weapon.js';

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
    this.maxhp = hp;
    this.hp = hp;
    this.equipedWeapon = new Weapon({ min: 1, max: 3 }, 1, 'sharp', 1)
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
    super.endTurn();
    if(this.alert)
    {
      if(Math.floor(this.distanceToPlayer) > this.equipedWeapon.range)
      {
        this.moveTowardsPlayer(this.distanceToPlayer);
        this.target.moveTo(-10, -10)  
        this.action = 'move';
        this.countdown = this.game.roundDuration * (1 / (this.stats[1] + 2));
      }
      else
      {
        this.directionVector = { x: 0, y: 0 };
        this.attackVector = { x: this.player.x - this.x, y: this.player.y - this.y };
        this.target.moveTo(this.x + this.attackVector.x, this.y + this.attackVector.y);
        this.moveTo.moveTo(-10, -10);
        this.countdown = this.game.roundDuration * (3 / (this.stats[this.equipedWeapon.stat] + 2));
        this.action = 'attack';
      }
    }
    else
    {
      this.directionVector = { x: 0, y: 0 };
    }
  }

  act()
  {
    switch(this.action)
    {
      case 'move':
        this.move();
        this.action = null;
        break;
      case 'attack':
        this.attack();
        this.action = null
        break;
    }
  }

  moveTowardsPlayer(distance)
  {
    this.directionVector = { x: this.player.x - this.x, y: this.player.y - this.y };
    
    if(distance > this.stats[1] / 2)
    {
      this.directionVector = { x: Math.floor(this.directionVector.x / distance * this.stats[1] / 2), y: Math.floor(this.directionVector.y / distance * this.stats[1] / 2) };
    }
    else if (distance <= 2)
    {
      this.directionVector = { x: Math.floor(this.directionVector.x / distance), y: Math.floor(this.directionVector.y / distance) };
    }
    this.directionVector = { x: Math.floor(this.directionVector.x), y: Math.floor(this.directionVector.y) };
    this.moveTo.moveTo(this.x + this.directionVector.x, this.y + this.directionVector.y);
  }
}

// Export the Goblin class as the default export of this module
export default Goblin;
