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
    this.moveTo = new Tile(-10, -10, 'red');
    this.attack = new Tile(-10, -10, '#bbb');
    // Initialize all the player specific properties
    this.direction = 1;
    this.lives = 3;
    this.score = 0;
    this.speed = 4;
    this.directionVector = { x: 0, y: 0};
    this.isGhost = false;
    
    this.baseStat = 3;
    this.stats = [];
    this.statIncrease = [1, 2];
    
    this.equipedWeapon = new Weapon({ min: 7, max: 9 }, 0, 'sharp', 1);
    this.attackVector = { x: 0, y: 0};

    this.maxHP = 30;
    this.hp = 30;
    
    this.isGamepadMovement = false;
    this.isGamepadJump = false;
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

    this.maxHP = this.stats[0] * 10;
    this.hp = this.maxHP;

    this.game.addTile(this.moveTo);
    this.game.addTile(this.attack);
  }

  checkInput()
  {
    const physics = this.getComponent(Physics); // Get physics component
    const input = this.getComponent(Input); // Get input component

    this.handleGamepadInput(input);
    var action = false;
    
    this.directionVector = { x: input.mousePos.x, y: input.mousePos.y };
    let distance = Math.sqrt(this.directionVector.x * this.directionVector.x + this.directionVector.y * this.directionVector.y)
    if(distance > this.stats[1] * this.speed * 8)
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
    this.attack.moveTo(this.x + this.attackVector.x, this.y + this.attackVector.y);

    if(input.isMouseDown(0))
    {
      physics.velocity.x = this.directionVector.x * this.speed;
      physics.velocity.y = this.directionVector.y * this.speed;
      this.direction = -this.directionVector.x / Math.abs(this.directionVector.x);
      this.attack.moveTo(-10, -10)
      action = true;
    }

    if(input.isMouseDown(2))
    {
      this.moveTo.moveTo(-10, -10);
      let damage = this.equipedWeapon.damage.min + Math.floor(Math.random() * (this.equipedWeapon.damage.max - this.equipedWeapon.damage.min));
      this.game.addGameObject(new Attack(this.x + this.attackVector.x, this.y + this.attackVector.y, '#ccc', null, this, damage, this.equipedWeapon.damageType));

      action = true;
    }

    return action;
  }

  // The update function runs every frame and contains game logic
  update(deltaTime)
  {
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

  handleGamepadInput(input)
  {
    const gamepad = input.getGamepad(); // Get the gamepad input
    const physics = this.getComponent(Physics); // Get physics component
    if (gamepad)
    {
      // Reset the gamepad flags
      this.isGamepadMovement = false;
      this.isGamepadJump = false;

      // Handle movement
      const horizontalAxis = gamepad.axes[0];
      // Move right
      if (horizontalAxis > 0.1)
      {
        this.isGamepadMovement = true;
        physics.velocity.x = 100;
        this.direction = -1;
      } 
      // Move left
      else if (horizontalAxis < -0.1)
      {
        this.isGamepadMovement = true;
        physics.velocity.x = -100;
        this.direction = 1;
      } 
      // Stop
      else
      {
        physics.velocity.x = 0;
      }
      
      // Handle jump, using gamepad button 0 (typically the 'A' button on most gamepads)
      if (input.isGamepadButtonDown(0))
      {
        this.isGamepadJump = true;
        this.startJump();
      }
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
