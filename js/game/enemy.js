import GameObject from '../engine/gameobject.js';
import Renderer from '../engine/renderer.js';
import Physics from '../engine/physics.js';
import Tile from './tile.js';
import Wall from './wall.js';

// Import the Images object from the 'engine' directory. This object contains all the game's image resources
import {Images} from '../engine/resources.js';

// Import the Player class from the current directory
import Player from './player.js';

// Define a new class, Enemy, which extends (i.e., inherits from) GameObject
class Enemy extends GameObject
{

  // Define the constructor for this class, which takes two arguments for the x and y coordinates
  constructor(x = 0, y = 0, colour = 'green', w = 64, h = 64, image = null)
  {
    // Call the constructor of the superclass (GameObject) with the x and y coordinates
    super(x, y);
    
    // Add a Renderer component to this enemy, responsible for rendering it in the game.
    // The renderer uses the color 'green', dimensions 50x50, and an enemy image from the Images object
    this.addComponent(new Renderer(colour, w, h, image));
    
    // Add a Physics component to this enemy, responsible for managing its physical interactions
    // Sets the initial velocity and acceleration
    this.addComponent(new Physics({ x: 0, y: 0 }, { x: 0, y: 0 }));
    this.moveTo = new Tile(-10, -10, 'red');

    this.player;
    this.alert = false;
    
    // Initialize variables related to enemy's movement
    this.speed = 4;
    this.directionVector = { x: 0, y: 0};
    this.isGhost = false;

    // Initialize variables related to enemy's stats
    this.stats;
    this.hp;
    this.resistances = [];
    this.weaknesses = [];
  }

  start()
  {
    this.game.addTile(this.moveTo);
    this.player = this.game.gameObjects.find(obj => obj instanceof Player);
  }

  // Define an update method that will run every frame of the game. It takes deltaTime as an argument
  // which represents the time passed since the last frame
  update(deltaTime)
  {
    // Get the Physics component of this enemy
    const physics = this.getComponent(Physics);

    // Handle collisions with walls
    const walls = this.game.tiles.filter((obj) => obj instanceof Wall);
    if(!this.isGhost)
    {
      for (const wall of walls)
      {
        if (physics.isColliding(wall.getComponent(Physics)))
        {
          this.bounce();
        }
      }
    }

    if(!this.alert)
    {
      if(Math.abs(this.player.x - this.x) <= 3 + this.stats[2] && Math.abs(this.player.y - this.y) <= 3 + this.stats[2])
      {
        this.alert = true;
      }
    }

    // Check if the enemy is colliding with the player
    if (physics.isColliding(this.player.getComponent(Physics)))
    {
      this.player.collidedWithEnemy();
    }

    // Call the update method of the superclass (GameObject), passing along deltaTime
    super.update(deltaTime);
  }

  endTurn()
  {
    const physics = this.getComponent(Physics)
    this.isGhost = false;
    super.endTurn();
    
    physics.velocity.x = this.directionVector.x * this.speed;
    physics.velocity.y = this.directionVector.y * this.speed;
    this.direction = -this.directionVector.x / Math.abs(this.directionVector.x);
  }

  moveTowardsPlayer()
  {
    this.directionVector = { x: this.player.x - this.x, y: this.player.y - this.y };
    let distance = Math.sqrt(this.directionVector.x * this.directionVector.x + this.directionVector.y * this.directionVector.y) + 1;
    if(distance > this.stats[1] / 2)
    {
      this.directionVector = { x: this.directionVector.x / distance * this.stats[1] / 2, y: this.directionVector.y / distance * this.stats[1] / 2 };
    }
    this.directionVector = { x: Math.floor(this.directionVector.x + .5), y: Math.floor(this.directionVector.y + .5) };
    this.moveTo.moveTo(this.x + this.directionVector.x, this.y + this.directionVector.y);
  }

  bounce()
  {
    this.isGhost = true;
    this.getComponent(Physics).velocity = { x: (Math.round(this.x) - this.x) / this.game.timeToPause, y: (Math.round(this.y) - this.y) / this.game.timeToPause };
  }

  // The takeDamage method handles how the enemy takes damage (written by co-pilot)
  takeDamage(damage, damageType)
  {
    // If the enemy is resistant to the damage type, halve the damage
    if(this.resistances.includes(damageType))
    {
      damage = Math.ceil(damage / 2);
    }
    // Else if the enemy is weak to the damage type, double the damage
    else if(this.weaknesses.includes(damageType))
    {
      damage *= 2;
    }
    // Subtract the damage from the enemy's hp
    this.hp -= damage;
    // If the enemy's hp is less than or equal to 0, remove it from the game
    if(this.hp <= 0)
    {
      this.game.removeGameObject(this.moveTo);
      this.game.removeGameObject(this);
    }
  }
}

// Export the Enemy class as the default export of this module
export default Enemy;
