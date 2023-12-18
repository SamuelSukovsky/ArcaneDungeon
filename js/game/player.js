// Importing necessary components and resources
import GameObject from '../engine/gameobject.js';
import Renderer from '../engine/renderer.js';
import Physics from '../engine/physics.js';
import Input from '../engine/input.js';
import { Images } from '../engine/resources.js';
import Enemy from './enemy.js';
import ParticleSystem from '../engine/particleSystem.js';
import Tile from './tile.js';
import Wall from './wall.js';
import Weapon from './weapon.js';
import Attack from './attack.js';

// Defining a class Player that extends GameObject
class Player extends GameObject
{
  // Constructor initializes the game object and add necessary components
  constructor(x, y)
  {
    super(x, y); // Call parent's constructor
    this.renderer = new Renderer('blue', 64, 64, Images.player); // Add renderer
    this.addComponent(this.renderer);
    this.addComponent(new Physics({ x: 0, y: 0 }, { x: 0, y: 0 })); // Add physics
    this.addComponent(new Input()); // Add input for handling user input
    // Add directional indicators
    this.moveTo = new Tile(-10, -10, '#800000', '#800000');
    this.target = new Tile(-10, -10, '#999', '#999');
    // Initialize all the player specific properties
    this.direction = 1;
    this.directionVector = { x: 0, y: 0};
    this.isGhost = false;
    this.visibility = 2;
    
    this.baseStat = 3;
    this.stats = [];      // Stats are [Strength, Agility, Intelligence]
    this.statIncrease = [1, 2];
    
    this.equipedWeapon = new Weapon({ min: 1, max: 3 }, 0, 'sharp', 1);
    this.attackVector = { x: 0, y: 0};

    this.maxStamina = 10;
    this.stamina = 10;
    this.maxhp = 30;
    this.hp = 30;
    this.resistances = [];
    this.weaknesses = [];

    this.action = null;
    this.countdown = 0;
    this.resting;
  }

  // The start function is run when player is added to the game
  start()
  {
    // Sets all player stats to base stat value
    this.stats = [this.baseStat, this.baseStat, this.baseStat];
    // For each stat increase, randomly increase one stat
    while(this.statIncrease.length > 0)
    {
      let index = Math.floor(Math.random() * 3);
      if(this.stats[index] == this.baseStat)
      {
        this.stats[index] += this.statIncrease.shift();
      }
    }

    // Set player's max and current health based on the Strength stat
    this.maxhp = this.stats[0] * 10;
    this.hp = this.maxhp;
    // Set player's max and current stamina based on the Agility stat
    this.maxStamina = this.stats[1] * 3;
    this.stamina = this.maxStamina;

    // Add the directional indicatirs to the game and make them visible
    this.game.addTile(this.moveTo);
    this.moveTo.changeVisibility(2);
    this.game.addTile(this.target);
    this.target.changeVisibility(2);

    // Scan the area around the player based on Intelligence
    this.scan(1 + this.stats[2])
  }

