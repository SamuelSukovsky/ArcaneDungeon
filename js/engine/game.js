// This class depends on the Camera, which is a separate module and needs to be imported.
import Camera from './camera.js';
import Player from '../game/player.js';

// The Game class is responsible for setting up and managing the main game loop.
class Game 
{
  // The constructor initializes a new instance of the Game class.
  constructor(canvasId)
  {
    // The canvas HTML element where the game will be drawn.
    this.canvas = document.getElementById(canvasId);
    // The 2D rendering context for the canvas, which is used for drawing.
    this.ctx = this.canvas.getContext('2d');
    // An array to hold all the tiles that are currently in the game.
    this.tiles = [];
    // An array to hold all the game objects that are currently in the game.
    this.gameObjects = [];
    // An array to hold game objects that are marked to be removed from the game.
    this.gameObjectsToRemove = [];
    // The time at which the last frame was rendered.
    this.lastFrameTime = 0;
    // The amount of time that passed between the last frame and the current frame.
    this.deltaTime = 0;
    // The game is paused by default.
    this.timeToPause = 0;
    this.roundDuration = .25;
    // Add an event listener to resize the canvas whenever the window size changes.
    window.addEventListener('resize', () => this.resizeCanvas());
    // Instantiate a new camera without a target and with dimensions equal to the canvas size.
    this.camera = new Camera(null, this.canvas.width, this.canvas.height);
    // Instantiate the player.
    this.player = new Player(0, 0);
    // Adjust the size of the canvas to match the window size.
    this.resizeCanvas();
  }

  // This method resizes the canvas to fill the window, with a small margin.
  resizeCanvas()
  {
    // Change the canvas dimensions to match the window dimensions.
    this.canvas.width = window.innerWidth - 50;
    this.canvas.height = window.innerHeight - 50;
    // Recenter the camera on the canvas.
    this.camera.width = this.canvas.width;
    this.camera.height = this.canvas.height;
  }

  // This method starts the game loop.
  start()
  {
    // Disable anti-aliasing to improve pixel art rendering.
    this.ctx.imageSmoothingEnabled = false;
    this.isRunning = true;
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  // The main game loop, which is called once per frame.
  gameLoop(currentFrameTime)
  {
    // Calculate the time passed since the last frame.
    this.deltaTime = (currentFrameTime - this.lastFrameTime) / 1000;
    // Update the last frame time.
    this.lastFrameTime = currentFrameTime;

    // If the game is between turns
    if(this.timeToPause <= 0)
    {
      // Check if the player has pressed a key
      if(this.player.checkInput())
      {
        // Unpause the game
        this.timeToPause = this.roundDuration;
        // Trigger the startTurn method of all game objects
        for (const gameObject of this.gameObjects)
        {
          gameObject.startTurn();
        }
      }
    }
    // Else
    else
    {
      // If the time to pause is less than the time passed since the last frame
      if(this.timeToPause <= this.deltaTime)
      {
        // Set deltaTime to the time remaining
        this.deltaTime = this.timeToPause;
        // Update all game objects and the camera.
        this.update();
        // Pause the game
        this.pause();
      }
      // Else
      else
      {
        // Update all game objects and the camera.
        this.update();
      }
      // Decrement the time to pause
      this.timeToPause -= this.deltaTime;
    }

    this.camera.update();
    // Draw the game objects on the canvas.
    this.draw();

    // Request the next animation frame, which will call this method again.
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  // This method updates all the game objects.
  update()
  {
    // Call each game object's update method with the delta time.
    for (const gameObject of this.gameObjects)
    {
      gameObject.update(this.deltaTime);
    }
    // Filter out game objects that are marked for removal.
    this.gameObjects = this.gameObjects.filter(obj => !this.gameObjectsToRemove.includes(obj));
    // Filter out tiles that are marked for removal.
    this.tiles = this.tiles.filter(obj => !this.gameObjectsToRemove.includes(obj));
    // Clear the list of game objects to remove.
    this.gameObjectsToRemove = [];
  }

  // This method calls end of turn methods of all game objects.
  pause()
  {
    // Call each game object's update method with the delta time.
    for (const gameObject of this.gameObjects)
    {
      gameObject.endTurn();
    }
    // Filter out game objects that are marked for removal.
    this.gameObjects = this.gameObjects.filter(obj => !this.gameObjectsToRemove.includes(obj));
    // Filter out tiles that are marked for removal.
    this.tiles = this.tiles.filter(obj => !this.gameObjectsToRemove.includes(obj));
    // Clear the list of game objects to remove.
    this.gameObjectsToRemove = [];
  }

  // This method draws all the game objects on the canvas.
  draw()
  {
    // Clear the entire canvas.
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Save the current state of the canvas and the context.
    this.ctx.save();
    // Translate the canvas by the negative of the camera's position. This makes the camera follow its target.
    this.ctx.translate(-this.camera.x, -this.camera.y);


    // Draw each tile on the canvas.
    for (const tile of this.tiles)
    {
      tile.draw(this.ctx);
    }
    // Draw each game object on the canvas.
    for (const gameObject of this.gameObjects)
    {
      gameObject.draw(this.ctx);
    }

    // Restore the canvas and context to their state before the camera translation.
    this.ctx.restore();
  }

  // This method adds a tile to the game.
  addTile(tile)
  {
    // Add the game object to the array of game objects.
    this.tiles.push(tile);
  }

  // This method adds a game object to the game.
  addGameObject(gameObject)
  {
    // Set the game object's game property to this game instance.
    gameObject.game = this;
    // Call the game object's start method.
    gameObject.start();
    // Add the game object to the array of game objects.
    this.gameObjects.push(gameObject);
  }

  // This method marks a game object for removal from the game.
  removeGameObject(gameObject)
  {
    // Add the game object to the array of game objects to remove.
    this.gameObjectsToRemove.push(gameObject);
  }
}

// The Game class is then exported as the default export of this module.
export default Game;
