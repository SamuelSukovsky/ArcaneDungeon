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
    // Give the goblin a weapon
    this.equipedWeapon = new Weapon({ min: 1, max: 3 }, 1, 'sharp', 1)
  }

  // Define an update method that will run every frame of the game. It takes deltaTime as an argument
  // which represents the time passed since the last frame
  update(deltaTime)
  {
    // Call the update method of the superclass (Enemy), passing along deltaTime
    super.update(deltaTime);
  }

  // The endTurn method is called at the end of turn, handling it's actions
  endTurn()
  {
    // Call the endTurn method of the superclass (Enemy)
    super.endTurn();
    // If the goblin is alerted to the player
    if(this.alert)
    {
      // If the distance is greater than the weapons's range
      if(Math.floor(this.distanceToPlayer) > this.equipedWeapon.range)
      {
        // Get direction vector towards player
        this.moveTowardsPlayer(this.distanceToPlayer);
        // Move target indicator off the screen
        this.target.moveTo(-10, -10)
        // Set action to move
        this.action = 'move';
        // Set countdown based on Agility
        this.countdown = this.game.roundDuration * (1 / (this.stats[1] + 2));
      }
      // Else
      else
      {
        // Set direction vector to 0
        this.directionVector = { x: 0, y: 0 };
        // Set attack vector towards player
        this.attackVector = { x: this.player.x - this.x, y: this.player.y - this.y };
        // Set target indicator to player's position
        this.target.moveTo(this.x + this.attackVector.x, this.y + this.attackVector.y);
        // Move movement indicator off the screen
        this.moveTo.moveTo(-10, -10);
        // Set action to attack
        this.action = 'attack';
        // Set countdown based on the weapon stat
        this.countdown = this.game.roundDuration * (3 / (this.stats[this.equipedWeapon.stat] + 2));
      }
    }
    // If not alerted
    else
    {
      // Set direction vector to 0
      this.directionVector = { x: 0, y: 0 };
    }
  }

  // The act method handles how the goblin acts
  act()
  {
    // Trigger corresponding action
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

  // The moveTowardsPlayer method calculates the direction vector towards the player
  moveTowardsPlayer(distance)
  {
    // Calculate the direction vector towards the player
    this.directionVector = { x: this.player.x - this.x, y: this.player.y - this.y };
    
    // If the distance is greater than the goblin's speed based on Agility
    if(distance > this.stats[1] / 2)
    {
      // Set the direction vector's size to the goblin's speed based on Agility
      this.directionVector = { x: Math.floor(this.directionVector.x / distance * this.stats[1] / 2), y: Math.floor(this.directionVector.y / distance * this.stats[1] / 2) };
    }
    // Else if the player is within 2 tiles
    else if (distance <= 2)
    {
      // Set the direction vector's size to 1
      this.directionVector = { x: Math.floor(this.directionVector.x / distance), y: Math.floor(this.directionVector.y / distance) };
    }
    // Round the direction vector's values
    this.directionVector = { x: Math.floor(this.directionVector.x), y: Math.floor(this.directionVector.y) };
    // Set the movement indicator to the goblin's position plus the direction vector
    this.moveTo.moveTo(this.x + this.directionVector.x, this.y + this.directionVector.y);
  }
}

// Export the Goblin class as the default export of this module
export default Goblin;