  // The checkInput function checks for user input and returns true if the player has taken an action
  checkInput()
  {
    const input = this.getComponent(Input); // Get input component
    // Set action to false by default
    var action = false;
    
    // Get the mouse position and set the direction vector to the mouse position
    this.directionVector = { x: input.mousePos.x, y: input.mousePos.y };
    // Calculate pixel distance to mouse position
    let distance = Math.sqrt(this.directionVector.x * this.directionVector.x + this.directionVector.y * this.directionVector.y)
    // If the distance is greater than the player's movement speed based on Agility, set the direction vector's size to the player's movement speed
    if(distance > this.stats[1] * 8 / this.game.roundDuration)
    {
      this.directionVector = { x: Math.floor(this.directionVector.x / distance * this.stats[1] * 32), y: Math.floor(this.directionVector.y / distance * this.stats[1] * 32) };
    }
    // Set the direction vector to the appropriate tile and move the directional indicator there
    this.directionVector = { x: Math.floor((this.directionVector.x + 32) / 64), y: Math.floor((this.directionVector.y + 32) / 64) };
    this.moveTo.moveTo(this.x + this.directionVector.x, this.y + this.directionVector.y);
    
    // Get the mouse position and set the attack vector to the mouse position
    this.attackVector = { x: input.mousePos.x, y: input.mousePos.y };
    // Calculate pixel distance to mouse position
    distance = Math.sqrt(this.attackVector.x * this.attackVector.x + this.attackVector.y * this.attackVector.y)
    // If the distance is greater than the player's attack range, set the attack vector's size to the player's attack range
    if(distance > this.equipedWeapon.range)
    {
      this.attackVector = { x: this.attackVector.x / distance * this.equipedWeapon.range, y: this.attackVector.y / distance * this.equipedWeapon.range };
    }
    // Set the attack vector to the appropriate tile and move the directional indicator there
    this.attackVector = { x: Math.floor(this.attackVector.x + .5), y: Math.floor(this.attackVector.y + .5) };
    this.target.moveTo(this.x + this.attackVector.x, this.y + this.attackVector.y);

    // If the left mouse button is pressed
    if(input.isMouseDown(0))
    {
      // Move target indicator off the screen
      this.target.moveTo(-10, -10);
      // If the player remained stationary, rest
      if(this.directionVector.x == 0 && this.directionVector.y == 0)
      {
        // Set the countdown to the player's rest time
        this.countdown = this.game.roundDuration - .02;
        // Record the player's health and stamina
        this.resting = this.hp + this.stamina;
        // Set the player's action to rest
        this.action = 'rest';
      }
      // Else, move
      else
      {
        // Set the sprite direction to the direction of movement
        this.direction = -this.directionVector.x / Math.abs(this.directionVector.x);
        // Set the countdown to the player's movement time based on Agility
        this.countdown = this.game.roundDuration * (1 / (this.stats[1] + 2));
        // Set the player's action to move
        this.action = 'move';
      }
      // Set action to true
      action = true;
    }
    // Else if the right mouse button is pressed
    else if(input.isMouseDown(2))
    {
      // Move movement indicator off the screen
      this.moveTo.moveTo(-10, -10);
      // Set the countdown to the player's attack time based on the weapon's stat
      this.countdown = this.game.roundDuration * (3 / (this.stats[this.equipedWeapon.stat] + 2));
      // Set the player's action to attack
      this.action = 'attack';
      // Set action to true
      action = true;
    }

    // Return action
    return action;
  }

  // The update function runs every frame of the turn and contains game logic
  update(deltaTime)
  {
    // If the action countdown is done
    if(this.countdown <= 0)
    {
      // If there is an action to execute
      if(this.action != null)
      {
        // Execute the action
        switch(this.action)
        {
          case 'rest':
            this.rest();
            // Set the player's action to null
            this.action = null
            break;
          case 'move':
            this.move();
            this.action = null
            break;
          case 'attack':
            this.attack();
            this.action = null
            break;
        }
      }
    }
    // Else, decrement the countdown
    else
    {
      this.countdown -= deltaTime;
    }

    const physics = this.getComponent(Physics); // Get physics component
    
     // Handle collisions with walls
     const walls = this.game.tiles.filter((obj) => obj instanceof Wall);
     // If collision is enabled
     if(!this.isGhost)
     {
      // For each wall
      for (const wall of walls)
      {
        // If the player is colliding with a wall, bounce off of it
        if (physics.isColliding(wall.getComponent(Physics)))
        {
          this.bounce();
        }
      }
    }
  
    // Handle collisions with enemies
    const enemies = this.game.gameObjects.filter((obj) => obj instanceof Enemy);
    for (const enemy of enemies)
    {
      if (physics.isColliding(enemy.getComponent(Physics)))
      {
        this.collidedWithEnemy();
      }
    }

    // Scan the area around the player based on Intelligence
    this.scan(1 + this.stats[2]);

    // Call the update method of the superclass
    super.update(deltaTime);
  }

  // The endTurn function runs at the end of the turn
  endTurn()
  {
    // Make the directional indicators visible
    this.moveTo.changeVisibility(2);
    this.target.changeVisibility(2);
    const physics = this.getComponent(Physics)   // Get physics component
    // Set the player's velocity to 0
    physics.velocity.x = 0;
    physics.velocity.y = 0;
    // Re-enable collisions
    this.isGhost = false;

    // Call the endTurn method of the superclass
    super.endTurn();
  }

  // The move function handles how the player moves
  move()
  {
    const physics = this.getComponent(Physics); // Get physics component
    // give the player velocity necessary to move to the target tile
    physics.velocity.x = this.directionVector.x / this.game.timeToPause;
    physics.velocity.y = this.directionVector.y / this.game.timeToPause;
  }

