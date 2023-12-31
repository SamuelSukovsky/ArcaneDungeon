import GameObject from '../engine/gameobject.js';
import UItext from '../engine/uitext.js';
import Player from './player.js';

// The PlayerUI class extends GameObject.
class PlayerUI extends GameObject
{
  constructor(x, y)
  {
    super(x, y); // Call the constructor of the GameObject class.

    // Create UI components with initial text and add it to this object's components.
    this.strengthDisplay = new UItext('Strength: 3', x, y, '20px Arial', '#c00');
    this.addComponent(this.strengthDisplay);
    this.agilityDisplay = new UItext('Agility: 3', x, y + 22, '20px Arial', '#0c0');
    this.addComponent(this.agilityDisplay);
    this.intelligenceDisplay = new UItext('Intelligence: 3', x, y + 44, '20px Arial', '#00c');
    this.addComponent(this.intelligenceDisplay);

    this.staminaBar = new UItext('Stamina: 9/9', x, y + 44, '30px Arial', '#AA0');
    this.addComponent(this.staminaBar);
    this.healthBar = new UItext('Health: 30/30', x, y + 22, '30px Arial', '#A00');
    this.addComponent(this.healthBar);
    this.player;
    this.visibility = 2;
  }

  start()
  {
    // Find the player object in the game's gameObjects array.
    this.player = this.game.gameObjects.find((obj) => obj instanceof Player);

    // Update the text of the UI components to reflect the player's stats.
    this.strengthDisplay.setText(`Strength: ${this.player.stats[0]}`);
    this.agilityDisplay.setText(`Agility: ${this.player.stats[1]}`);
    this.intelligenceDisplay.setText(`Intelligence: ${this.player.stats[2]}`);
    
    // Update the text of the UI components to reflect the player's health and stamina.
    this.staminaBar.setText(`Stamina: ${this.player.stamina}/${this.player.maxStamina}`);
    this.healthBar.setText(`Health: ${this.player.hp}/${this.player.maxhp}`);

    // Get the canvas height.
    const height = this.game.canvas.height;

    // Set the y-coordinate of the stamina and health bars to be at the bottom of the screen.
    this.staminaBar.y = height - 64;
    this.healthBar.y = height - 32;
  }
  // The update method is called every frame.
  update(deltaTime)
  {
    // Update the text of the UI components to reflect the player's stats.
    this.strengthDisplay.setText(`Strength: ${this.player.stats[0]}`);
    this.agilityDisplay.setText(`Agility: ${this.player.stats[1]}`);
    this.intelligenceDisplay.setText(`Intelligence: ${this.player.stats[2]}`);
    
    // Update the text of the UI components to reflect the player's health and stamina.
    this.staminaBar.setText(`Stamina: ${this.player.stamina}/${this.player.maxStamina}`);
    this.healthBar.setText(`Health: ${this.player.hp}/${this.player.maxhp}`);

    // Set the visibility of the UI to 2 so it is always drawn.
    this.visibility = 2;
  }
}

export default PlayerUI; // Export the PlayerUI class for use in other modules.
