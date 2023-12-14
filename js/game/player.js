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
    this.pointAt = new Tile(0, 0, 'red');
    // Initialize all the player specific properties
    this.direction = 1;
    this.lives = 3;
    this.score = 0;
    this.agility = 3;
    this.directionVector = { x: 0, y: 0};

    this.isJumping = false;
    this.jumpForce = 400;
    this.jumpTime = 0.3;
    this.jumpTimer = 0;
    this.isInvulnerable = false;
    this.isGamepadMovement = false;
    this.isGamepadJump = false;
  }

  checkInput()
  {
    const physics = this.getComponent(Physics); // Get physics component
    const input = this.getComponent(Input); // Get input component

    this.handleGamepadInput(input);
    const speed = 4;
    var action = false;
    
    this.directionVector = { x: input.mousePos.x, y: input.mousePos.y };
    let distance = Math.sqrt(this.directionVector.x * this.directionVector.x + this.directionVector.y * this.directionVector.y)
    if(distance > this.agility * speed * 16)
    {
      this.directionVector = { x: Math.floor(this.directionVector.x / distance * this.agility * 64), y: Math.floor(this.directionVector.y / distance * this.agility * 64) };
    }
    this.directionVector = { x: Math.floor((this.directionVector.x + 32) / 64), y: Math.floor((this.directionVector.y + 32) / 64) };
    this.pointAt.moveTo(this.x + this.directionVector.x, this.y + this.directionVector.y);

    if(input.isMouseDown(0))
    {
      physics.velocity.x = this.directionVector.x * speed;
      physics.velocity.y = this.directionVector.y * speed;
      this.direction = -this.directionVector.x / Math.abs(this.directionVector.x);
      action = true;
    }

    return action;
  }

  // The update function runs every frame and contains game logic
  update(deltaTime, timeToPause)
  {
    const physics = this.getComponent(Physics); // Get physics component
    
    // Handle player jumping
    /* if (!this.isGamepadJump && input.isKeyDown('ArrowUp'))
    {
      this.startJump();
    } */

    if (this.isJumping)
    {
      this.updateJump(deltaTime);
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

  startJump()
  {
    // Initiate a jump
      this.isJumping = true;
      this.jumpTimer = this.jumpTime;
      this.getComponent(Physics).velocity.y = -this.jumpForce;
  }
  
  updateJump(deltaTime)
  {
    // Updates the jump progress over time
    this.jumpTimer -= deltaTime;
    if (this.jumpTimer <= 0 || this.getComponent(Physics).velocity.y > 0)
    {
      this.isJumping = false;
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