  // The attack function handles how the player attacks
  attack()
  {
    // Calculate the damage based on the weapon's damage and the player's corresponding stat
    let damage = this.equipedWeapon.damage.min + Math.floor(Math.random() * (this.equipedWeapon.damage.max - this.equipedWeapon.damage.min + 1)) + this.stats[this.equipedWeapon.stat];
    // Create an attack object at the appropriate tile
    this.game.addGameObject(new Attack(this.x + this.attackVector.x, this.y + this.attackVector.y, '#ccc', null, this, damage, this.equipedWeapon.damageType));
  }

  // The rest function restores the player's stamina
  rest()
  {
    // If the player didn't take damage this turn
    if(this.resting == this.hp + this.stamina)
    {
      // Restore half of the player's stamina
      this.stamina += Math.ceil(this.maxStamina / 2);
      // If the player's stamina is greater than the max stamina, set it to the max stamina
      if(this.stamina > this.maxStamina)
      {
        this.stamina = this.maxStamina;
      }
    }
  }

  // The takeDamage method handles how the player takes damage (written entirely by co-pilot)
  takeDamage(damage, damageType)
  {
    // If the player is resistant to the damage type, halve the damage
    if(this.resistances.includes(damageType))
    {
      damage = Math.ceil(damage / 2);
    }
    // Else if the player is weak to the damage type, double the damage
    else if(this.weaknesses.includes(damageType))
    {
      damage *= 2;
    }
    // Subtract the damage from the player's stamina
    this.stamina -= damage;
    // If the player's stamina is less than 0, subtract the remainder from the player's hp and set the player's stamina to 0
    if(this.stamina < 0)
    {
      this.hp += this.stamina;
      this.stamina = 0;
      this.emitBloodParticles();
    }
    // If the player's hp is less than or equal to 0, display game over message and reload the page
    if(this.hp <= 0)
    {
      alert("Game Over!");
      location.reload();
    }
  }

  
  collidedWithEnemy()
  {
    // Checks collision with an enemy and reduce player's life if not invulnerable
    if (!this.isInvulnerable)
    {
      this.lives--;
      this.isInvulnerable = true;
      // Make player vulnerable again after 2 seconds
      setTimeout(() => {this.isInvulnerable = false;}, 2000);
    }
  }
  

  // The bounce function
  bounce()
  {
    // Disable collisions
    this.isGhost = true;
    // Give the player velocity necessary to reach the closest tile
    this.getComponent(Physics).velocity = { x: (Math.round(this.x) - this.x) / this.game.timeToPause, y: (Math.round(this.y) - this.y) / this.game.timeToPause };
  }

  // The scan method scans the area around the player and sets the visibility of objects accordingly
  scan(range)
  {
    // Get all tiles in game
    var objects = this.game.tiles;
    // For each tile
    for (const obj of objects)
    {
      // If the tile is within the scan range, set its visibility to 2
      if(Math.sqrt((obj.x - this.x) * (obj.x - this.x) + (obj.y - this.y) * (obj.y - this.y)) < range)
      {
        if(obj.visibility < 2)
        {
          obj.changeVisibility(2);
        }
      }
      // Else if the tile was previously visible, set its visibility to 1
      else if (obj.visibility == 2)
      {
        obj.changeVisibility(1);
      }
    }

    // Get all gameObjects in game
    objects = this.game.gameObjects;
    // For each gameObject
    for (const obj of objects)
    {
      // If the gameObject is within the scan range, set its visibility to 2
      if(Math.sqrt((obj.x - this.x) * (obj.x - this.x) + (obj.y - this.y) * (obj.y - this.y)) <  range)
      {
        obj.visibility = 2;
      }
      // Else if the gameObject was previously visible, set its visibility to 1
      else if (obj.visibility > 0)
      {
        obj.visibility = 1;
      }

      // If the gameObject is an enemy, set the visibility of its movement indicator and target indicator to one lower
      if(obj instanceof Enemy)
      {
        obj.moveTo.changeVisibility(obj.visibility - 1);
        obj.target.changeVisibility(obj.visibility - 1);
      }
    }
  }
  
  emitBloodParticles()
  {
    // Create a particle system at the player's position they take health damage
    const particleSystem = new ParticleSystem(this.x + .5, this.y + .5, '#800', 20, .1, 0.05);
    this.game.addGameObject(particleSystem);
  }

  resetPlayerState(x, y)
  {
    // Reset the player's state, repositioning it and nullifying movement
    this.x = x;
    this.y = y;
    this.getComponent(Physics).velocity = { x: 0, y: 0 };
    this.getComponent(Physics).acceleration = { x: 0, y: 0 };
    this.direction = 1;
  }
}

export default Player;
