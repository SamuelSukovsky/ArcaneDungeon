import GameObject from '../engine/gameobject.js';
import Renderer from '../engine/renderer.js';
import Physics from '../engine/physics.js';
import Tile from './tile.js';
import Wall from './wall.js';
import UItext from '../engine/uitext.js';
import Attack from './attack.js';

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
    this.healthbar = new UItext('10/10', x, y - 10, '10px Arial', '#c00', 'center');
    this.addComponent(this.healthbar);
    this.moveTo = new Tile(-10, -10, '#800000', '#800000');
    this.target = new Tile(-10, -10, '#999', '#999');

    this.player;
    this.alert = false;
    this.action;
    this.countdown;
    
    // Initialize variables related to enemy's movement
    this.directionVector = { x: 0, y: 0};
    this.isGhost = false;
    
    this.equipedWeapon;
    this.attackVector = { x: 0, y: 0};

    // Initialize variables related to enemy's stats
    this.stats;
    this.maxhp;
    this.hp;
    this.resistances = [];
    this.weaknesses = [];
  }

  start()
  {
    this.game.addTile(this.moveTo);
    this.game.addTile(this.target);
    this.healthbar.setText(`${this.hp}/${this.maxhp}`)
    this.player = this.game.gameObjects.find(obj => obj instanceof Player);
  }

  // Define an update method that will run every frame of the game. It takes deltaTime as an argument
  // which represents the time passed since the last frame
  update(deltaTime)
  {
    if(this.countdown <= 0)
    {
      if(this.action != null)
      {
        this.act();
      }
    }
    else
    {
      this.countdown -= deltaTime;
    }
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
    // Get the Physics component of this enemy
    const physics = this.getComponent(Physics);
    physics.velocity.x = 0;
    physics.velocity.y = 0;
    super.endTurn();

    this.distanceToPlayer = Math.sqrt((this.player.x - this.x) * (this.player.x - this.x) + (this.player.y - this.y) * (this.player.y - this.y));

    if(!this.alert)
    {
      if(this.distanceToPlayer <= 1 + this.stats[2])
      {
        this.alert = true;
      }
    }

    this.isGhost = false;
    this.direction = -this.directionVector.x / Math.abs(this.directionVector.x);
  }

  act(){}

  move()
  {
    // Get the Physics component of this enemy
    const physics = this.getComponent(Physics);
    physics.velocity.x = this.directionVector.x / this.game.timeToPause;
    physics.velocity.y = this.directionVector.y / this.game.timeToPause;
  }

  attack()
  {
    let damage = this.equipedWeapon.damage.min + Math.floor(Math.random() * (this.equipedWeapon.damage.max - this.equipedWeapon.damage.min + 1)) + this.stats[this.equipedWeapon.stat];
    this.game.addGameObject(new Attack(this.x + this.attackVector.x, this.y + this.attackVector.y, '#ccc', null, this, damage, this.equipedWeapon.damageType));
  }

  bounce()
  {
    this.isGhost = true;
    this.getComponent(Physics).velocity = { x: (Math.round(this.x) - this.x) / this.game.timeToPause, y: (Math.round(this.y) - this.y) / this.game.timeToPause };
  }

  // The takeDamage method handles how the enemy takes damage (written entirely by co-pilot)
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
      this.game.removeGameObject(this);
      this.game.removeGameObject(this.moveTo);
      this.game.removeGameObject(this.target);
    }
  }
}

// Export the Enemy class as the default export of this module
export default Enemy;