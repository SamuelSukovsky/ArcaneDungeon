// Importing necessary components and resources
import GameObject from '../engine/gameobject.js';
import Renderer from '../engine/renderer.js';
import Physics from '../engine/physics.js';
import Input from '../engine/input.js';
import { Images } from '../engine/resources.js';
import Enemy from './enemy.js';
import Collectible from './collectible.js';
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
    this.moveTo = new Tile(-10, -10, '#800000', '#800000');
    this.target = new Tile(-10, -10, '#999', '#999');
    // Initialize all the player specific properties
    this.direction = 1;
    this.lives = 3;
    this.score = 0;
    this.directionVector = { x: 0, y: 0};
    this.isGhost = false;
    this.visibility = 2;
    
    this.baseStat = 3;
    this.stats = [];
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

  start()
  {
    this.stats = [this.baseStat, this.baseStat, this.baseStat];
    while(this.statIncrease.length > 0)
    {
      let index = Math.floor(Math.random() * 3);
      if(this.stats[index] == this.baseStat)
      {
        this.stats[index] += this.statIncrease.shift();
      }
    }

    this.maxhp = this.stats[0] * 10;
    this.hp = this.maxhp;
    this.maxStamina = this.stats[1] * 3;
    this.stamina = this.maxStamina;

    this.game.addTile(this.moveTo);
    this.moveTo.changeVisibility(2);
    this.game.addTile(this.target);
    this.target.changeVisibility(2);

    this.scan(1 + this.stats[2])
  }

  checkInput()
  {
    const input = this.getComponent(Input); // Get input component
    var action = false;
    
    this.directionVector = { x: input.mousePos.x, y: input.mousePos.y };
    let distance = Math.sqrt(this.directionVector.x * this.directionVector.x + this.directionVector.y * this.directionVector.y)
    if(distance > this.stats[1] * 8 / this.game.roundDuration)
    {
      this.directionVector = { x: Math.floor(this.directionVector.x / distance * this.stats[1] * 32), y: Math.floor(this.directionVector.y / distance * this.stats[1] * 32) };
    }
    this.directionVector = { x: Math.floor((this.directionVector.x + 32) / 64), y: Math.floor((this.directionVector.y + 32) / 64) };
    this.moveTo.moveTo(this.x + this.directionVector.x, this.y + this.directionVector.y);
    
    this.attackVector = { x: input.mousePos.x, y: input.mousePos.y };
    distance = Math.sqrt(this.attackVector.x * this.attackVector.x + this.attackVector.y * this.attackVector.y)
    if(distance > this.equipedWeapon.range)
    {
      this.attackVector = { x: this.attackVector.x / distance * this.equipedWeapon.range, y: this.attackVector.y / distance * this.equipedWeapon.range };
    }
    this.attackVector = { x: Math.floor(this.attackVector.x + .5), y: Math.floor(this.attackVector.y + .5) };
    this.target.moveTo(this.x + this.attackVector.x, this.y + this.attackVector.y);

    if(input.isMouseDown(0))
    {
      if(this.directionVector.x == 0 && this.directionVector.y == 0)
      {
        this.target.moveTo(-10, -10);
        this.countdown = this.game.roundDuration - .02;
        this.resting = this.hp + this.stamina;
        this.action = 'rest';
      }
      else
      {
        this.direction = -this.directionVector.x / Math.abs(this.directionVector.x);
        this.target.moveTo(-10, -10);
        this.countdown = this.game.roundDuration * (1 / (this.stats[1] + 2));
        this.action = 'move';
      }
      action = true;
    }
    else if(input.isMouseDown(2))
    {
      this.moveTo.moveTo(-10, -10);
      this.countdown = this.game.roundDuration * (3 / (this.stats[this.equipedWeapon.stat] + 2));
      this.action = 'attack';
      action = true;
    }

    return action;
  }

  // The update function runs every frame and contains game logic
  update(deltaTime)
  {
    if(this.countdown <= 0)
    {
      if(this.action != null)
      {
        switch(this.action)
        {
          case 'rest':
            this.rest();
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
    else
    {
      this.countdown -= deltaTime;
    }

    const physics = this.getComponent(Physics); // Get physics component
    
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

    // Handle collisions with collectibles
    const collectibles = this.game.gameObjects.filter((obj) => obj instanceof Collectible);
    for (const collectible of collectibles)
    {
      if (physics.isColliding(collectible.getComponent(Physics)))
      {
        this.collect(collectible);
        this.game.removeGameObject(collectible);
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

    // Check if player has collected all collectibles
    if (this.score >= 3)
    {
      console.log('You win!');
    }

    this.scan(1 + this.stats[2])
    this.moveTo.changeVisibility(2);
    this.target.changeVisibility(2);

    super.update(deltaTime);
  }

  endTurn()
  {
    const physics = this.getComponent(Physics)
    physics.velocity.x = 0;
    physics.velocity.y = 0;
    this.isGhost = false;

    super.endTurn();
  }

  move()
  {
    const physics = this.getComponent(Physics); // Get physics component
    physics.velocity.x = this.directionVector.x / this.game.timeToPause;
    physics.velocity.y = this.directionVector.y / this.game.timeToPause;
  }

  attack()
  {
    let damage = this.equipedWeapon.damage.min + Math.floor(Math.random() * (this.equipedWeapon.damage.max - this.equipedWeapon.damage.min + 1)) + this.stats[this.equipedWeapon.stat];
    this.game.addGameObject(new Attack(this.x + this.attackVector.x, this.y + this.attackVector.y, '#ccc', null, this, damage, this.equipedWeapon.damageType));
  }

  rest()
  {
    if(this.resting == this.hp + this.stamina)
    {
      this.stamina += Math.ceil(this.maxStamina / 2);
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
    // Subtract the damage from the enemy's hp
    this.stamina -= damage;
    if(this.stamina < 0)
    {
      this.hp += this.stamina;
      this.stamina = 0;
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

  collect(collectible)
  {
    // Handle collectible pickup
    this.score += collectible.value;
    console.log(`Score: ${this.score}`);
    this.emitCollectParticles(collectible);
  }

  bounce()
  {
    this.isGhost = true;
    this.getComponent(Physics).velocity = { x: (Math.round(this.x) - this.x) / this.game.timeToPause, y: (Math.round(this.y) - this.y) / this.game.timeToPause };
  }

  scan(range)
  {
    var objects = this.game.tiles;
    for (const obj of objects)
    {
      if(Math.sqrt((obj.x - this.x) * (obj.x - this.x) + (obj.y - this.y) * (obj.y - this.y)) <  range)
      {
        obj.changeVisibility(2);
      }
      else if (obj.visibility > 0)
      {
        obj.changeVisibility(1);
      }
    }
    objects = this.game.gameObjects;
    for (const obj of objects)
    {
      if(Math.sqrt((obj.x - this.x) * (obj.x - this.x) + (obj.y - this.y) * (obj.y - this.y)) <  range)
      {
        obj.visibility = 2;
      }
      else if (obj.visibility > 0)
      {
        obj.visibility = 1;
      }

      if(obj instanceof Enemy)
      {
        obj.moveTo.changeVisibility(obj.visibility - 1);
        obj.target.changeVisibility(obj.visibility - 1);
      }
    }
  }
  
  emitCollectParticles()
  {
    // Create a particle system at the player's position when a collectible is collected
    const particleSystem = new ParticleSystem(this.x, this.y, 'yellow', 20, 1, 0.5);
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
    this.isJumping = false;
    this.jumpTimer = 0;
  }

  resetGame()
  {
    // Reset the game state, which includes the player's state
    this.lives = 3;
    this.score = 0;
    this.resetPlayerState();
  }
}

export default Player;
